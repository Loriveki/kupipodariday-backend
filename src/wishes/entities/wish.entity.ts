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

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 250 })
  @IsString()
  @MinLength(1) 
  @MaxLength(250)
  name: string;

  @Column({ type: 'varchar' })
  @IsString()
  link: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsUrl() 
  image: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  raised: number;

  @Column({ type: 'varchar', length: 1024 })
  @IsString()
  @MinLength(1) 
  @MaxLength(1024)
  description: string;

  @Column({ type: 'int', default: 0 })
  copied: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.wishes, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}
