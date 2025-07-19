import { McpContext, McpFunctionOptions, McpServerOptions } from '../types/mcp';
import express from 'express';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { registerHealthRoutes } from './health';
import { registerMcpEndpoints } from './mcp-endpoint';

// Try to import the actual MCP SDK
let McpServer: any;
let McpFunction: any;

try {
  const mcp = require('@modelcontextprotocol/sdk');
  McpServer = mcp.McpServer;
  McpFunction = mcp.McpFunction;
} catch (e) {
  // Fallback to mock implementations if SDK is not available
  console.warn('MCP SDK not found, using mock implementation');
  
  McpServer = class MockMcpServer {
    private name: string;
    private version: string;
    private functions: any[] = [];
    private app: express.Express;
    
    constructor(options: McpServerOptions) {
      this.name = options.name;
      this.version = options.version;
      this.app = express();
    }
    
    addFunction(fn: any) {
      this.functions.push(fn);
      return this;
    }
    
    async start() {
      const port = process.env.PORT || 8080;
      this.app.listen(port, () => {
        console.log(`MCP Server listening on port ${port}`);
      });
      return this;
    }
    
    getExpressApp() {
      return this.app;
    }
  };
  
  McpFunction = class MockMcpFunction {
    private options: McpFunctionOptions;
    
    constructor(options: McpFunctionOptions) {
      this.options = options;
    }
  };
}

// Import MCP tools
import sendEmailTool from './tools/sendEmail';

const logger = new Logger('NowGPT-MCP-Server');

// Create the MCP server
const server = new McpServer({
  name: config.mcp.name,
  version: config.mcp.version,
});

// Register all available tools
server.addFunction(new McpFunction(sendEmailTool));

// Get Express app and configure it
const app = server.getExpressApp ? server.getExpressApp() : express();

// Register health check routes for Windsurf deployment
registerHealthRoutes(app);

// Register MCP endpoints for integration with Windsurf
registerMcpEndpoints(app);

// Register additional routes if needed
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    name: config.mcp.name,
    version: config.mcp.version,
    description: 'ServiceNow MCP Server with email integration',
    status: 'running'
  });
});

// Start the server
server.start().then(() => {
  logger.info(`MCP Server started: ${config.mcp.name}@${config.mcp.version}`);
  logger.info(`Health check endpoint available at: /health`);
});

export { server, app };

