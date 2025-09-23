import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    constructor(
        @Inject("REDIS_CLIENT") private readonly client: Redis
    ) { }

    async increment(key: string, ttl?: number): Promise<number> {
        let isFirst: string | null
        if (ttl) {
            isFirst = await this.client.set(key, 1, 'EX', ttl, 'NX')
        } else {
            isFirst = await this.client.set(key, 1, 'NX')
        }

        if (!isFirst) {
            return await this.client.incr(key)
        }

        return 1
    }

    async set(key: string, value: string, ttl?: number) {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl)
        }
        else {
            await this.client.set(key, value)
        }
    }

    async setNX(key: string, value: string, ttl?: number): Promise<string | null> {
        if (ttl) {
            return await this.client.set(key, value, 'EX', ttl, 'NX')
        }
        else {
            return await this.client.set(key, value, 'NX')
        }
    }

    async get<T = string>(key: string): Promise<T | null> {
        return await this.client.get(key) as T
    }

    async exists(key: string): Promise<boolean> {
        return await this.client.exists(key) === 1
    }

}

