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
import { PessoasService } from './pessoas.service';
import { SaasService } from '../saas/saas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(
    private readonly pessoasService: PessoasService,
    private readonly saasService: SaasService,
  ) {}

  // ==========================================
  // 1. ROTAS DE INFRAESTRUTURA E DIAGNÓSTICO
  // ==========================================

  @Get('teste-vivo')
  teste() {
    return {
      status: 'SISMOB ONLINE',
      timestamp: new Date().toISOString(),
      mensagem: 'Se você lê isso, o Railway está funcionando perfeitamente!',
    };
  }

  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    return this.saasService.buscarPorHost(host);
  }

  // ==========================================
  // 2. PROTOCOLO DE SEGURANÇA (NOVA SENHA)
  // ==========================================

  @Post('solicitar-codigo')
  async solicitarCodigo(@Body() body: { email: string }) {
    // Chama o motor de disparo de 6 dígitos que definimos no Service
    return this.pessoasService.gerarCodigoRecuperacao(body.email);
  }

  @Post('reset-direto')
  async resetDireto(
    @Body() body: { email: string; token: string; novaSenha: any },
  ) {
    // Valida o código e troca a senha no Banco e no Auth
    return this.pessoasService.validarProtocoloEResetar(
      body.email,
      body.token,
      body.novaSenha,
    );
  }

  // ==========================================
  // 3. GESTÃO DE PESSOAS (CRM)
  // ==========================================

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('imobiliariaId') tid: string) {
    return this.pessoasService.findOne(id, tid);
  }

  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobId, search);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.save(dto, dto.imobiliariaId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.pessoasService.save({ ...dto, id }, dto.imobiliariaId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('imobiliariaId') tid: string) {
    const parsedId = isNaN(Number(id)) ? id : Number(id);
    return this.pessoasService.remove(parsedId as any, tid);
  }
}
