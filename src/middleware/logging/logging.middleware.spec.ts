import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('Content-Length');
      const duration = Date.now() - startTime;
      this.logger.log(
        `Outgoing Response: ${method} ${originalUrl} - Status: ${res.statusCode} - ${contentLength || 0} bytes - Duration: ${duration}ms`,
      );
      if (statusCode >= 400) {
        this.logger.error(
          `Error Response: ${method} ${originalUrl} - Status: ${statusCode} - ${duration} ms`,
        );
      }
    });

    //Log error
    res.on('error', (error) => {
      this.logger.error(
        `Response Error: ${method} ${originalUrl} - ${error.message}`,
      );
    });

    //Log TO
    req.on('timeout', () => {
      this.logger.warn(
        `Request Timeout: ${method} ${originalUrl} - ${Date.now() - startTime} ms`,
      );
    });

    next();
  }
}
