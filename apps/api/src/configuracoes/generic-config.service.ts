import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class GenericConfigService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async findAll(tableName: string, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      if (!table) return [];

      // SEGREDO INDUSTRIAL: Verifica se a tabela tem a coluna tenant_id
      // Se não tiver (como era o caso do atributos), ele não tenta filtrar e não dá erro de sintaxe
      if (!table.tenant_id) {
        console.error(
          `❌ [SISMOB] A tabela ${tableName} está sem a coluna tenant_id no Schema!`,
        );
        return this.db.select().from(table); // Busca sem filtro apenas para teste
      }

      return await this.db
        .select()
        .from(table)
        .where(eq(table.tenant_id, tenantId));
    } catch (e: any) {
      console.error(
        `❌ [SISMOB ERROR] Erro na busca da tabela ${tableName}:`,
        e.message,
      );
      return [];
    }
  }
  async upsert(tableName: string, dto: any, tenantId: string) {
    // LOG DE PROVA: Verifique isso no Railway!
    console.log(
      `🚀 [SISMOB v231] Tabela: ${tableName} | ID do Luis: ${tenantId}`,
    );

    try {
      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} não localizada.`);

      // 1. LIMPEZA RADICAL
      const { id, created_at, updated_at, imobiliariaId, ...dadosPuros } = dto;

      // 2. MONTAGEM DO OBJETO DE FORMA EXPLÍCITA
      // Usamos [table.tenant_id.name] para garantir que pegamos o nome da coluna física
      const payload: any = {
        ...dadosPuros,
        tenant_id: tenantId, // <--- FORÇA O NOME QUE ESTÁ NO SCHEMA
        updated_at: new Date(),
      };

      // 3. TRATAMENTO DE ATRIBUTOS
      if (tableName === 'atributos') {
        payload.quantidade = Number(dto.quantidade || 1);
        payload.categoria_id = Number(dto.categoria_id);
      }

      // LOG DO COMANDO: Veja se o tenant_id aparece aqui no console do Railway!
      console.log(`🏭 [SISMOB v231] Payload Final:`, JSON.stringify(payload));

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // 4. INSERT USANDO 'any' PARA IGNORAR O CACHE DO SCHEMA
        const [novo] = await (this.db
          .insert(table as any)
          .values(payload)
          .returning() as any);
        return novo;
      }
    } catch (e: any) {
      console.error(`❌ [DB ERROR v231]:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }
  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
