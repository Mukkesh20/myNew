import winston from 'winston';
export declare const logger: winston.Logger;
export declare class Logger {
    private context;
    constructor(context: string);
    private log;
    error(message: string, error?: Error | any, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    toolExecution(toolName: string, args: any, duration?: number): void;
    apiCall(method: string, url: string, statusCode?: number, duration?: number): void;
    errorWithContext(message: string, error: Error, context: any): void;
}
export default Logger;
//# sourceMappingURL=logger.d.ts.map