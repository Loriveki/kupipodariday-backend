import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';
import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @Column({
    type: 'varchar',
    length: 200,
    default: 'Пока ничего не рассказал о себе',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  about: string;

  @Column({ type: 'varchar', default: 'https://i.pravatar.cc/300' })
  @IsString()
  avatar: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  @IsString()
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', nullable: false })
  @IsString()
  @Exclude()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wish, (wish) => wish.owner)
  @Exclude()
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  @Exclude()
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  @Exclude()
  wishlists: Wishlist[];
}
