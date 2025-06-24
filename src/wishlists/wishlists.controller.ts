import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain } from 'class-transformer';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateWishlistDto, @Request() req): Promise<any> {
    const wishlist = await this.wishlistService.create(dto, req.user.id);
    console.log('Created wishlist:', wishlist); 
    return instanceToPlain(wishlist, { excludeExtraneousValues: true });
  }

  @Get()
  async findMany(@Query() filter: Partial<Wishlist>): Promise<any> {
    const wishlists = await this.wishlistService.findManyByFilter(filter);
    return wishlists.map(wishlist => instanceToPlain(wishlist, { excludeExtraneousValues: true }));
  }

  @Get('one')
  async findOne(@Query() filter: Partial<Wishlist>): Promise<any> {
    const wishlist = await this.wishlistService.findOneByFilter(filter);
    return instanceToPlain(wishlist, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() dto: UpdateWishlistDto,
    @Request() req,
  ): Promise<any> {
    const wishlist = await this.wishlistService.update(+id, dto, req.user.id);
    return instanceToPlain(wishlist, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Param('id') id: number, @Request() req): Promise<void> {
    await this.wishlistService.remove(+id, req.user.id);
  }
}