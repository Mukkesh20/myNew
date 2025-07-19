/**
 * Type definitions for MCP functionality
 */

export interface McpContext {
  userId?: string;
  conversationId?: string;
  [key: string]: any;
}

export interface McpFunctionOptions {
  name: string;
  description: string;
  parameters: any;
  handler: (ctx: McpContext, params: any) => Promise<any>;
}

export interface McpServerOptions {
  name: string;
  version: string;
}

export interface McpFunction {
  name: string;
  description: string;
  parameters: any;
  handler: (ctx: McpContext, params: any) => Promise<any>;
}

export interface McpServer {
  addFunction(fn: McpFunction): McpServer;
  start(): Promise<any>;
}
