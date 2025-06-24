import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { IsString, MinLength, MaxLength, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer'; 

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ type: 'varchar', length: 250 })
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  @Expose()
  name: string;

  @Column({ type: 'varchar' })
  @IsString()
  @Expose()
  @IsUrl()
  link: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsUrl()
  @Expose()
  image: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @Expose()
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  @Expose()
  raised: number;

  @Column({ type: 'varchar', length: 1024 })
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  @Expose()
  description: string;

  @Column({ type: 'int', default: 0 })
  @Expose()
  copied: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'CASCADE' })
  @Expose()
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}