//src/common/generic.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenericService } from './generic.service';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('factory')
export class GenericController {
  constructor(private readonly generic: GenericService) {}

  @Get(':table')
  async list(
    @Param('table') table: string,
    @Query('search') search: string,
    @Query() filters: any,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.generic.findAll(table, tenantId, search, filters);
  }

  @Post(':table')
  async create(
    @Param('table') table: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.generic.upsert(table, dto, tenantId);
  }

  @Patch(':table/:id')
  async update(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.generic.upsert(
      table,
      {
        ...dto,
        id: Number(id),
      },
      tenantId,
    );
  }

  @Delete(':table/:id')
  async remove(
    @Param('table') table: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.generic.remove(table, Number(id), tenantId);
  }
}
