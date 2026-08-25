import { Controller, Get, Post, Body, Req, Param, Patch, Delete, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Only admin can list all users
  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Req() req: any) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Authentication required');
    if (user.cargo !== 'admin') throw new ForbiddenException('Only admin can list all users');
    const users = await this.usersService.findAll();
    // don't return senhaHash
    return users.map(u => ({ id: u.id, nome: u.nome, email: u.email, cargo: u.cargo }));
  }

  // Get own user or (admin) any user by id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (admin or owner)' })
  @ApiResponse({ status: 200, description: 'User data' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Authentication required');
    if (user.cargo !== 'admin' && user.id !== id) throw new ForbiddenException('Access denied');
    const u = await this.usersService.findOneById(id);
    if (!u) return null;
    return { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo };
  }

  // Register new user - only admin can create admin accounts
  @Post()
  @ApiOperation({ summary: 'Create user (use /auth/register to set password)' })
  @ApiBody({ type: CreateUserDto })
  async create(@Req() req: any, @Body() dto: CreateUserDto) {
    const caller = req.user;
    if (dto.cargo === 'admin') {
      if (!caller || caller.cargo !== 'admin') throw new ForbiddenException('Only admin can create admin users');
    }
    // The actual password hashing is expected to be handled by AuthService.register which uses UsersService.create
    return { message: 'Use /auth/register to create accounts' };
  }

  // Update user (only admin or the user themself). Note: editing ponto records is restricted to admin — that would be enforced in ponto endpoints.
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (admin or owner)' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const caller = req.user;
    if (!caller) throw new UnauthorizedException('Authentication required');
    if (caller.cargo !== 'admin' && caller.id !== id) throw new ForbiddenException('Access denied');
    // Prevent non-admin from changing cargo
    if (caller.cargo !== 'admin' && dto.cargo && dto.cargo !== caller.cargo) throw new ForbiddenException('Cannot change cargo');

    // If password present, AuthService.updatePassword should be used — here we only forward allowed fields
    const patch: any = {};
    if (dto.nome) patch.nome = dto.nome;
    if (dto.email) patch.email = dto.email;
    if (dto.cargo && caller.cargo === 'admin') patch.cargo = dto.cargo;

    const updated = await this.usersService.update(id, patch);
    if (!updated) return null;
    return { id: updated.id, nome: updated.nome, email: updated.email, cargo: updated.cargo };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin or owner)' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const caller = req.user;
    if (!caller) throw new UnauthorizedException('Authentication required');
    if (caller.cargo !== 'admin' && caller.id !== id) throw new ForbiddenException('Access denied');
    await this.usersService.remove(id);
    return { success: true };
  }
}
