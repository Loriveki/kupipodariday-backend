import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  Param,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { WishResponseDto } from './dto/wish-response.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(201)
  async create(
    @Body() createWishDto: CreateWishDto,
    @Request() req,
  ): Promise<any> {
    const wish = await this.wishesService.createWithAuth(
      createWishDto,
      req.user.id,
    );
    const dto = plainToInstance(WishResponseDto, wish, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @Get()
  async findMany(@Query('page') page = 1): Promise<any> {
    const lastWishes = await this.wishesService.findLast({ page });
    const topWishes = await this.wishesService.findTop();

    const mergedWishes = [...lastWishes, ...topWishes];
    const uniqueWishes = Array.from(
      new Map(mergedWishes.map((wish) => [wish.id, wish])).values(),
    );
    const allWishes = uniqueWishes.slice(0, 40);

    const dto = plainToInstance(WishResponseDto, allWishes, {
      excludeExtraneousValues: true,
    });
    return dto.map((wish) => instanceToPlain(wish));
  }

  @Get('top')
  async getTopCards(): Promise<any> {
    const wishes = await this.wishesService.findTop();
    const dto = plainToInstance(WishResponseDto, wishes, {
      excludeExtraneousValues: true,
    });
    return dto.map((wish) => instanceToPlain(wish));
  }

  @Get('last')
  async getLastCards(@Query('page') page = 1): Promise<any> {
    const wishes = await this.wishesService.findLast({ page });
    const dto = plainToInstance(WishResponseDto, wishes, {
      excludeExtraneousValues: true,
    });
    return dto.map((wish) => instanceToPlain(wish));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCard(@Param('id') id: string): Promise<any> {
    const wish = await this.wishesService.findOneById(Number(id));
    const dto = plainToInstance(WishResponseDto, wish, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req,
  ): Promise<any> {
    const wish = await this.wishesService.findOneById(id);
    if (wish.owner.id !== req.user.id) {
      throw new UnauthorizedException(
        'Вы можете обновлять только свои пожелания',
      );
    }
    if (wish.raised > 0) {
      throw new HttpException(
        'Нельзя редактировать подарок, на который уже скидывались',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedWish = await this.wishesService.updateWithAuth(
      { id },
      updateWishDto,
      req.user.id,
    );
    const dto = plainToInstance(WishResponseDto, updatedWish, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async removeOne(@Param('id') id: number, @Request() req): Promise<void> {
    await this.wishesService.removeWithAuth({ id }, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  @HttpCode(201)
  async copyWish(@Param('id') id: number, @Request() req): Promise<any> {
    const wish = await this.wishesService.copyWithAuth(id, req.user.id);
    const dto = plainToInstance(WishResponseDto, wish, {
      excludeExtraneousValues: true,
    });
    return instanceToPlain(dto);
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
}
