import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(201)
  async signin(@Request() req) {
    return this.authService.login(req.user);
  }
}
