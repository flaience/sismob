// apps/api/src/imoveis/imoveis.service.ts
import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@realstate/database';
import { CreateImovelDto } from './dto/create-imovel.dto';

@Injectable()
export class ImoveisService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(dto: CreateImovelDto) {
    try {
      return await this.db.transaction(async (tx) => {
        // 1. Salvar o Imóvel
        const [novoImovel] = await (tx.insert(schema.imoveis) as any)
          .values({
            titulo: dto.titulo,
            descricao: dto.descricao,
            tipo: dto.tipo,
            // IMPORTANTE: Decimal no Postgres exige String no JS
            precoVenda: dto.precoVenda.toString(),
            areaPrivativa: dto.areaPrivativa.toString(),
            endereco: dto.endereco,
            lat: dto.lat.toString(),
            lng: dto.lng.toString(),
            tourVirtualUrl: dto.tourVirtualUrl,
          })
          .returning();

        // 2. Salvar a Infraestrutura
        await tx.insert(schema.infraestrutura).values({
          imovelId: novoImovel.id,
          temAguaQuente: dto.infra.temAguaQuente,
          temEsperaSplit: dto.infra.temEsperaSplit,
          temChurrasqueira: dto.infra.temChurrasqueira,
          mobiliado: dto.infra.mobiliado,
        });

        // 3. Salvar Instruções de Chegada
        if (dto.instrucoes && dto.instrucoes.length > 0) {
          const instrucoesComId = dto.instrucoes.map((ins) => ({
            imovelId: novoImovel.id,
            ordem: ins.ordem,
            titulo: ins.titulo,
            descricao: ins.descricao,
            fotoUrl: ins.fotoUrl,
            latAlvo: ins.latAlvo.toString(),
            lngAlvo: ins.lngAlvo.toString(),
          }));
          await tx.insert(schema.instrucoesChegada).values(instrucoesComId);
        }

        return {
          message: 'Imóvel completo cadastrado com sucesso!',
          id: novoImovel.id,
        };
      });
    } catch (error) {
      // LOG DETALHADO NO TERMINAL
      console.error('❌ ERRO NO BANCO:', error.message);
      console.error('🔍 DETALHES:', error.detail || 'Sem detalhes adicionais');

      // RETORNA O ERRO REAL PARA O REST CLIENT
      throw new InternalServerErrorException(`Erro no Banco: ${error.message}`);
    }
  }

  async findAll() {
    return await this.db.query.imoveis.findMany({
      with: {
        infraestrutura: true,
        instrucoes: true,
      },
    });
  }
}
