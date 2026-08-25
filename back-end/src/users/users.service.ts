import { Injectable } from '@nestjs/common';
import { Usuario, Cargo } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private users = new Map<string, Usuario>();

  constructor() {
    // create a default admin user (password: admin123) - senhaHash must be set externally when registering
  }

  async create(usuario: Omit<Usuario, 'id'>) {
    const id = uuidv4();
    const u = { ...usuario, id } as Usuario;
    this.users.set(id, u);
    return { ...u };
  }

  async findAll() {
    return Array.from(this.users.values()).map(u => ({ ...u }));
  }

  async findOneById(id: string) {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  async findByEmail(email: string) {
    for (const u of this.users.values()) {
      if (u.email === email) return { ...u };
    }
    return null;
  }

  async update(id: string, patch: Partial<Usuario>) {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch } as Usuario;
    this.users.set(id, updated);
    return { ...updated };
  }

  async remove(id: string) {
    return this.users.delete(id);
  }
}
