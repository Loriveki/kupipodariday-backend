import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    console.log('Root route accessed');
    return 'Hello World!';
  }
}