import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
    private usersService: UsersService,
    private wishesService: WishesService,
    private emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  async createWithAuth(dto: CreateOfferDto, userId: number): Promise<Offer> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const user = await this.usersService.findOneByFilter({ id: userId });
        const wish = await this.wishesService.findOneByFilter({
          id: dto.itemId,
        });

        if (!wish) {
          throw new NotFoundException('Пожелание не найдено');
        }
        if (wish.owner.id === userId) {
          throw new ForbiddenException(
            'Нельзя вносить вклад в собственное пожелание',
          );
        }
        const raised = Number(wish.raised) || 0;
        const price = Number(wish.price) || 0;
        if (raised >= price) {
          throw new HttpException(
            'Пожелание полностью профинансировано',
            HttpStatus.BAD_REQUEST,
          );
        }
        const remaining = price - raised;
        if (dto.amount > remaining) {
          throw new HttpException(
            `Сумма превышает остаток ${remaining.toFixed(2)}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const offer = transactionalEntityManager.create(Offer, {
          ...dto,
          user,
          item: wish,
        });

        const savedOffer = await transactionalEntityManager.save(Offer, offer);

        await this.wishesService.updateRaisedFromOffers(
          dto.itemId,
          transactionalEntityManager,
        );

        if (wish.owner?.email) {
          await this.emailService.sendOfferNotification(wish.owner.email, {
            amount: dto.amount,
            itemName: wish.name,
            userName: user.username,
          });
        }

        return savedOffer;
      },
    );
  }

  async findManyByFilter(
    filter: FindOptionsWhere<Offer>,
    userId?: number,
  ): Promise<Offer[]> {
    const offers = await this.offerRepo.find({
      where: filter,
      relations: ['user', 'item', 'item.owner'],
    });
    return offers.map((offer) => this.hideAmountIfNeeded(offer, userId));
  }

  async findOneByFilter(
    filter: FindOptionsWhere<Offer>,
    userId?: number,
  ): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: filter,
      relations: ['user', 'item', 'item.owner'],
    });

    if (!offer) {
      throw new NotFoundException('Не найдены желающие скинуться');
    }

    return this.hideAmountIfNeeded(offer, userId);
  }

  private hideAmountIfNeeded(offer: Offer, userId?: number): Offer {
    if (offer.hidden) {
      if (!userId) {
        return { ...offer, amount: null };
      }
      const isUserMatch = offer.user && userId === offer.user.id;
      const isOwnerMatch =
        offer.item && offer.item.owner && userId === offer.item.owner.id;
      if (!isUserMatch && !isOwnerMatch) {
        return { ...offer, amount: null };
      }
    }
    return offer;
  }

  async updateOne(
    filter: FindOptionsWhere<Offer>,
    dto: UpdateOfferDto,
  ): Promise<Offer> {
    const offer = await this.findOneByFilter(filter);
    const updatedOffer = { ...offer, ...dto };
    return await this.offerRepo.save(updatedOffer);
  }

  async removeOne(filter: FindOptionsWhere<Offer>): Promise<void> {
    const offer = await this.findOneByFilter(filter);
    await this.offerRepo.remove(offer);
  }

  private throwUnauthorized(action: string): never {
    throw new UnauthorizedException(`${action} is not allowed`);
  }

  async updateWithAuth(): Promise<Offer> {
    return this.throwUnauthorized('Editing offers');
  }

  async removeWithAuth(): Promise<void> {
    return this.throwUnauthorized('Deleting offers');
  }
}
