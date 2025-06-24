import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async create(dto: CreateOfferDto, userId: number): Promise<Offer> { 
    const user = await this.usersService.findOneByFilter({ id: userId }); 
    const item = await this.wishesService.findOneByFilter({ id: dto.itemId });
    const offer = this.offerRepo.create({ ...dto, user, item });
    await this.updateRaised(item.id);
    return await this.offerRepo.save(offer);
  }

  async findManyByFilter(filter: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return await this.offerRepo.find({ where: filter, relations: ['user', 'item'] });
  }

  async findOneByFilter(filter: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: filter, relations: ['user', 'item'] });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async update(id: number, dto: UpdateOfferDto, userId: number): Promise<Offer> {
    const offer = await this.findOneByFilter({ id });
    console.log('Offer user ID:', offer.user.id, 'Request user ID:', userId); 
    if (offer.user.id !== userId) {
      throw new UnauthorizedException('You can only update your own offer');
    }
    if (dto.amount !== undefined) {
      await this.updateRaised(offer.item.id);
    }
    return await this.offerRepo.save({ ...offer, ...dto });
  }

  async remove(id: number, userId: number): Promise<void> {
    const offer = await this.findOneByFilter({ id });
    if (offer.user.id !== userId) {
      throw new UnauthorizedException('You can only delete your own offer');
    }
    await this.updateRaised(offer.item.id);
    await this.offerRepo.remove(offer);
  }

  async updateRaised(wishId: number): Promise<void> {
    const wish = await this.wishesService.findOneByFilter({ id: wishId });
    const totalRaised = await this.offerRepo
      .createQueryBuilder('offer')
      .select('SUM(offer.amount)', 'total')
      .where('offer.itemId = :wishId', { wishId })
      .getRawOne();
    await this.wishesService.setRaised(wish.id, totalRaised.total || 0);
  }
}