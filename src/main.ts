import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedFilter } from './filters/unauthorized.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnauthorizedFilter());
  app.use((req, res, next) => {
    next();
  });
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
