import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Offer } from '../offers/entities/offer.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async findLast(filter: { page?: number }): Promise<Wish[]> {
    const take = 20;
    const skip = (filter.page - 1) * take || 0;
    return await this.wishesRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  async findTop(): Promise<Wish[]> {
    return await this.wishesRepository.find({
      relations: ['owner'],
      order: { copied: 'DESC' },
      take: 5,
    });
  }

  async createWithAuth(
    createWishDto: CreateWishDto,
    userId: number,
  ): Promise<Wish> {
    const existingWish = await this.wishesRepository.findOne({
      where: {
        owner: { id: userId },
        name: createWishDto.name,
        link: createWishDto.link,
        image: createWishDto.image,
        price: createWishDto.price,
        description: createWishDto.description,
      },
      relations: ['owner'],
    });
    if (existingWish) {
      throw new HttpException(
        { message: 'Вы уже добавили этот подарок', error: 'DUPLICATE_WISH' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: userId } as any,
      raised: 0,
      copied: 0,
    });
    return await this.wishesRepository.save(wish);
  }

  async findOneById(id: number): Promise<Wish> {
    const wish = await this.wishesRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offers')
      .leftJoinAndSelect('offers.user', 'offers_user')
      .leftJoinAndSelect('offers.item', 'offers_item')
      .where('wish.id = :id', { id })
      .getOne();

    if (!wish) {
      throw new NotFoundException(`Пожелание не найдено`);
    }
    return wish;
  }

  async findOneByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: filter,
      relations: ['owner', 'offers', 'offers.user'],
    });
    if (!wish) {
      throw new NotFoundException('Пожелание не найдено');
    }
    return wish;
  }

  async updateWithAuth(
    filter: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findOneByFilter(filter);
    if (wish.owner.id !== userId) {
      throw new UnauthorizedException(
        'Вы можете обновлять только свои пожелания',
      );
    }
    Object.assign(wish, updateWishDto);
    return await this.wishesRepository.save(wish);
  }

  async removeWithAuth(
    filter: FindOptionsWhere<Wish>,
    userId: number,
  ): Promise<void> {
    const wish = await this.findOneByFilter(filter);
    if (wish.owner.id !== userId) {
      throw new UnauthorizedException(
        'Вы можете удалять только свои пожелания',
      );
    }
    await this.wishesRepository.remove(wish);
  }

  async copyWithAuth(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException('Пожелание не найдено');
    }

    if (wish.owner.id === userId) {
      throw new HttpException(
        'Вы не можете копировать свое желание',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingCopy = await this.wishesRepository.findOne({
      where: {
        owner: { id: userId },
        name: wish.name,
        link: wish.link,
        image: wish.image,
        price: wish.price,
        description: wish.description,
      },
    });
    if (existingCopy) {
      throw new HttpException(
        'У вас уже есть копия этого подарка',
        HttpStatus.BAD_REQUEST,
      );
    }

    wish.copied += 1;
    await this.wishesRepository.save(wish);

    const newWish = this.wishesRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: { id: userId } as any,
      raised: 0,
      copied: 0,
    });

    return await this.wishesRepository.save(newWish);
  }

  async findManyByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return await this.wishesRepository.find({
      where: filter,
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async updateRaisedFromOffers(wishId: number): Promise<void> {
    await this.wishesRepository.manager.transaction(async (manager) => {
      const wish = await manager.findOne(Wish, {
        where: { id: wishId },
        relations: ['offers'],
      });
      if (!wish) {
        throw new NotFoundException('Пожелание не найдено');
      }
      const totalRaised = await manager
        .createQueryBuilder()
        .select('COALESCE(SUM(o.amount), 0)', 'totalRaised')
        .from(Offer, 'o')
        .where('o.itemId = :id', { id: wishId })
        .getRawOne();

      wish.raised = Number(totalRaised.totalRaised);
      await manager.save(wish);
    });
  }

  async findByUserId(userId: number): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner', 'offers', 'offers.user', 'offers.item'],
      take: 20,
      order: { createdAt: 'DESC' },
    });
    return wishes;
  }
}
