import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

const parseEnvNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const RATE_LIMIT_WINDOW_MS = parseEnvNumber(
  process.env.RATE_LIMIT_WINDOW_MS,
  60_000,
);
const RATE_LIMIT_MAX_REQUESTS = parseEnvNumber(
  process.env.RATE_LIMIT_MAX_REQUESTS,
  60,
);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limit = RATE_LIMIT_MAX_REQUESTS;
  private readonly windowMs = RATE_LIMIT_WINDOW_MS;

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
