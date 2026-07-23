import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Une erreur interne est survenue sur le serveur.';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const respMsg = exceptionResponse.message;
      if (Array.isArray(respMsg)) {
        message = respMsg[0];
      } else if (typeof respMsg === 'string') {
        message = respMsg;
      } else {
        message = JSON.stringify(exceptionResponse);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const detail =
      exception instanceof Error
        ? exception.stack || exception.message
        : String(exception);

    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `[${request.method}] ${request.url} - Error: ${detail}`,
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(isProduction ? {} : { errorDetail: detail }),
    });
  }
}
