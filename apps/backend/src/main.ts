import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer la validation globale de toutes les requêtes entrantes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime tous les champs non déclarés dans nos DTOs
      forbidNonWhitelisted: true, // Renvoie une erreur si l'utilisateur envoie des champs interdits
      transform: true, // Convertit automatiquement les types des payloads dans les types TypeScript attendus
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();