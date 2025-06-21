import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findMany(@Query() filter: Partial<User>): Promise<User[]> {
    return await this.usersService.findManyByFilter(filter);
  }

  @Get('one')
  async findOne(@Query() filter: Partial<User>): Promise<User> {
    return await this.usersService.findOneByFilter(filter);
  }

  @Patch()
  async updateOne(
    @Query() filter: Partial<User>,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.updateOne(filter, updateUserDto);
  }

  @Delete()
  async removeOne(@Query() filter: Partial<User>): Promise<void> {
    return await this.usersService.removeOne(filter);
  }
}
