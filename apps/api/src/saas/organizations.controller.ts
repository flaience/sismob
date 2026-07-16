import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlaienceAdminGuard } from './flaience-admin.guard';
import { OrganizationsService } from './organizations.service';

@Controller('flaience/organizacoes')
@UseGuards(JwtAuthGuard, FlaienceAdminGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.organizationsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.organizationsService.update(id, dto);
  }
}
