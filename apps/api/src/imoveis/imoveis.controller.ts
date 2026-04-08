import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ImoveisService } from './imoveis.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    @Inject(ImoveisService)
    private readonly imoveisService: ImoveisService,
  ) {}

  // 1. ROTA PÚBLICA: Listagem de imóveis filtrada por imobiliária
  @Get()
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    return this.imoveisService.findAll(imobiliariaId);
  }

  // 2. ROTA PROTEGIDA: Cadastro de imóvel com upload de imagens
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FilesInterceptor('imagens'))
  async create(
    @Body() data: any,
    @UploadedFiles() files: any[], // Tipado como any para evitar erro de Multer no build
    @Request() req: any,
  ) {
    // O userId vem do token, para sabermos quem cadastrou
    const userId = req.user.userId;
    return this.imoveisService.createWithImages(data, files, userId);
  }
}
