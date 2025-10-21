import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModelsModule } from './models/models.module';
import { ModulesModule } from './modules/modules.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true ,
      envFilePath: '.env'
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        Logger.log(`Connecting to MongoDB at ${uri}`, 'Mongoose');
        return {
          uri,
          connectionFactory: (connection) => {
            Logger.debug(`✅ Successfully connected to MongoDB`, 'Mongoose');
            return connection;
          },
        };
      },
    }),

    ModelsModule,
    ModulesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    }

  ],
})
export class AppModule {}
