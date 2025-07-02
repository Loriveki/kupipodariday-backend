import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { instanceToPlain } from 'class-transformer';
import { EmailService } from '../email/email.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateOfferDto, @Request() req): Promise<any> {
    const userId = req.user.id;
    const wish = await this.wishesService.findOneById(dto.itemId);
    if (wish.owner.id === userId) {
      throw new ForbiddenException(
        'Нельзя вносить вклад в собственное пожелание',
      );
    }
    const offer = await this.offersService.createWithAuth(dto, userId);
    return instanceToPlain(offer, { excludeExtraneousValues: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findMany(@Request() req): Promise<any> {
    const userId = req.user.id;
    const offers = await this.offersService.findManyByFilter({}, userId);
    return offers.map((offer) =>
      instanceToPlain(offer, { excludeExtraneousValues: true }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<any> {
    const userId = req.user.id;
    const offer = await this.offersService.findOneByFilter({ id: +id }, userId);
    return instanceToPlain(offer, { excludeExtraneousValues: true });
  }
}
