import { Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsString, IsDate, IsOptional } from 'class-validator';
import { Offer } from '../../offers/entities/offer.entity';
import { UserShortDto } from '../../users/dto/user-short.dto';

export class WishResponseDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  link: string;

  @Expose()
  @IsString()
  @IsOptional()
  image: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  raised: number;

  @Expose()
  @IsString()
  @IsOptional()
  description: string;

  @Expose()
  @IsNumber()
  copied: number;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @Type(() => UserShortDto)
  owner: UserShortDto;

  @Expose()
  @Transform(({ value }) => {
    if (!value || !Array.isArray(value)) {
      return [];
    }
    return value.map((offer: Offer) => {
      const amount = offer.amount ? Number(offer.amount) : 0;
      if (isNaN(amount)) {
        return {
          id: offer.id || 0,
          amount: 0,
          hidden: offer.hidden || false,
          createdAt: offer.createdAt ? new Date(offer.createdAt) : new Date(),
          name: offer?.name || 'Аноним',
          img: offer?.img,
        };
      }
      return {
        id: offer.id || 0,
        amount,
        hidden: offer.hidden || false,
        createdAt: offer.createdAt ? new Date(offer.createdAt) : new Date(),
        name: offer?.name || 'Аноним',
        img: offer?.img,
      };
    });
  })
  offers: {
    id: number;
    amount: number;
    hidden: boolean;
    createdAt: Date;
    name: string;
    img: string;
  }[];
}
