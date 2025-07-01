import { PartialType } from '@nestjs/mapped-types';
import { CreateWishlistDto } from './create-wishlist.dto';
import { IsArray, IsOptional, IsInt } from 'class-validator';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  items?: number[];
}
