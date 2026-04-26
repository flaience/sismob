import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { GenericService } from './generic.service';

@Controller('factory')
export class GenericController {
  constructor(private readonly generic: GenericService) {}

  @Get(':table')
  async list(
    @Param('table') table: string,
    @Query('imobiliariaId') tid: string,
    @Query('search') s: string,
    @Query() filters: any, // Captura filtros como ?papel=3
  ) {
    return this.generic.findAll(table, tid, s, filters);
  }

  @Post(':table')
  async save(@Param('table') table: string, @Body() dto: any) {
    // imobiliariaId vem do TenantContext no Frontend
    return this.generic.upsert(table, dto, dto.imobiliariaId);
  }

  @Delete(':table/:id')
  async remove(
    @Param('table') table: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tid: string,
  ) {
    return this.generic.remove(table, Number(id), tid);
  }
}
