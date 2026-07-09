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
import { AuthGuard } from '@nestjs/passport';
import { PessoasService } from './pessoas.service';
import { SaasService } from '../saas/saas.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pessoas')
export class PessoasController {
  constructor(
    private readonly pessoasService: PessoasService,
    private readonly saasService: SaasService,
  ) {}

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

  @Post('solicitar-codigo')
  async solicitarCodigo(@Body() body: { email: string }) {
    return this.pessoasService.gerarCodigoRecuperacao(body.email);
  }

  @Post('reset-direto')
  async resetDireto(
    @Body() body: { email: string; token: string; novaSenha: any },
  ) {
    return this.pessoasService.validarProtocoloEResetar(
      body.email,
      body.token,
      body.novaSenha,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.pessoasService.findOne(id, req.user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    return this.pessoasService.findByRole(papel, req.user.tenantId, search);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    console.log('======================================');
    console.log('PESSOAS CONTROLLER');
    console.log(req.user);
    console.log('======================================');
    return this.pessoasService.save(dto, req.user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.pessoasService.save({ ...dto, id }, req.user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const parsedId = isNaN(Number(id)) ? id : Number(id);
    return this.pessoasService.remove(parsedId as any, req.user.tenantId);
  }
}
