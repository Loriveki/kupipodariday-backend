import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Brackets } from 'typeorm';
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

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email или username уже существуют');
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return instanceToPlain(savedUser) as UserResponse;
  }

  async findMany(
    filter: FindOptionsWhere<User> | string,
    excludeUserId?: number,
  ): Promise<UserResponse[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.about', 'user.avatar']);

    if (excludeUserId) {
      queryBuilder.where('user.id != :excludeId', { excludeId: excludeUserId });
    }

    if (typeof filter === 'string') {
      const searchTerm = filter.trim().toLowerCase();
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.username) LIKE :term', {
            term: `%${searchTerm}%`,
          }).orWhere('LOWER(user.email) LIKE :term', {
            term: `%${searchTerm}%`,
          });
        }),
      );
    } else if (filter) {
      queryBuilder.andWhere(filter);
    }

    const users = await queryBuilder.getMany();
    return users.map((user) => instanceToPlain(user) as UserResponse);
  }

  async findOneByFilter(filter: FindOptionsWhere<User>): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return instanceToPlain(user) as UserResponse;
  }

  async findOneByFilterFull(filter: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async updateOne(
    filter: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.findOneByFilterFull(filter);
    const updatedData = { ...updateUserDto };

    if (updateUserDto.email || updateUserDto.username) {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      queryBuilder.where('user.id != :userId', { userId: user.id });

      if (updateUserDto.email) {
        queryBuilder.andWhere('user.email = :email', {
          email: updateUserDto.email,
        });
      }
      if (updateUserDto.username) {
        queryBuilder.andWhere('user.username = :username', {
          username: updateUserDto.username,
        });
      }

      const existingUser = await queryBuilder.getOne();

      if (existingUser) {
        throw new ConflictException(
          'Email или username уже зарегистрированы другим пользователем',
        );
      }
    }

    if (updateUserDto.password) {
      updatedData.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    await this.usersRepository.update(user.id, updatedData);
    return await this.findOneByFilter({ id: user.id });
  }

  async removeOne(filter: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOneByFilterFull(filter);
    await this.usersRepository.remove(user);
  }

  async updateProfileWithAuth(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const updatedData = { ...updateUserDto };
    if (updateUserDto.password) {
      updatedData.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }
    return await this.updateOne({ id: userId }, updatedData);
  }

  async removeWithAuth(
    filter: FindOptionsWhere<User>,
    userId: number,
  ): Promise<void> {
    const user = await this.findOneByFilterFull(filter);
    if (user.id !== userId) {
      throw new UnauthorizedException('Вы можете удалить только свой аккаунт');
    }
    await this.removeOne(filter);
  }

  async findOneByOrFilter(usernameOrEmail: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :value OR user.email = :value', {
        value: usernameOrEmail,
      })
      .getOne();
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }
}
