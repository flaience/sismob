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
      // O select() vazio força o Drizzle a buscar TODAS as colunas
      // que estão declaradas no seu schema.ts acima.
      return await this.db
        .select()
        .from(schema.imoveis as any)
        .where(eq((schema.imoveis as any).imobiliariaId, imobiliariaId));
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
      // LOG DE DIAGNÓSTICO: Isso aparecerá no Railway
      console.log('📡 Dados brutos recebidos no DTO:', dto);

      return await this.db.transaction(async (tx) => {
        const tipoLimpo = String(dto.tipo).split(',')[0];
        const proprietarioIdLimpo = String(dto.proprietarioId).split(',')[0];

        const isUpdate = !!dto.id && dto.id !== 'undefined';
        let idImovel = isUpdate ? Number(dto.id) : null;

        // MAPA DE GRAVAÇÃO (Usando nomes literais das colunas do banco)
        const dadosBase = {
          titulo: dto.titulo,
          descricao: dto.descricao || '',
          tipo: tipoLimpo,
          status: 'disponivel',
          imobiliaria_id: imobiliariaId, // <--- Use com underline para garantir
          proprietario_id: proprietarioIdLimpo, // <--- Use com underline
          preco_venda: dto.precoVenda?.toString() || '0',
          area_privativa: dto.areaPrivativa?.toString() || '0',
          endereco_original: dto.enderecoOriginal || 'Não informado',

          // O SEGREDO DA VITÓRIA:
          video_url: dto.videoUrl || null, // <--- Force o nome físico da coluna

          lat: dto.lat?.toString() || '0',
          lng: dto.lng?.toString() || '0',
        };

        if (isUpdate) {
          await tx
            .update(schema.imoveis as any)
            .set(dadosBase as any)
            .where(eq((schema.imoveis as any).id, idImovel));
        } else {
          const [novo] = await (tx.insert(schema.imoveis as any) as any)
            .values(dadosBase as any)
            .returning();
          idImovel = novo.id;
        }

        // 3. GRAVAÇÃO DA INFRAESTRUTURA
        const infraDados = {
          imovelId: idImovel,
          temAguaQuente: String(dto.temAguaQuente) === 'true',
          temEsperaSplit: String(dto.temEsperaSplit) === 'true',
          mobiliado: String(dto.mobiliado) === 'true',
        };

        // Deletamos a infra antiga e criamos a nova (estratégia mais limpa para Upsert)
        await tx
          .delete(schema.infraestrutura as any)
          .where(eq((schema.infraestrutura as any).imovelId, idImovel));
        await tx.insert(schema.infraestrutura as any).values(infraDados);

        // 4. PROCESSAMENTO DE MÍDIAS (FOTOS E TOUR 360)
        if (allFiles && allFiles.length > 0) {
          for (const file of allFiles) {
            // Upload para o Supabase via seu FilesService
            const url = await this.filesService.uploadFoto(
              file,
              `imoveis/${idImovel}`,
            );

            // A Lógica de Separação sugerida por você:
            const eh360 = file.fieldname === 'foto360';
            const ehCapa = file.originalname === dto.capaNome;

            await (tx.insert(schema.midiaImovel as any) as any).values({
              imovelId: idImovel,
              url: url,
              tipo: eh360 ? 'foto_360' : 'foto_interna',
              isCapa: ehCapa,
            });
          }
        }

        return {
          id: idImovel,
          message: isUpdate ? 'Imóvel atualizado!' : 'Imóvel cadastrado!',
        };
      });
    } catch (e) {
      console.error('❌ Erro no Upsert do Imóvel:', e.message);
      throw new InternalServerErrorException(`Falha ao salvar: ${e.message}`);
    }
  }

  async remove(id: number, imobiliariaId: string) {
    try {
      // Deleta garantindo que o imóvel pertence àquela imobiliária
      const result = await this.db
        .delete(schema.imoveis as any)
        .where(
          and(
            eq((schema.imoveis as any).id, id),
            eq((schema.imoveis as any).imobiliariaId, imobiliariaId),
          ),
        );

      return { message: 'Imóvel removido com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao deletar imóvel:', error.message);
      throw new InternalServerErrorException('Falha ao excluir o registro.');
    }
  }
}
