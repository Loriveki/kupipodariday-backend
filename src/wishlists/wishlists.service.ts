import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateWishlistDto): Promise<Wishlist> {
    const user = await this.usersService.findOneByFilter({ id: dto.userId });
    const wishlist = this.wishlistRepo.create({ ...dto, user });
    return await this.wishlistRepo.save(wishlist);
  }

  async findManyByFilter(
    filter: FindOptionsWhere<Wishlist>,
  ): Promise<Wishlist[]> {
    return await this.wishlistRepo.find({
      where: filter,
      relations: ['user', 'items'],
    });
  }

  async findOneByFilter(filter: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wl = await this.wishlistRepo.findOne({
      where: filter,
      relations: ['user', 'items'],
    });
    if (!wl) throw new NotFoundException('Wishlist not found');
    return wl;
  }

  async updateOne(
    filter: FindOptionsWhere<Wishlist>,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wl = await this.findOneByFilter(filter);
    await this.wishlistRepo.update(wl.id, dto);
    return await this.findOneByFilter({ id: wl.id });
  }

  async removeOne(filter: FindOptionsWhere<Wishlist>): Promise<void> {
    const wl = await this.findOneByFilter(filter);
    await this.wishlistRepo.remove(wl);
  }
}
