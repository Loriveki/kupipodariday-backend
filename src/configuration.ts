import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  return {
    database: {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'student',
      password: String(process.env.DB_PASSWORD || 'p'),
      database: process.env.DB_DATABASE || 'kupipodariday',
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
      logging: process.env.DB_LOGGING === 'true' || true,
    },
    appPort: parseInt(process.env.APP_PORT, 10) || 3000,
  };
});
