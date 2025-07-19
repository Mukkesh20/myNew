export declare class ServiceNowError extends Error {
    status: number;
    details?: unknown;
    constructor(message: string, status: number, details?: unknown);
}
export declare class ErrorHandler {
    static withRetry<T>(fn: () => Promise<T>, retries?: number, baseDelayMs?: number): Promise<T>;
    static handleServiceNowError(error: unknown): ServiceNowError;
}
export default ErrorHandler;
//# sourceMappingURL=error-handler.d.ts.map