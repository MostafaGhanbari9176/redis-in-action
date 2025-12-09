import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    constructor(
        @Inject("REDIS_CLIENT") private readonly client: Redis
    ) { }

    async zAdd(key: string, score: number, member: string) {
        await this.client.zadd(key, score, member)
    }

    async zRemoveRangeByScore(key: string, minScore: number, maxScore: number) {
        await this.client.zremrangebyscore(key, minScore, maxScore)
    }

    async zCount(key: string): Promise<number> {
        return await this.client.zcard(key)
    }

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

    async lock(value: string): Promise<boolean> {
        const free = await this.setNX(this.getLockKey(value), value, 600/* 10 minutes */)
        return free !== null && free !== 'OK'
    }

    async isLock(value: string): Promise<boolean> {
        return await this.exists(this.getLockKey(value))
    }

    async unlock(value: string): Promise<boolean> {
        return await this.client.del(this.getLockKey(value)) === 1
    }

    getLockKey(value: string) {
        return `lock:${value}`
    }

}

