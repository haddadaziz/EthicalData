import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { ForumModule } from './modules/forum/forum.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SimulationsModule } from './modules/simulations/simulations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CertificationsModule,
    ResourcesModule,
    SimulationsModule,
    ForumModule,
    NotificationsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }