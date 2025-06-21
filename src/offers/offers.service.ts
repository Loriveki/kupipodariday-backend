import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
    private usersService: UsersService,
    private wishesService: WishesService,
  ) {}

  async create(dto: CreateOfferDto): Promise<Offer> {
    const user = await this.usersService.findOneByFilter({ id: dto.userId });
    const item = await this.wishesService.findOneByFilter({ id: dto.itemId });

    const offer = this.offerRepo.create({
      ...dto,
      user,
      item,
    });
    return await this.offerRepo.save(offer);
  }

  async findManyByFilter(filter: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return await this.offerRepo.find({
      where: filter,
      relations: ['user', 'item'],
    });
  }

  async findOneByFilter(filter: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: filter,
      relations: ['user', 'item'],
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async updateOne(
    filter: FindOptionsWhere<Offer>,
    dto: UpdateOfferDto,
  ): Promise<Offer> {
    const offer = await this.findOneByFilter(filter);
    await this.offerRepo.update(offer.id, dto);
    return await this.findOneByFilter({ id: offer.id });
  }

  async removeOne(filter: FindOptionsWhere<Offer>): Promise<void> {
    const offer = await this.findOneByFilter(filter);
    await this.offerRepo.remove(offer);
  }
}
