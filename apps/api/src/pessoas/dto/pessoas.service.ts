import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(dto: any) {
    return await this.db.insert(schema.pessoas).values(dto).returning();
  }

  async findAll() {
    return await this.db.query.pessoas.findMany();
  }
}
