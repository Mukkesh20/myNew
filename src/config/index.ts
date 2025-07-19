import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  servicenow: z.object({
    instanceUrl: z.string().url(),
    username: z.string().min(1),
    password: z.string().min(1),
    apiVersion: z.string().default('v1'),
    timeout: z.number().default(30000),
    retryAttempts: z.number().default(3),
    defaultSenderEmail: z.string().email().optional(),
  }),
  mcp: z.object({
    name: z.string().default('now-gpt-mcp'),
    version: z.string().default('1.0.0'),
    maxConcurrentRequests: z.number().default(10),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'simple']).default('json'),
  }),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
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
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
}

export const config = loadConfig();

// Environment file template
export const ENV_TEMPLATE = `
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