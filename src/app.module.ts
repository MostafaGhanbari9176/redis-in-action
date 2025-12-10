import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { FixedWindowRateLimitGuard } from './common/guard/rate_limitation/fixed-window-limitation.guard';
import { SlidingWindowLimitationGuard } from './common/guard/rate_limitation/sliding-window-limitation.guard';
import { TokenBucketLimitationGuard } from './common/guard/rate_limitation/toke-bucket-limitation.guard';
import { RESTAuthGuard } from './common/guard/ws.auth.guard';
import { registerUserDecoratorDb } from './decorator/user.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, RedisModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_GUARD",
      useClass: TokenBucketLimitationGuard
    },
    {
      provide: "APP_GUARD",
      useClass: RESTAuthGuard
    }
  ],
})
export class AppModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    registerUserDecoratorDb(this.connection);
  }
}
