import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const owner = await this.usersService.findOneByFilter({ id: userId });
    const existing = await this.wishesRepository.findOne({
      where: { name: createWishDto.name, owner: { id: userId } },
      relations: ['owner'],
    });
    if (existing) {
      throw new ConflictException('Wish with this name already exists for this user');
    }
    const wish = this.wishesRepository.create({ ...createWishDto, owner, raised: 0 });
    const savedWish = await this.wishesRepository.save(wish);
    return savedWish; 
  }

  async findManyByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return await this.wishesRepository.find({ where: filter, relations: ['owner'] });
  }

  async findOneByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({ where: filter, relations: ['owner', 'offers'] });
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    return wish;
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number): Promise<Wish> {
    const wish = await this.findOneByFilter({ id });
    if (wish.owner.id !== userId) {
      throw new UnauthorizedException('You can only update your own wish');
    }
    if (wish.offers.length > 0 && updateWishDto.price !== undefined) {
      throw new UnauthorizedException('Cannot update price if there are offers');
    }
    const updatedWish = { ...wish, ...updateWishDto };
    return await this.wishesRepository.save(updatedWish);
  }

  async remove(id: number, userId: number): Promise<void> {
    const wish = await this.findOneByFilter({ id });
    if (wish.owner.id !== userId) {
      throw new UnauthorizedException('You can only delete your own wish');
    }
    await this.wishesRepository.remove(wish);
  }

  async setRaised(wishId: number, raised: number): Promise<void> {
    const wish = await this.findOneByFilter({ id: wishId });
    wish.raised = raised;
    await this.wishesRepository.save(wish);
  }
}