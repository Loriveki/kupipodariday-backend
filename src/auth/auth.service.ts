import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service'; 
import { SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

async validateUser(usernameOrEmail: string, password: string) {
  const user = await this.usersService.findOneByOrFilter(usernameOrEmail);
  const isMatch = await this.hashService.compare(password, user.password);
  return isMatch ? user : null;
}

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(dto: SignupDto) {
    const hashedPassword = await this.hashService.hash(dto.password);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
      avatar: dto.avatar ?? 'https://i.pravatar.cc/300',
      about: dto.about ?? 'Пока ничего не рассказал о себе',
    });
    return this.login(user);
  }
}
