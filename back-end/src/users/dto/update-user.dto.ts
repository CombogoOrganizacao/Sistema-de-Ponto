export class UpdateUserDto {
  nome?: string;
  email?: string;
  senha?: string;
  cargo?: 'admin' | 'user';
}
