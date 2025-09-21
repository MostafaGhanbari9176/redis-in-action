import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:1234@127.0.0.1:27019', {
      dbName: 'redis_project',
    }),
  ],
})
export class DatabaseModule {}
