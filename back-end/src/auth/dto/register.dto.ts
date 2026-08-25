export class RegisterDto {
  nome!: string;
  email!: string;
  senha!: string;
  cargo?: 'admin' | 'user';
}
