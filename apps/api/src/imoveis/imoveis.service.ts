import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';
import { FilesService } from '../files/files.service';

@Injectable()
export class ImoveisService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,

    // USAMOS O @Inject AQUI PARA ELIMINAR O ERRO DE UNDEFINED
    @Inject(FilesService)
    private readonly filesService: FilesService,
  ) {}

  // BUSCA BÁSICA: Sem Joins complexos para garantir que o 500 suma
  async findAll(imobiliariaId: string) {
    try {
      if (!imobiliariaId) return [];

      // Usamos o query.findMany para trazer os 'filhos' (midias, infra, etc)
      const queryApi = this.db.query as any;

      const resultados = await queryApi.imoveis.findMany({
        where: eq(schema.imoveis.imobiliariaId as any, imobiliariaId),
        with: {
          midias: true, // <--- ISSO TRARÁ AS FOTOS PARA O CARD
          infraestrutura: true, // <--- ISSO TRARÁ OS ÍCONES
          instrucoes: true, // <--- ISSO TRARÁ O PERCURSO
        },
      });

      return resultados;
    } catch (error) {
      console.error('❌ Erro ao buscar imóveis com mídias:', error.message);
      return [];
    }
  }

  // GRAVAÇÃO RESILIENTE
  async createWithImages(dto: any, files: any[], imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        // 1. Inserir o Imóvel
        const [novoImovel] = await (tx.insert(schema.imoveis as any) as any)
          .values({
            titulo: dto.titulo,
            descricao: dto.descricao || '',
            tipo: dto.tipo || 'casa',
            status: 'disponivel',
            imobiliariaId: imobiliariaId,
            proprietarioId: dto.proprietarioId,
            precoVenda: dto.precoVenda ? dto.precoVenda.toString() : '0',
            areaPrivativa: dto.areaPrivativa
              ? dto.areaPrivativa.toString()
              : '0',
            enderecoOriginal: dto.enderecoOriginal || 'Não informado',
            lat: '0',
            lng: '0',
          })
          .returning();

        // 2. Tenta salvar mídias apenas se houver arquivos
        if (files && files.length > 0) {
          for (const [index, file] of files.entries()) {
            const url = await this.filesService.uploadFoto(
              file,
              `imoveis/${novoImovel.id}`,
            );
            const eh360 = dto.is360?.includes(file.originalname);

            await (tx.insert(schema.midiaImovel as any) as any).values({
              imovelId: novoImovel.id,
              url: url,
              tipo: eh360 ? 'foto_360' : 'foto_interna',
              isCapa: index === 0,
              ordem: index,
            });
          }
        }

        return novoImovel;
      });
    } catch (error) {
      console.error('❌ ERRO NO BANCO (Create):', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
