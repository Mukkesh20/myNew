import winston from 'winston';
import { config } from '@/config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.simple()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'now-gpt-mcp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
});

// Create a structured logging interface
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: any) {
    logger.log(level, message, {
      context: this.context,
      ...meta,
    });
  }

  error(message: string, error?: Error | any, meta?: any) {
    this.log('error', message, {
      error: error?.message || error,
      stack: error?.stack,
      ...meta,
    });
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }

  // Structured logging methods for common operations
  toolExecution(toolName: string, args: any, duration?: number) {
    this.info(`Tool executed: ${toolName}`, {
      tool: toolName,
      args,
      duration,
    });
  }

  apiCall(method: string, url: string, statusCode?: number, duration?: number) {
    this.info(`API call: ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration,
    });
  }

  errorWithContext(message: string, error: Error, context: any) {
    this.error(message, error, { context });
  }
}

export default Logger;