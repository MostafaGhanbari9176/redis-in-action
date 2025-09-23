import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from "express";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class FixedWindowRateLimitGuard implements CanActivate {

    constructor(private readonly redis: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const http = context.switchToHttp()
        const ip = (http.getRequest() as Request).ip

        const key = `limit:ip:${ip}`

        const rate = await this.redis.increment(key, 60)

        if (rate > 30) {
            throw new HttpException("we detect so many request from your client, please try later!", HttpStatus.TOO_MANY_REQUESTS)
        }

        return true;
    }
}

