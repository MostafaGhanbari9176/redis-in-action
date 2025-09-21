import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    constructor(
        @Inject("REDIS_CLIENT") private readonly client: Redis
    ) { }

    async set(key: string, value: string, ttl?: number) {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl)
        }
        else {

            await this.client.set(key, value)
        }
    }

    async get<T = string>(key: string): Promise<T | null> {
        return await this.client.get(key) as T
    }

}

