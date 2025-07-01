import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: CreateWishlistDto,
    @Request() req,
  ): Promise<WishlistResponseDto> {
    try {
      const wishlist = await this.wishlistService.createWithAuth(
        dto,
        req.user.id,
      );

      const dtoInstance = plainToInstance(WishlistResponseDto, wishlist, {
        excludeExtraneousValues: true,
      });
      return instanceToPlain(dtoInstance) as WishlistResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Не удалось создать список желаний',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<WishlistResponseDto[]> {
    try {
      const wishlists = await this.wishlistService.findAll(req.user.id);
      const dtoInstances = plainToInstance(WishlistResponseDto, wishlists, {
        excludeExtraneousValues: true,
      });
      return dtoInstances.map(
        (wishlist) => instanceToPlain(wishlist) as WishlistResponseDto,
      );
    } catch (error) {
      throw new HttpException(
        'Не удалось получить списки желаний',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WishlistResponseDto> {
    try {
      const wishlist = await this.wishlistService.findOne(+id);
      const dtoInstance = plainToInstance(WishlistResponseDto, wishlist, {
        excludeExtraneousValues: true,
      });
      return instanceToPlain(dtoInstance) as WishlistResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Не удалось получить список желаний',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() dto: UpdateWishlistDto,
    @Request() req,
  ): Promise<WishlistResponseDto> {
    try {
      const wishlist = await this.wishlistService.updateWithAuth(
        { id },
        dto,
        req.user.id,
      );
      const dtoInstance = plainToInstance(WishlistResponseDto, wishlist, {
        excludeExtraneousValues: true,
      });
      return instanceToPlain(dtoInstance) as WishlistResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof UnauthorizedException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'Не удалось обновить список желаний',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async removeOne(@Param('id') id: number, @Request() req): Promise<void> {
    try {
      await this.wishlistService.removeWithAuth({ id }, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof UnauthorizedException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'Не удалось удалить список желаний',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
