import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';

// Polyfill global BigInt → string pour JSON.stringify
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
});

async function bootstrap() {
  console.log('⚡ Creating NestJS app...');
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  console.log('⚡ NestJS app created');

  // Augmenter la taille limite des requêtes pour accepter les images en Base64 (ex. 10mb)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Parser les cookies pour l'authentification httpOnly
  app.use(cookieParser());

  // Injection des en-têtes de sécurité HTTP Helmet (XSS, Clickjacking, CSP)
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://ka-f.fontawesome.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://ka-f.fontawesome.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3001'],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
        },
      },
    }),
  );

  // Configuration dynamique et sécurisée du CORS
  const allowedOrigins: (string | RegExp)[] = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'https://ethical-data.vercel.app',
    /^https:\/\/ethical-data-[\w-]+\.vercel\.app$/,
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Origine non autorisée'), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Validation globale stricte des payloads DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Activer l'intercepteur de logs HTTP de production
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3000;
  console.log(`⚡ Attempting to listen on port ${port}...`);
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Serveur Backend Ethical Data prêt et sécurisé sur le port ${port}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}
bootstrap().catch(err => {
  console.error('❌ Unhandled bootstrap error:', err);
  process.exit(1);
});