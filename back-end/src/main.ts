import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Manual OpenAPI document (minimal) based on current controllers
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Ponto API',
      version: '1.0.0',
      description: 'API do sistema de ponto com autenticação e hierarquia de usuário',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            cargo: { type: 'string', enum: ['admin', 'user'] },
          },
        },
      },
    },
    servers: [{ url: 'http://localhost:3000' }],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { nome: { type: 'string' }, email: { type: 'string' }, senha: { type: 'string' }, cargo: { type: 'string' } } } } } },
          responses: { '200': { description: 'User created' } }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, senha: { type: 'string' } } } } } },
          responses: { '200': { description: 'Tokens and user' } }
        }
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh token',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { '200': { description: 'New tokens' } }
        }
      },
      '/auth/logout': {
        post: {
          summary: 'Logout',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { '200': { description: 'Logged out' } }
        }
      },
      '/users': {
        get: {
          summary: 'List users (admin only)',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'List of users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } }
        },
        post: {
          summary: 'Create user (use /auth/register to set password)',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Use /auth/register' } }
        }
      },
      '/users/{id}': {
        get: {
          summary: 'Get user by id',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } }
        },
        patch: {
          summary: 'Update user',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Updated user' } }
        },
        delete: {
          summary: 'Delete user',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Deleted' } }
        }
      }
    }
  } as any;

  // Use swagger-ui-express to serve the manual OpenAPI document
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

  // ensure there is a default admin user for first-run convenience
  try {
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    // check for any admin
    const all = await usersService.findAll();
    const hasAdmin = all.some((u: any) => u.cargo === 'admin');
    if (!hasAdmin) {
      // register default admin: admin@example.com / admin123
      await authService.register('Administrador', 'admin@example.com', 'admin123', 'admin');
      // eslint-disable-next-line no-console
      console.log('Default admin created: admin@example.com / admin123');
    }
  } catch (e) {
    // ignore if services unavailable
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
