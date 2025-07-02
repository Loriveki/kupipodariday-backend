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
  Param,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishesService } from '../wishes/wishes.service';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { WishResponseDto } from '../wishes/dto/wish-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @Get()
  async findMany(
    @Query('search') search?: string,
    @Request() req?,
  ): Promise<any> {
    const users = await this.usersService.findMany(search || {}, req?.user?.id);
    const dto = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
    return dto.map((user) => instanceToPlain(user));
  }

  @Get('one')
  async findOne(@Query('filter') filter: string): Promise<any> {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const user = await this.usersService.findOneByFilter(parsedFilter);
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id: number): Promise<any> {
    const user = await this.usersService.findOneByFilter({ id });
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/')
  async getOwnProfile(@Request() req): Promise<any> {
    const userId = req.user.id;
    const user = await this.usersService.findOneByFilter({ id: userId });
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/')
  async updateOwnProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const userId = req.user.id;
    const user = await this.usersService.updateProfileWithAuth(
      userId,
      updateUserDto,
    );
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(204)
  async removeOne(
    @Query() filter: Partial<User>,
    @Request() req,
  ): Promise<void> {
    await this.usersService.removeWithAuth(filter, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getOwnWishes(@Request() req): Promise<any> {
    const userId = req.user.id;
    const wishes = await this.wishesService.findByUserId(userId);
    const dto = plainToInstance(WishResponseDto, wishes, {
      excludeExtraneousValues: true,
    });
    return dto.map((wish) => instanceToPlain(wish));
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string): Promise<any> {
    const user = await this.usersService.findOneByFilter({ username });
    const dto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    const { ...userWithoutEmail } = instanceToPlain(dto) as any;
    return userWithoutEmail;
  }

  @Get(':username/wishes')
  async getUserWishesByUsername(
    @Param('username') username: string,
  ): Promise<any> {
    const user = await this.usersService.findOneByFilter({ username });
    const wishes = await this.wishesService.findManyByFilter({
      owner: { id: user.id },
    });
    const dto = plainToInstance(WishResponseDto, wishes, {
      excludeExtraneousValues: true,
    });
    return dto.map((wish) => instanceToPlain(wish));
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  async findUsers(@Body('query') query: string, @Request() req): Promise<any> {
    const users = await this.usersService.findMany(query, req.user.id);
    const dto = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
    return dto.map((user) => instanceToPlain(user));
  }
}
