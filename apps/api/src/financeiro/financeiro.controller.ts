import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('caixa/manual')
  async manual(@Body() dto: any, @Req() req: any) {
    // O 'req.user.id' vem do token do Supabase
    const usuarioId = req.user?.id;
    return this.financeiroService.lancarManual(
      dto,
      dto.imobiliariaId,
      usuarioId,
    );
  }

  @Post('baixar')
  async baixar(@Body() dto: any, @Req() req: any) {
    const usuarioId = req.user?.id;
    return this.financeiroService.baixarTitulo(
      dto,
      dto.imobiliariaId,
      usuarioId,
    );
  }
}
