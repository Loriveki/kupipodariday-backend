import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Body() dto: CreateOfferDto) {
    return await this.offersService.create(dto);
  }

  @Get()
  async findMany(@Query() filter: Partial<Offer>) {
    return await this.offersService.findManyByFilter(filter);
  }

  @Get('one')
  async findOne(@Query() filter: Partial<Offer>) {
    return await this.offersService.findOneByFilter(filter);
  }

  @Patch()
  async updateOne(
    @Query() filter: Partial<Offer>,
    @Body() dto: UpdateOfferDto,
  ) {
    return await this.offersService.updateOne(filter, dto);
  }

  @Delete()
  async removeOne(@Query() filter: Partial<Offer>) {
    return await this.offersService.removeOne(filter);
  }
}
