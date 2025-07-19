"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const health_1 = require("./health");
const mcp_endpoint_1 = require("./mcp-endpoint");
let McpServer;
let McpFunction;
try {
    const mcp = require('@modelcontextprotocol/sdk');
    McpServer = mcp.McpServer;
    McpFunction = mcp.McpFunction;
}
catch (e) {
    console.warn('MCP SDK not found, using mock implementation');
    McpServer = class MockMcpServer {
        name;
        version;
        functions = [];
        app;
        constructor(options) {
            this.name = options.name;
            this.version = options.version;
            this.app = (0, express_1.default)();
        }
        addFunction(fn) {
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
        options;
        constructor(options) {
            this.options = options;
        }
    };
}
const sendEmail_1 = __importDefault(require("./tools/sendEmail"));
const logger = new logger_1.Logger('NowGPT-MCP-Server');
const server = new McpServer({
    name: config_1.config.mcp.name,
    version: config_1.config.mcp.version,
});
exports.server = server;
server.addFunction(new McpFunction(sendEmail_1.default));
const app = server.getExpressApp ? server.getExpressApp() : (0, express_1.default)();
exports.app = app;
(0, health_1.registerHealthRoutes)(app);
(0, mcp_endpoint_1.registerMcpEndpoints)(app);
app.get('/', (req, res) => {
    res.json({
        name: config_1.config.mcp.name,
        version: config_1.config.mcp.version,
        description: 'ServiceNow MCP Server with email integration',
        status: 'running'
    });
});
server.start().then(() => {
    logger.info(`MCP Server started: ${config_1.config.mcp.name}@${config_1.config.mcp.version}`);
    logger.info(`Health check endpoint available at: /health`);
});
//# sourceMappingURL=index.js.map