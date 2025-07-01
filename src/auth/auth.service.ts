import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash/hash.service';
import { SignupDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.usersService.findOneByOrFilter(usernameOrEmail);
    if (!user) return null;
    const isMatch = await this.hashService.compare(password, user.password);
    return isMatch ? user : null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(dto: SignupDto) {
    let existingUser;
    try {
      existingUser = await this.usersService.findOneByOrFilter(dto.username);
    } catch (e) {
      existingUser = null;
    }
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким username или email уже зарегистрирован',
      );
    }
    const user = await this.usersService.create(dto);
    return instanceToPlain(user);
  }
}
