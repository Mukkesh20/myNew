"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ServiceNowError = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("@/utils/logger");
const logger = new logger_1.Logger('ErrorHandler');
class ServiceNowError extends Error {
    status;
    details;
    constructor(message, status, details) {
        super(message);
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, ServiceNowError.prototype);
    }
}
exports.ServiceNowError = ServiceNowError;
class ErrorHandler {
    static async withRetry(fn, retries = 3, baseDelayMs = 500) {
        let attempt = 0;
        while (attempt <= retries) {
            try {
                return await fn();
            }
            catch (err) {
                attempt += 1;
                if (attempt > retries) {
                    throw err;
                }
                const backoff = baseDelayMs * 2 ** (attempt - 1);
                logger.warn(`Attempt ${attempt}/${retries} failed. Retrying in ${backoff}ms`, { error: err.message });
                await new Promise((res) => setTimeout(res, backoff));
            }
        }
        throw new Error('withRetry exhausted');
    }
    static handleServiceNowError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosErr = error;
            const status = axiosErr.response?.status ?? 500;
            const message = axiosErr.response?.data?.error?.message ?? axiosErr.message;
            const details = axiosErr.response?.data;
            return new ServiceNowError(message, status, details);
        }
        if (error instanceof ServiceNowError) {
            return error;
        }
        return new ServiceNowError(error.message || 'Unknown error', 500, error);
    }
}
exports.ErrorHandler = ErrorHandler;
exports.default = ErrorHandler;
//# sourceMappingURL=error-handler.js.map