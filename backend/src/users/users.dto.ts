import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  roles?: string[];

  @IsOptional()
  locations?: string[];

  @IsOptional()
  jobType?: string[];

  @IsOptional()
  salaryMin?: number;

  @IsOptional()
  salaryMax?: number;

  @IsOptional()
  skills?: string[];

  @IsOptional()
  experienceLevel?: string;
}
