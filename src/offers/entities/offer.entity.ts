import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  amount: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  @Expose()
  hidden: boolean;

  @ManyToOne(() => User, (user) => user.offers, { onDelete: 'CASCADE' })
  @Expose()
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, { onDelete: 'CASCADE' })
  @Expose()
  item: Wish;

  @Expose()
  @Transform(({ obj }) => obj.user?.username || 'Аноним')
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.avatar || obj.item?.image || '')
  img: string;
}
