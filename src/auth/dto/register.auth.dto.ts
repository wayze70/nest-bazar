import { IsEmail, IsNotEmpty, IsString, isString } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  lastName: string;
  @IsString()
  firstName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
