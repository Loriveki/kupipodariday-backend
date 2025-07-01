import {
  IsString,
  IsNotEmpty,
  IsUrl,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateWishDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  description: string;

  @IsNumber()
  copied: number;
}
