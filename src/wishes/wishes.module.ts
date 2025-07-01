import { forwardRef, Module } from '@nestjs/common';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wish]), forwardRef(() => UsersModule)],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}
