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
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain } from 'class-transformer';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createWishDto: CreateWishDto, @Request() req): Promise<any> {
    const wish = await this.wishesService.create(createWishDto, req.user.id);
    console.log('Created wish before transform:', wish); 
    const transformedWish = instanceToPlain(wish, { excludeExtraneousValues: true });
    console.log('Transformed wish:', transformedWish);
    return transformedWish;
  }

  @Get()
  async findMany(@Query() filter: Partial<Wish>): Promise<any> {
    const wishes = await this.wishesService.findManyByFilter(filter);
    return wishes.map(wish => instanceToPlain(wish, { excludeExtraneousValues: true }));
  }

  @Get('one')
  async findOne(@Query('filter') filter: string): Promise<any> {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const wish = await this.wishesService.findOneByFilter(parsedFilter);
    return instanceToPlain(wish, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req,
  ): Promise<any> {
    const wish = await this.wishesService.update(+id, updateWishDto, req.user.id);
    return instanceToPlain(wish, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Param('id') id: number, @Request() req): Promise<void> {
    await this.wishesService.remove(+id, req.user.id);
  }
}