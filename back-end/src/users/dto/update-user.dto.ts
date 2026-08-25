import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nome do Usuário' })
  nome?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'secret' })
  senha?: string;

  @ApiPropertyOptional({ example: 'user', enum: ['admin','user'] })
  cargo?: 'admin' | 'user';
}
