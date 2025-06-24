import { IsString, IsNotEmpty, IsUrl, MinLength, MaxLength } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1500)
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  image: string;
}
