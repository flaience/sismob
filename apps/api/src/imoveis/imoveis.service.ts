import {
  Injectable,
  Inject,
  InternalServerErrorException,
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
    private filesService: FilesService,
  ) {}

  async createWithImages(
    dto: any,
    files: Express.Multer.File[],
    userId: string,
  ) {
    try {
      return await this.db.transaction(async (tx) => {
        // 1. Buscar a imobiliária usando select tradicional (mais estável que query)
        const usuariosFiltrados = await tx
          .select()
          .from(schema.pessoas as any)
          .where(eq(schema.pessoas.id as any, userId))
          .limit(1);

        const usuario = usuariosFiltrados[0];

        if (!usuario || !usuario.imobiliariaId) {
          throw new Error('Usuário não vinculado a uma imobiliária.');
        }

        // 2. Inserir o Imóvel
        const [novoImovel] = await (tx.insert(schema.imoveis as any) as any)
          .values({
            titulo: dto.titulo,
            descricao: dto.descricao,
            tipo: dto.tipo,
            status: dto.status || 'disponivel',
            imobiliariaId: usuario.imobiliariaId,
            proprietarioId: dto.proprietarioId,
            precoVenda: dto.precoVenda?.toString(),
            precoAluguel: dto.precoAluguel?.toString(),
            areaPrivativa: dto.areaPrivativa?.toString(),
            enderecoOriginal: dto.enderecoOriginal,
            lat: dto.lat?.toString() || '0',
            lng: dto.lng?.toString() || '0',
            tourVirtualUrl: dto.tourVirtualUrl,
          })
          .returning();

        // 3. Salvar Infraestrutura
        await tx.insert(schema.infraestrutura as any).values({
          imovelId: novoImovel.id,
          temAguaQuente: dto.temAguaQuente === 'true',
          temEsperaSplit: dto.temEsperaSplit === 'true',
          mobiliado: dto.mobiliado === 'true',
        } as any);

        // 4. Upload e registro de Mídias
        if (files && files.length > 0) {
          for (const [index, file] of files.entries()) {
            const url = await this.filesService.uploadFoto(
              file,
              `imoveis/${novoImovel.id}`,
            );

            // Verifica se o arquivo atual foi marcado como 360
            const e360 = dto.is360?.includes(file.originalname);

            await tx.insert(schema.midiaImovel as any).values({
              imovelId: novoImovel.id,
              url: url,
              tipo: e360 ? 'foto_360' : 'foto_interna',
              isCapa: index === 0,
              ordem: index,
            } as any);
          }
        }

        // 5. Salvar Instruções de Chegada
        if (dto.instrucoes) {
          try {
            const instrucoes =
              typeof dto.instrucoes === 'string'
                ? JSON.parse(dto.instrucoes)
                : dto.instrucoes;
            if (Array.isArray(instrucoes) && instrucoes.length > 0) {
              const dataIns = instrucoes.map((ins: any) => ({
                imovelId: novoImovel.id,
                ordem: ins.ordem,
                titulo: ins.titulo,
                descricao: ins.descricao,
                fotoUrl: ins.fotoUrl,
              }));
              await tx.insert(schema.instrucoesChegada as any).values(dataIns);
            }
          } catch (e) {
            console.warn(
              '⚠️ Falha ao processar instruções de chegada:',
              e.message,
            );
          }
        }

        return { message: 'Imóvel cadastrado com sucesso!', id: novoImovel.id };
      });
    } catch (error) {
      console.error('❌ ERRO NO CADASTRO:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(imobiliariaId: string) {
    try {
      // Usamos 'as any' para ignorar a trava de tipos do monorepo
      return await this.db
        .select()
        .from(schema.imoveis as any)
        .where(eq((schema.imoveis as any).imobiliariaId, imobiliariaId));
    } catch (error) {
      console.error('❌ Erro ao buscar imóveis:', error);
      throw new InternalServerErrorException('Erro ao listar imóveis.');
    }
  }
}
