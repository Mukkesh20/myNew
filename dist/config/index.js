"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_TEMPLATE = exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    servicenow: zod_1.z.object({
        instanceUrl: zod_1.z.string().url(),
        username: zod_1.z.string().min(1),
        password: zod_1.z.string().min(1),
        apiVersion: zod_1.z.string().default('v1'),
        timeout: zod_1.z.number().default(30000),
        retryAttempts: zod_1.z.number().default(3),
        defaultSenderEmail: zod_1.z.string().email().optional(),
    }),
    mcp: zod_1.z.object({
        name: zod_1.z.string().default('now-gpt-mcp'),
        version: zod_1.z.string().default('1.0.0'),
        maxConcurrentRequests: zod_1.z.number().default(10),
    }),
    logging: zod_1.z.object({
        level: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
        format: zod_1.z.enum(['json', 'simple']).default('json'),
    }),
});
function loadConfig() {
    const rawConfig = {
        servicenow: {
            instanceUrl: process.env.SERVICENOW_INSTANCE_URL,
            username: process.env.SERVICENOW_USERNAME,
            password: process.env.SERVICENOW_PASSWORD,
            apiVersion: process.env.SERVICENOW_API_VERSION,
            timeout: process.env.SERVICENOW_TIMEOUT ? parseInt(process.env.SERVICENOW_TIMEOUT) : undefined,
            retryAttempts: process.env.SERVICENOW_RETRY_ATTEMPTS ? parseInt(process.env.SERVICENOW_RETRY_ATTEMPTS) : undefined,
            defaultSenderEmail: process.env.SERVICENOW_DEFAULT_SENDER_EMAIL,
        },
        mcp: {
            name: process.env.MCP_NAME,
            version: process.env.MCP_VERSION,
            maxConcurrentRequests: process.env.MCP_MAX_CONCURRENT ? parseInt(process.env.MCP_MAX_CONCURRENT) : undefined,
        },
        logging: {
            level: process.env.LOG_LEVEL,
            format: process.env.LOG_FORMAT,
        },
    };
    try {
        return configSchema.parse(rawConfig);
    }
    catch (error) {
        console.error('Configuration validation failed:', error);
        process.exit(1);
    }
}
exports.config = loadConfig();
exports.ENV_TEMPLATE = `
# ServiceNow Configuration
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
SERVICENOW_API_VERSION=v1
SERVICENOW_TIMEOUT=30000
SERVICENOW_RETRY_ATTEMPTS=3

# MCP Configuration
MCP_NAME=now-gpt-mcp
MCP_VERSION=1.0.0
MCP_MAX_CONCURRENT=10

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
`;
//# sourceMappingURL=index.js.map