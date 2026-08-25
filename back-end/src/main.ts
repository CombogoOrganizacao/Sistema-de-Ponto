import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Ponto API')
    .setDescription('API do sistema de ponto com autenticação e hierarquia de usuário')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ensure there is a default admin user for first-run convenience
  try {
    const authService = app.get('AuthService');
    const usersService = app.get('UsersService');
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
