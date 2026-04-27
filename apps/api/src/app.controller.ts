// apps/api/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('debug')
export class AppController {
  @Get('status')
  check() {
    return { status: 'Sismob API Online', timestamp: new Date() };
  }
}
