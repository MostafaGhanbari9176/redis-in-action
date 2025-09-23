import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import Redis from "ioredis";

/**
 * its perfect for small to medium traffics
 */
@Injectable()
export class SlidingWindowLimitationGuard implements CanActivate {

    constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) { }

    maxRate = 300
    windowMillisecond = 300_000

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp()
        const ip = (http.getRequest() as Request).ip

        const count = await this.calculateIPRate(ip)

        if (count > this.maxRate) {
            throw new HttpException("we detect too many request from your client please try later!", HttpStatus.TOO_MANY_REQUESTS)
        }

        return true;
    }

    async calculateIPRate(ip: string | undefined): Promise<number> {
        const key = `limit:ip:${ip}`
        const currentMillisecond = Date.now()

        const pipeline = this.redis.pipeline()

        pipeline.zadd(key, currentMillisecond, currentMillisecond.toString())
        pipeline.zremrangebyscore(key, 0, currentMillisecond - this.windowMillisecond)
        pipeline.zcard(key)
        pipeline.expire(key, this.windowMillisecond / 1000 + 1)

        const result = (await pipeline.exec()) ?? [[null, null], [null, null], [null, 0]]

        return result[2][1] as number
    }

}



