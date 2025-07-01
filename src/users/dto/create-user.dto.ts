import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  about?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
