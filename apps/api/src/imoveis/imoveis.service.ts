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
    private filesService: FilesService, // Serviço que criamos para o Supabase Storage
  ) {}

  /**
   * BUSCA DE IMÓVEIS (PÚBLICA)
   * Filtra automaticamente pela imobiliária identificada pelo domínio
   */
  async findAll(imobiliariaId: string) {
    try {
      // Usamos a Query API do Drizzle com casting para evitar erros de tipo no Monorepo
      const queryApi = this.db.query as any;

      return await queryApi.imoveis.findMany({
        where: eq(schema.imoveis.imobiliariaId as any, imobiliariaId),
        with: {
          midias: true,
          infraestrutura: true,
          instrucoes: true,
          proprietario: true,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao buscar imóveis:', error.message);
      throw new InternalServerErrorException('Erro ao listar imóveis.');
    }
  }

  /**
   * CRIAÇÃO DE IMÓVEL COM IMAGENS (RESTRITA)
   * Salva o imóvel, faz upload das fotos e vincula os percursos
   */
  async createWithImages(dto: any, files: any[], userId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        // 1. Identificar a imobiliária do corretor que está logado
        const usuarios = await tx
          .select()
          .from(schema.pessoas as any)
          .where(eq(schema.pessoas.id as any, userId))
          .limit(1);

        const corretor = usuarios[0];
        if (!corretor || !corretor.imobiliariaId) {
          throw new Error('Corretor não possui imobiliária vinculada.');
        }

        // 2. Salvar o registro principal do Imóvel
        const [novoImovel] = await (tx.insert(schema.imoveis as any) as any)
          .values({
            titulo: dto.titulo,
            descricao: dto.descricao,
            tipo: dto.tipo,
            status: dto.status || 'disponivel',
            imobiliariaId: corretor.imobiliariaId,
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

        // 3. Salvar Infraestrutura (AC, Água Quente, etc)
        await (tx.insert(schema.infraestrutura as any) as any).values({
          imovelId: novoImovel.id,
          temAguaQuente: dto.temAguaQuente === 'true',
          temEsperaSplit: dto.temEsperaSplit === 'true',
          mobiliado: dto.mobiliado === 'true',
        });

        // 4. Processar Upload de Fotos para o Supabase Storage
        if (files && files.length > 0) {
          for (const [index, file] of files.entries()) {
            // Upload via FilesService
            const url = await this.filesService.uploadFoto(
              file,
              `imoveis/${novoImovel.id}`,
            );

            // Verifica se o front-end marcou esta foto como sendo a 360
            const ehFoto360 = dto.is360?.includes(file.originalname);

            await (tx.insert(schema.midiaImovel as any) as any).values({
              imovelId: novoImovel.id,
              url: url,
              tipo: ehFoto360 ? 'foto_360' : 'foto_interna',
              isCapa: index === 0, // A primeira foto sempre será a capa por padrão
              ordem: index,
            });
          }
        }

        // 5. Salvar Instruções de Percurso (Auxílio de Chegada)
        if (dto.instrucoes) {
          const instrucoesRaw =
            typeof dto.instrucoes === 'string'
              ? JSON.parse(dto.instrucoes)
              : dto.instrucoes;
          if (Array.isArray(instrucoesRaw) && instrucoesRaw.length > 0) {
            const dataIns = instrucoesRaw.map((ins: any) => ({
              imovelId: novoImovel.id,
              ordem: ins.ordem,
              titulo: ins.titulo,
              descricao: ins.descricao,
            }));
            await (tx.insert(schema.instrucoesChegada as any) as any).values(
              dataIns,
            );
          }
        }

        return {
          message: 'Imóvel e Diferenciais criados com sucesso!',
          id: novoImovel.id,
        };
      });
    } catch (error) {
      console.error('❌ ERRO NO PROCESSO DE CADASTRO:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
