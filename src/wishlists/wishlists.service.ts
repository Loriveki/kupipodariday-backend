import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { UsersService } from '../users/users.service';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepo: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  async createWithAuth(
    dto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const user = await this.usersService.findOneByFilter({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { itemsId, ...rest } = dto;

    return await this.wishlistRepo.manager.transaction(async (manager) => {
      const wishlist = this.wishlistRepo.create({
        ...rest,
        description: rest.description || '',
        user,
      });

      await manager.save(wishlist);

      if (itemsId?.length) {
        const wishes = await manager.findBy(Wish, { id: In(itemsId) });

        if (wishes.length !== itemsId.length) {
          throw new NotFoundException(
            `Одно или несколько желаний не найдено. Запрошенные ID: ${itemsId.join(
              ', ',
            )}, Найденные ID: ${wishes.map((w) => w.id).join(', ')}`,
          );
        }

        wishlist.items = wishes;
        await manager.save(Wishlist, wishlist);
      }

      return await manager.findOneOrFail(Wishlist, {
        where: { id: wishlist.id },
        relations: ['user', 'items', 'items.owner'],
      });
    });
  }

  async findAll(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.owner'],
    });
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    return wishlist;
  }

  async updateOne(
    filter: FindOptionsWhere<Wishlist>,
    dto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findOneByFilter(filter);
    if (wishlist.user.id !== userId) {
      throw new UnauthorizedException(
        'Вы можете обновлять только свои списки желаний',
      );
    }

    if (dto.items) {
      const wishes = await this.wishRepo.findBy({ id: In(dto.items) });
      if (wishes.length !== dto.items.length) {
        throw new NotFoundException('Одно или несколько желаний не найдено');
      }
      await this.wishlistRepo
        .createQueryBuilder()
        .relation(Wishlist, 'items')
        .of(wishlist)
        .addAndRemove(wishes, wishlist.items ?? []);
    }

    Object.assign(wishlist, dto);
    await this.wishlistRepo.save(wishlist);

    const updatedWishlist = await this.wishlistRepo.findOne({
      where: { id: wishlist.id },
      relations: ['user', 'items', 'items.owner'],
    });

    if (!updatedWishlist) {
      throw new NotFoundException('Список желаний не найден после обновления');
    }

    return updatedWishlist;
  }

  async removeOne(
    filter: FindOptionsWhere<Wishlist>,
    userId: number,
  ): Promise<void> {
    const wishlist = await this.findOneByFilter(filter);
    if (wishlist.user.id !== userId) {
      throw new UnauthorizedException(
        'Вы можете удалять только свои списки желаний',
      );
    }
    await this.wishlistRepo.remove(wishlist);
  }

  async updateWithAuth(
    filter: FindOptionsWhere<Wishlist>,
    dto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    return await this.updateOne(filter, dto, userId);
  }

  async removeWithAuth(
    filter: FindOptionsWhere<Wishlist>,
    userId: number,
  ): Promise<void> {
    return await this.removeOne(filter, userId);
  }

  private async findOneByFilter(
    filter: FindOptionsWhere<Wishlist>,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepo.findOne({
      where: filter,
      relations: ['user', 'items', 'items.owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    return wishlist;
  }
}
