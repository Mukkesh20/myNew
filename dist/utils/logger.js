"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("@/config");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), config_1.config.logging.format === 'json'
    ? winston_1.default.format.json()
    : winston_1.default.format.simple());
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'now-gpt-mcp' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston_1.default.format.json(),
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            format: winston_1.default.format.json(),
        }),
    ],
});
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, meta) {
        exports.logger.log(level, message, {
            context: this.context,
            ...meta,
        });
    }
    error(message, error, meta) {
        this.log('error', message, {
            error: error?.message || error,
            stack: error?.stack,
            ...meta,
        });
    }
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    info(message, meta) {
        this.log('info', message, meta);
    }
    debug(message, meta) {
        this.log('debug', message, meta);
    }
    toolExecution(toolName, args, duration) {
        this.info(`Tool executed: ${toolName}`, {
            tool: toolName,
            args,
            duration,
        });
    }
    apiCall(method, url, statusCode, duration) {
        this.info(`API call: ${method} ${url}`, {
            method,
            url,
            statusCode,
            duration,
        });
    }
    errorWithContext(message, error, context) {
        this.error(message, error, { context });
    }
}
exports.Logger = Logger;
exports.default = Logger;
//# sourceMappingURL=logger.js.map