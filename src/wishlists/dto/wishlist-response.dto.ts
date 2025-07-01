import { Expose, Transform, Type } from 'class-transformer';

export class OwnerDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  avatar: string;
}

export class WishResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  link: string;

  @Expose()
  image: string;

  @Expose()
  price: number;

  @Expose()
  raised: number;

  @Expose()
  description: string;

  @Expose()
  copied: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OwnerDto)
  @Transform(({ obj }) => obj.owner || obj.user, { toClassOnly: true })
  owner: OwnerDto;
}

export class WishlistResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  image: string;

  @Expose()
  @Type(() => WishResponseDto)
  items: WishResponseDto[];

  @Expose()
  @Type(() => OwnerDto)
  @Transform(({ obj }) => obj.user, { toClassOnly: true })
  owner: OwnerDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
