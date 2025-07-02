import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedFilter } from './filters/unauthorized.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnauthorizedFilter());

  const configService = app.get(ConfigService);
  const port = configService.get('appPort') || 3000;

  app.use((req, res, next) => {
    next();
  });
  app.enableCors();
  await app.listen(port);
}

bootstrap();
