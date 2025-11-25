import { Role } from '@prisma/client';

export class CreateUserDto {
  email: string;
  password;
  name: string;
  role: Role;
}
