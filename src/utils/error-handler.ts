import axios, { AxiosError } from 'axios';
import { Logger } from '@/utils/logger';

const logger = new Logger('ErrorHandler');

export class ServiceNowError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, ServiceNowError.prototype);
  }
}

export class ErrorHandler {
  /**
   * Wrap an async function with retry logic.
   * Retries on any thrown error up to `retries` times with exponential back-off.
   */
  static async withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 500): Promise<T> {
    let attempt = 0;
    /* eslint-disable no-await-in-loop */
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err) {
        attempt += 1;
        if (attempt > retries) {
          throw err;
        }
        const backoff = baseDelayMs * 2 ** (attempt - 1);
        logger.warn(`Attempt ${attempt}/${retries} failed. Retrying in ${backoff}ms`, { error: (err as Error).message });
        await new Promise((res) => setTimeout(res, backoff));
      }
    }
    // Should never reach here but ts needs a return
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new Error('withRetry exhausted');
  }

  /**
   * Convert an AxiosError (or any unknown error) into a ServiceNowError instance
   * so that callers get a consistent error shape.
   */
  static handleServiceNowError(error: unknown): ServiceNowError {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<any>;
      const status = axiosErr.response?.status ?? 500;
      const message = axiosErr.response?.data?.error?.message ?? axiosErr.message;
      const details = axiosErr.response?.data;
      return new ServiceNowError(message, status, details);
    }

    if (error instanceof ServiceNowError) {
      return error;
    }

    return new ServiceNowError((error as Error).message || 'Unknown error', 500, error);
  }
}

export default ErrorHandler;


/* legacy logger code below is disabled
 = winston.createLogger({
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
 {
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
}*/
