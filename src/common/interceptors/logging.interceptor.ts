import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest();
    const res = httpCtx.getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const responseTimeMs = Date.now() - startTime;
        const userId = req.user?.id || null;
        const endpoint = req.originalUrl || req.url;
        const method = req.method;
        const statusCode = res.statusCode;

        // Skip logging docs
        if (endpoint.includes('/api/docs') || endpoint.includes('favicon')) {
          return;
        }

        try {
          await this.prisma.apiUsageLog.create({
            data: {
              userId,
              endpoint,
              method,
              statusCode,
              responseTimeMs,
            },
          });
        } catch {
          // Logging failure should not disrupt API responses
        }
      }),
    );
  }
}