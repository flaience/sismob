import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, desc } from 'drizzle-orm';
import { FilesService } from '../files/files.service';

@Injectable()
export class ImoveisService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
    @Inject(FilesService)
    private readonly filesService: FilesService,
  ) {}

  // 1. LISTAGEM COMPLETA
  async findAll(tenantId: string) {
    try {
      const queryApi = this.db.query as any;
      return await queryApi.imoveis.findMany({
        where: eq((schema.imoveis as any).tenant_id, tenantId),
        with: {
          midias: true,
          instrucoesChegada: true,
          atributos: { with: { atributo: true } },
        },
        orderBy: [desc((schema.imoveis as any).id)],
      });
    } catch (e) {
      console.error('❌ Erro no findAll Imoveis:', e.message);
      return [];
    }
  }

  // 2. BUSCA UM ÚNICO
  async findOne(id: number, tenantId: string) {
    const queryApi = this.db.query as any;
    const result = await queryApi.imoveis.findFirst({
      where: and(
        eq((schema.imoveis as any).id, id),
        eq((schema.imoveis as any).tenant_id, tenantId),
      ),
      with: { midias: true, instrucoesChegada: true, atributos: true },
    });
    if (!result) throw new NotFoundException('Imóvel não encontrado.');
    return result;
  }

  // 3. O "UPSERT" (GRAVAÇÃO E ALTERAÇÃO)
  async upsert(dto: any, files: any, tenantId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        const isUpdate = !!dto.id && dto.id !== 'undefined';
        let idImovel = isUpdate ? Number(dto.id) : null;

        const dadosImovel = {
          tenant_id: tenantId,
          titulo: dto.titulo,
          descricao: dto.descricao || '',
          tipo: dto.tipo || 'casa',
          status: dto.status || 'disponivel',
          preco_venda: dto.preco_venda?.toString() || '0',
          area_privativa: dto.area_privativa?.toString() || '0',
          endereco_original: dto.endereco_original || 'Não informado',
          video_url: dto.video_url || null,
          proprietario_id: dto.proprietario_id,
        };

        // A. GRAVA OU ATUALIZA O MASTER
        if (isUpdate) {
          await tx
            .update(schema.imoveis as any)
            .set(dadosImovel)
            .where(eq((schema.imoveis as any).id, idImovel as any));
        } else {
          const [novo] = await (tx.insert(schema.imoveis as any) as any)
            .values(dadosImovel)
            .returning();
          idImovel = novo.id;
        }

        // B. ATRIBUTOS (DELETE & INSERT)
        if (dto.atributosIds) {
          const ids = Array.isArray(dto.atributosIds)
            ? dto.atributosIds
            : [dto.atributosIds];
          await tx
            .delete(schema.imoveisAtributos as any)
            .where(
              eq((schema.imoveisAtributos as any).imovel_id, idImovel as any),
            );
          const novosAtributos = ids.map((atId: any) => ({
            imovel_id: idImovel,
            atributo_id: Number(atId),
          }));
          await (tx.insert(schema.imoveisAtributos as any) as any).values(
            novosAtributos,
          );
        }

        // C. MÍDIAS (UPLOAD E GRAVAÇÃO)
        const allFiles = [...(files?.galeria || []), ...(files?.foto360 || [])];
        for (const file of allFiles) {
          const url = await this.filesService.uploadFoto(
            file,
            `imoveis/${idImovel}`,
          );
          await (tx.insert(schema.midias as any) as any).values({
            imovel_id: idImovel,
            url,
            tipo: file.fieldname === 'foto360' ? 'foto_360' : 'foto',
            is_capa: file.originalname === dto.capaNome,
          });
        }

        return { id: idImovel, success: true };
      });
    } catch (e) {
      console.error('❌ Erro fatal no Upsert Imóvel:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // 4. REMOÇÃO
  async remove(id: number, tenantId: string) {
    try {
      await this.db
        .delete(schema.imoveis as any)
        .where(
          and(
            eq((schema.imoveis as any).id, id),
            eq((schema.imoveis as any).tenant_id, tenantId),
          ),
        );
      return { success: true };
    } catch (e) {
      throw new InternalServerErrorException('Erro ao remover imóvel.');
    }
  }
}
