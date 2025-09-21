import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
