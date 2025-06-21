import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistService: WishlistsService) {}

  @Post()
  async create(@Body() dto: CreateWishlistDto) {
    return this.wishlistService.create(dto);
  }

  @Get()
  async findMany(@Query() filter: Partial<Wishlist>) {
    return this.wishlistService.findManyByFilter(filter);
  }

  @Get('one')
  async findOne(@Query() filter: Partial<Wishlist>) {
    return this.wishlistService.findOneByFilter(filter);
  }

  @Patch()
  async updateOne(
    @Query() filter: Partial<Wishlist>,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wishlistService.updateOne(filter, dto);
  }

  @Delete()
  async removeOne(@Query() filter: Partial<Wishlist>) {
    return this.wishlistService.removeOne(filter);
  }
}
