import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { getRuntimeConfig } from 'src/common/config/app-config';

type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();
const runtimeConfig = getRuntimeConfig();

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limit = runtimeConfig.rateLimit.maxRequests;
  private readonly windowMs = runtimeConfig.rateLimit.windowMs;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.buildKey(request);
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && now >= record.expiresAt) {
      rateLimitStore.delete(key);
    }

    if (record && now < record.expiresAt) {
      if (record.count >= this.limit) {
        throw new HttpException(
          'Too many requests, please try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      record.count += 1;
      return true;
    }

    rateLimitStore.set(key, {
      count: 1,
      expiresAt: now + this.windowMs,
    });

    return true;
  }

  private buildKey(request: Request): string {
    return `${request.ip}:${request.method}`;
  }
}
