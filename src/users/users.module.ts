import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashModule } from '../hash/hash.module';
import { WishesModule } from '../wishes/wishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HashModule,
    forwardRef(() => WishesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
