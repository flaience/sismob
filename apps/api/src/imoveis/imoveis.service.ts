import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';
import { FilesService } from '../files/files.service';

@Injectable()
export class ImoveisService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
    @Inject(FilesService)
    private readonly filesService: FilesService,
  ) {}

  // LISTAGEM (Pública/Multi-tenant)
  async findAll(imobiliariaId: string) {
    try {
      const queryApi = this.db.query as any;
      return await queryApi.imoveis.findMany({
        where: eq((schema.imoveis as any).imobiliariaId, imobiliariaId),
        with: {
          midias: true,
          infraestrutura: true,
        },
      });
    } catch (error) {
      console.error('❌ Erro no findAll:', error.message);
      return [];
    }
  }

  // BUSCA POR ID (Para Edição)
  async findOne(id: number, imobiliariaId: string) {
    const queryApi = this.db.query as any;
    const result = await queryApi.imoveis.findFirst({
      where: and(
        eq((schema.imoveis as any).id, id),
        eq((schema.imoveis as any).imobiliariaId, imobiliariaId),
      ),
      with: { midias: true, infraestrutura: true, instrucoes: true },
    });
    if (!result) throw new NotFoundException('Imóvel não encontrado.');
    return result;
  }

  // UPSERT (Cria ou Atualiza com Mídia Separada)
  async upsertImovel(dto: any, allFiles: any[], imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        const isUpdate = !!dto.id;
        let idImovel = isUpdate ? Number(dto.id) : null;

        const dadosBase = {
          titulo: dto.titulo,
          descricao: dto.descricao,
          tipo: dto.tipo,
          imobiliariaId,
          proprietarioId: dto.proprietarioId,
          precoVenda: dto.precoVenda?.toString(),
          areaPrivativa: dto.areaPrivativa?.toString(),
          enderecoOriginal: dto.enderecoOriginal,
        };

        // 1. Grava ou Atualiza o Imóvel
        if (isUpdate) {
          await tx
            .update(schema.imoveis as any)
            .set(dadosBase)
            .where(eq((schema.imoveis as any).id, idImovel));
        } else {
          const [novo] = await (tx.insert(schema.imoveis as any) as any)
            .values(dadosBase)
            .returning();
          idImovel = novo.id;
        }

        // 2. Processa os Arquivos (Galeria e 360)
        if (allFiles && allFiles.length > 0) {
          for (const file of allFiles) {
            const url = await this.filesService.uploadFoto(
              file,
              `imoveis/${idImovel}`,
            );

            // Lógica de Separação sugerida por você:
            const eh360 = file.fieldname === 'foto360';
            const ehCapa = file.originalname === dto.capaNome;

            await (tx.insert(schema.midiaImovel as any) as any).values({
              imovelId: idImovel,
              url,
              tipo: eh360 ? 'foto_360' : 'foto_interna',
              isCapa: ehCapa,
            });
          }
        }

        return { id: idImovel, message: 'Sucesso!' };
      });
    } catch (e) {
      console.error('❌ Erro no Upsert:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }
}
