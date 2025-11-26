import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;
}