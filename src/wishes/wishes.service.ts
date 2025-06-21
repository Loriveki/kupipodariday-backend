import {
  Injectable,
  NotFoundException,
  ConflictException,
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

  async create(createWishDto: CreateWishDto): Promise<Wish> {
    const owner = await this.usersService.findOneByFilter({
      id: createWishDto.ownerId,
    });
    const existing = await this.wishesRepository.findOne({
      where: { name: createWishDto.name, owner: { id: createWishDto.ownerId } },
      relations: ['owner'],
    });
    if (existing) {
      throw new ConflictException(
        'Wish with this name already exists for this user',
      );
    }

    const wish = this.wishesRepository.create({ ...createWishDto, owner });
    return await this.wishesRepository.save(wish);
  }

  async findManyByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return await this.wishesRepository.find({
      where: filter,
      relations: ['owner'],
    });
  }

  async findOneByFilter(filter: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: filter,
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException(`Wish not found`);
    }
    return wish;
  }

  async updateOne(
    filter: FindOptionsWhere<Wish>,
    updateDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOneByFilter(filter);
    Object.assign(wish, updateDto);
    return await this.wishesRepository.save(wish);
  }

  async removeOne(filter: FindOptionsWhere<Wish>): Promise<void> {
    const wish = await this.findOneByFilter(filter);
    await this.wishesRepository.remove(wish);
  }
}
