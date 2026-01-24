import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './modules/cache/cache.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { HealthModule } from './health/health.module';
import { ScheduleModule } from '@nestjs/schedule';
import kakfkaConfig from './config/kakfka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, kakfkaConfig, appConfig],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CacheModule,
    MessagingModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }