import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1. GRAVAÇÃO (Corrigido para nomes físicos do banco)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        // Usamos (schema.pessoas as any) e nomes com UNDERLINE
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliaria_id: imobiliariaId, // <--- NOME REAL NO POSTGRES
          })
          .returning();

        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoa_id: novaPessoa.id, // <--- NOME REAL NO POSTGRES
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          });
        }
        return novaPessoa;
      });
    } catch (e: any) {
      console.error('❌ Erro fatal:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // 2. BUSCA PARA O GRID (Também usando underline)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      const results = await this.db
        .select()
        .from(table)
        .where(
          and(
            eq(table.imobiliaria_id, imobiliariaId), // <--- NOME REAL NO POSTGRES
            eq(table.papel, papel),
            search ? ilike(table.nome, `%${search}%`) : undefined,
          ),
        );
      return results;
    } catch (error) {
      return [];
    }
  }

  // (Mantenha os métodos findImobiliariaByHost e findOne que já funcionam)
}
