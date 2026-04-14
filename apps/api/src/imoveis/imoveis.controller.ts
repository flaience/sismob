import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ImoveisService } from './imoveis.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    @Inject(ImoveisService)
    private readonly imoveisService: ImoveisService,
  ) {}

  // 1. LISTAGEM (Pública - identificada pelo domínio no site)
  @Get()
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    return this.imoveisService.findAll(imobiliariaId);
  }

  // 2. BUSCA INDIVIDUAL (Pública)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.imoveisService.findOne(+id, imobId);
  }

  // 3. CRIAÇÃO/EDIÇÃO (Protegida - O motor que você perguntou)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Garante que só usuários logados criam
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'galeria', maxCount: 15 },
      { name: 'foto360', maxCount: 5 },
    ]),
  )
  async create(
    @Body() data: any,
    @UploadedFiles() files: { galeria?: any[]; foto360?: any[] },
    @Request() req: any, // Pega o usuário logado
  ) {
    const allFiles = [...(files?.galeria || []), ...(files?.foto360 || [])];

    // EXCELÊNCIA SAAS: Ignoramos o ID que vem do formulário e usamos
    // o ID da imobiliária que está criptografado no TOKEN do usuário.
    const imobiliariaId = req.user.imobiliariaId;

    return this.imoveisService.upsertImovel(data, allFiles, imobiliariaId);
  }

  // 4. EXCLUSÃO (Protegida)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.imoveisService.remove(+id, req.user.imobiliariaId);
  }
}
