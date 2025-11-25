export const Role = {
  PASSENGER: 'PASSENGER',
  DRIVER: 'DRIVER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
}