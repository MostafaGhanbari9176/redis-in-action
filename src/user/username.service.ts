import { BadRequestException, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { UserDocument } from "./schema/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { get, Model } from "mongoose";
import { Redis } from 'ioredis'

@Injectable()
export class UserNameService implements OnModuleInit {

    constructor(
        @InjectModel(UserDocument.name)
        private readonly userModel: Model<UserDocument>,
        private readonly redisService: RedisService,
        @Inject("REDIS_CLIENT") private readonly redisClient: Redis
    ) { }


    onModuleInit() {
        this.fillCacheFromDB()
    }

    async fillCacheFromDB() {
        const chunkSize = 100;

        let skip = 0;

        while (true) {

            const usernameChunk = await this.userModel
                .find({}, { username: 1, _id: 0 })
                .skip(skip)
                .limit(chunkSize)
                .lean()
                .exec();

            if (usernameChunk?.length == 0) {
                break
            }

            const pipline = this.redisClient.pipeline()

            for (const user of usernameChunk) {
                pipline.set(this.getLookupKey(user.username), user.username)
            }

            skip += chunkSize

        }

    }

    async usernameIsAvailable(username:string):Promise<Boolean>{
        this.validateUsername(username)

        const pipeline = this.redisClient.pipeline()

        pipeline.exists(this.getLookupKey(username))
        pipeline.exists(this.redisService.getLockKey(username))

        const [exists, inUse] = await pipeline.exec() ?? []

        if(exists[1] || inUse[1]){
            return false
        }

        return true
    }

    async getNewUserName(email: string, counter: number = 1): Promise<string> {
        const username = await this.generateUsername(counter);
        const available = await this.usernameIsAvailable(username);
        if (!available) {
            return await this.getNewUserName(email, counter + 1);
        }

        return username;
    }

    private async generateUsername(counter: number): Promise<string> {
        const userCount = await this.userModel.countDocuments();

        return `user${userCount + counter}`;
    }

    async checkAndLockUserName(username: string | undefined) {
        if (!username) {
            return
        }

        const free = await this.usernameIsAvailable(username)
        if (!free) {
            throw new BadRequestException("Username is not available")
        }

        await this.redisService.lock(username)

    }

    private validateUsername(username:string){
        const validUsernameRegex = /^[a-z0-9.-]+$/;
        if (!validUsernameRegex.test(username)) {
            throw new BadRequestException("Username must contain only lowercase letters (a-z), digits (0-9), dots (.), or hyphens (-)!");
        }
    }

    private getLookupKey(value: string) {
        return `lookup:${value}`;
    }

}


