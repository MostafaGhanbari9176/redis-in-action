import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Request } from "express";
import Redis from "ioredis";

export class TokenBucketLimitationGuard implements CanActivate {

    capacity = 10
    refillRate = 0.5

    constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp()
        const ip = (http.getRequest() as Request).ip

        const allowed = this.tryConsume(ip)

        if (!allowed) {
            throw new HttpException("we detect too many request from your client, please try later!", HttpStatus.TOO_MANY_REQUESTS)
        }

        return true;
    }

    async tryConsume(ip: string | undefined) {
        let heated = false
        const key = `limit:ip:${ip}`
        let { tokens, lastRefill } = await this.refill(key)

        if (tokens < 1) {
            heated = true
        }
        else {
            --tokens
        }

        const pipeline = this.redis.pipeline()
        pipeline.hset(key, { tokens, lastRefill })
        pipeline.expire(key, 86400)
        await pipeline.exec()

        return !heated
    }

    async refill(key: string): Promise<{ tokens: number; lastRefill: number }> {
        const now: number = Date.now()
        const bucket = await this.redis.hgetall(key)

        const lastRefill: number = Number.parseInt(bucket?.lastRefill ?? now)
        const remainedTokens = Number.parseInt(bucket?.tokens ?? this.capacity)

        const elapsed = (now - lastRefill) / 1000
        const newTokens = Math.min(this.capacity, remainedTokens + elapsed * this.refillRate)

        return { tokens: newTokens, lastRefill: now }
    }
}
