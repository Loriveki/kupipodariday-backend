import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  name: string;

  @IsString()
  @MaxLength(1500)
  description: string;

  @IsString()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
