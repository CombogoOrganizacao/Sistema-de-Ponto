import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nome do Usuário' })
  nome!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'secret' })
  senha!: string;

  @ApiProperty({ example: 'user', enum: ['admin','user'], required: false })
  cargo?: 'admin' | 'user';
}
