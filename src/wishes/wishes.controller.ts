import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async create(@Body() createWishDto: CreateWishDto): Promise<Wish> {
    return await this.wishesService.create(createWishDto);
  }

  @Get()
  async findMany(@Query() filter: Partial<Wish>): Promise<Wish[]> {
    return await this.wishesService.findManyByFilter(filter);
  }

  @Get('one')
  async findOne(@Query() filter: Partial<Wish>): Promise<Wish> {
    return await this.wishesService.findOneByFilter(filter);
  }

  @Patch()
  async updateOne(
    @Query() filter: Partial<Wish>,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    return await this.wishesService.updateOne(filter, updateWishDto);
  }

  @Delete()
  async removeOne(@Query() filter: Partial<Wish>): Promise<void> {
    return await this.wishesService.removeOne(filter);
  }
}
