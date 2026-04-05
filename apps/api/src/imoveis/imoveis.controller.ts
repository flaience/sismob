import {
  Controller,
  Post,
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

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imagens')) // Permite subir múltiplas imagens no campo 'imagens'
  async create(
    @Body() data: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    // A mágica acontece aqui: passamos os dados E os arquivos binários para o Service
    return this.imoveisService.createWithImages(data, files, req.user.userId);
  }
}
