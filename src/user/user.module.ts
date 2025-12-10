import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from './schema/user.schema';
import { RedisModule } from '../redis/redis.module';
import { UserNameService } from './username.service';
import { UserNameGateway } from './username.gateway';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserNameService,
    UserNameGateway
  ],
  exports: [
    UserService,
    UserNameService,
    UserNameGateway
  ],
})
export class UserModule { }
