import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getPositions() {
    return this.appService.getPositions();
  }

  @Get(':wallet')
  getPositionsByUser(@Param('wallet') wallet: string) {
    return this.appService.getPositionsByWallet(wallet);
  }
}
