import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = (request as any).user?.id || 'ANONYMOUS';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const delay = Date.now() - now;
          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${delay}ms - User:${userId} - IP:${ip}`,
          );
        },
        error: (err: any) => {
          const delay = Date.now() - now;
          this.logger.error(
            `[${method}] ${originalUrl} 500 - ${delay}ms - User:${userId} - IP:${ip} - ${err.message}`,
            err.stack,
          );
        },
      }),
    );
  }
}
