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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain } from 'class-transformer';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateOfferDto, @Request() req): Promise<any> {
    const offer = await this.offersService.create(dto, req.user.id); 
    console.log('Created offer:', offer); 
    return instanceToPlain(offer, { excludeExtraneousValues: true });
  }

  @Get()
  async findMany(@Query() filter: Partial<Offer>): Promise<any> {
    const offers = await this.offersService.findManyByFilter(filter);
    return offers.map(offer => instanceToPlain(offer, { excludeExtraneousValues: true }));
  }

  @Get('one')
  async findOne(@Query('filter') filter: string): Promise<any> {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const offer = await this.offersService.findOneByFilter(parsedFilter);
    return instanceToPlain(offer, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() dto: UpdateOfferDto,
    @Request() req,
  ): Promise<any> {
    const offer = await this.offersService.update(+id, dto, req.user.id);
    return instanceToPlain(offer, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Param('id') id: number, @Request() req): Promise<void> {
    await this.offersService.remove(+id, req.user.id);
  }
}
