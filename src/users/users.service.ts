import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, Like, Brackets } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashService } from '../hash/hash.service';
import { instanceToPlain } from 'class-transformer';
import { UserResponse } from './entities/user-response.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }
    const user = this.usersRepository.create(createUserDto);
    user.password = await this.hashService.hash(createUserDto.password); 
    return await this.usersRepository.save(user);
  }

  async findMany(filter: FindOptionsWhere<User> | string): Promise<UserResponse[]> {
    if (typeof filter === 'string') {
      const searchTerm = filter.trim().toLowerCase();
      return await this.usersRepository
        .createQueryBuilder('user')
        .where(
          new Brackets(qb => {
            qb.where('LOWER(user.username) LIKE :term', { term: `%${searchTerm}%` })
              .orWhere('LOWER(user.email) LIKE :term', { term: `%${searchTerm}%` });
          })
        )
        .getMany()
        .then(users => users.map(user => instanceToPlain(user) as UserResponse));
    }
    const users = await this.usersRepository.find({ where: filter });
    return users.map(user => instanceToPlain(user) as UserResponse);
  }

  async findOneByFilter(filter: FindOptionsWhere<User>): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException(`User with given filter not found`);
    }
    return instanceToPlain(user) as UserResponse;
  }

  async findOneByFilterFull(filter: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException(`User with given filter not found`);
    }
    return user;
  }

  async updateOne(filter: FindOptionsWhere<User>, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.findOneByFilterFull(filter);
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(updateUserDto.password);
    }
    await this.usersRepository.update(user.id, updateUserDto);
    return await this.findOneByFilter({ id: user.id });
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.findOneByFilterFull({ id: userId });
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(updateUserDto.password);
    }
    await this.usersRepository.update(user.id, updateUserDto);
    return await this.findOneByFilter({ id: user.id });
  }

  async removeOne(filter: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOneByFilterFull(filter);
    await this.usersRepository.remove(user);
  }

  async findOneByOrFilter(usernameOrEmail: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :value OR user.email = :value', { value: usernameOrEmail })
      .getOne();
    if (!user) {
      throw new NotFoundException(`User with given filter not found`);
    }
    return user;
  }
}