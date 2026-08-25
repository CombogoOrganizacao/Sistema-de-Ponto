export class CreateUserDto {
  nome!: string;
  email!: string;
  senha!: string;
  cargo?: 'admin' | 'user';
}
