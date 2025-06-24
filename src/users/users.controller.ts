import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @Get()
  async findMany(@Query('search') search?: string): Promise<any> {
    const users = await this.usersService.findMany(search || {});
    return users.map(user => instanceToPlain(user, { excludeExtraneousValues: true }));
  }

  @Get('one')
  async findOne(@Query('filter') filter: string): Promise<any> {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const user = await this.usersService.findOneByFilter(parsedFilter);
    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id: number): Promise<any> {
    const user = await this.usersService.findOneByFilter({ id });
    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @Get('profile')
  async getOwnProfile(@Query('username') username?: string, @Request() req?: any): Promise<any> {
    const userId = req?.user?.id;
    const filter = username ? { username } : userId ? { id: userId } : { id: 0 };
    const user = await this.usersService.findOneByFilter(filter);
    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const userId = req.user.id;
    const user = await this.usersService.updateProfile(userId, updateUserDto);
    return instanceToPlain(user, { excludeExtraneousValues: true });
  }

  @Delete()
  async removeOne(@Query() filter: Partial<User>): Promise<void> {
    await this.usersService.removeOne(filter);
  }
}
