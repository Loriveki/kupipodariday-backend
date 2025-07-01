import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  itemsId?: number[];
}
