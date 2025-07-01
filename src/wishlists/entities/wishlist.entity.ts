import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Expose } from 'class-transformer';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 250 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(250)
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 1500, nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1500)
  @Expose()
  description?: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Expose()
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: 'CASCADE' })
  @Expose()
  user: User;

  @ManyToMany(() => Wish, (wish) => wish.wishlists, { cascade: true })
  @JoinTable()
  items: Wish[];
}
