import {
  Controller,
  Post,
  Get, // <--- ADICIONADO
  Query, // <--- ADICIONADO
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('imoveis')
export class ImoveisController {
  constructor(private readonly imoveisService: ImoveisService) {}

  // 1. ROTA DE LISTAGEM (O que o site usa para mostrar os cards)
  @Get() // <--- ESTA É A PORTA QUE ESTAVA FALTANDO
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    return this.imoveisService.findAll(imobiliariaId);
  }

  // 2. ROTA DE CRIAÇÃO (O que o corretor usa)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imagens'))
  async create(
    @Body() data: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    return this.imoveisService.createWithImages(data, files, req.user.userId);
  }
}
