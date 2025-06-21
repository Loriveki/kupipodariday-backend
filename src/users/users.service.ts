import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    return await this.usersRepository.save(user);
  }

  async findManyByFilter(filter: FindOptionsWhere<User>): Promise<User[]> {
    return await this.usersRepository.find({ where: filter });
  }

  async findOneByFilter(filter: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException(`User with given filter not found`);
    }
    return user;
  }

  async updateOne(
    filter: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOneByFilter(filter);
    await this.usersRepository.update(user.id, updateUserDto);
    return await this.findOneByFilter({ id: user.id });
  }

  async removeOne(filter: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOneByFilter(filter);
    await this.usersRepository.remove(user);
  }


async findOneByOrFilter(usernameOrEmail: string): Promise<User> {
  const user = await this.usersRepository
    .createQueryBuilder('user')
    .where('user.username = :value OR user.email = :value', { value: usernameOrEmail })
    .getOne();
  if (!user) {
    throw new NotFoundException(`User with username or email ${usernameOrEmail} not found`);
  }
  return user;
}
}
