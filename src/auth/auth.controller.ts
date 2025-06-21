import { Body, Controller, Post, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

@Post('signup')
async signup(@Body() dto: SignupDto) {
  console.log('Signup request received:', dto);
  return this.authService.signup(dto);
}

 @UseGuards(LocalAuthGuard)
@Post('signin')
@HttpCode(200) 
async signin(@Request() req) {
  console.log('User validated:', req.user);
  return this.authService.login(req.user);
}
}
