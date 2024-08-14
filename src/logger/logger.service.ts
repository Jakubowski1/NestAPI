import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      }),
    ),
    transports: [
      new transports.Console(),
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
