export type Cargo = 'admin' | 'user';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string; // hashed password
  cargo: Cargo;
}
