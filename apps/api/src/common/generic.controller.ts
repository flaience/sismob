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
    @Query('imobiliariaId') tenantId: string,
    @Query('search') search: string,
    @Query() filters: any,
  ) {
    return this.generic.findAll(table, tenantId, search, filters);
  }

  @Post(':table')
  async create(@Param('table') table: string, @Body() dto: any) {
    return this.generic.upsert(table, dto, dto.imobiliariaId);
  }

  @Patch(':table/:id')
  async update(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.generic.upsert(
      table,
      {
        ...dto,
        id: Number(id),
      },
      dto.imobiliariaId,
    );
  }

  @Delete(':table/:id')
  async remove(
    @Param('table') table: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tenantId: string,
  ) {
    return this.generic.remove(table, Number(id), tenantId);
  }
}
