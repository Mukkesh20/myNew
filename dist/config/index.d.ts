import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    servicenow: z.ZodObject<{
        instanceUrl: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        apiVersion: z.ZodDefault<z.ZodString>;
        timeout: z.ZodDefault<z.ZodNumber>;
        retryAttempts: z.ZodDefault<z.ZodNumber>;
        defaultSenderEmail: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instanceUrl: string;
        username: string;
        password: string;
        apiVersion: string;
        timeout: number;
        retryAttempts: number;
        defaultSenderEmail?: string | undefined;
    }, {
        instanceUrl: string;
        username: string;
        password: string;
        apiVersion?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
        defaultSenderEmail?: string | undefined;
    }>;
    mcp: z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        maxConcurrentRequests: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        maxConcurrentRequests: number;
    }, {
        name?: string | undefined;
        version?: string | undefined;
        maxConcurrentRequests?: number | undefined;
    }>;
    logging: z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
        format: z.ZodDefault<z.ZodEnum<["json", "simple"]>>;
    }, "strip", z.ZodTypeAny, {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
    }, {
        level?: "error" | "warn" | "info" | "debug" | undefined;
        format?: "json" | "simple" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    servicenow: {
        instanceUrl: string;
        username: string;
        password: string;
        apiVersion: string;
        timeout: number;
        retryAttempts: number;
        defaultSenderEmail?: string | undefined;
    };
    mcp: {
        name: string;
        version: string;
        maxConcurrentRequests: number;
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
    };
}, {
    servicenow: {
        instanceUrl: string;
        username: string;
        password: string;
        apiVersion?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
        defaultSenderEmail?: string | undefined;
    };
    mcp: {
        name?: string | undefined;
        version?: string | undefined;
        maxConcurrentRequests?: number | undefined;
    };
    logging: {
        level?: "error" | "warn" | "info" | "debug" | undefined;
        format?: "json" | "simple" | undefined;
    };
}>;
export type Config = z.infer<typeof configSchema>;
export declare const config: {
    servicenow: {
        instanceUrl: string;
        username: string;
        password: string;
        apiVersion: string;
        timeout: number;
        retryAttempts: number;
        defaultSenderEmail?: string | undefined;
    };
    mcp: {
        name: string;
        version: string;
        maxConcurrentRequests: number;
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
    };
};
export declare const ENV_TEMPLATE = "\n# ServiceNow Configuration\nSERVICENOW_INSTANCE_URL=https://your-instance.service-now.com\nSERVICENOW_USERNAME=your-username\nSERVICENOW_PASSWORD=your-password\nSERVICENOW_API_VERSION=v1\nSERVICENOW_TIMEOUT=30000\nSERVICENOW_RETRY_ATTEMPTS=3\n\n# MCP Configuration\nMCP_NAME=now-gpt-mcp\nMCP_VERSION=1.0.0\nMCP_MAX_CONCURRENT=10\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_FORMAT=json\n";
export {};
//# sourceMappingURL=index.d.ts.map