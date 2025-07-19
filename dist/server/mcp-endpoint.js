"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMcpEndpoints = registerMcpEndpoints;
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const emailUtil_1 = require("../servicenow/emailUtil");
const logger = new logger_1.Logger('MCP-Endpoint');
function registerMcpEndpoints(app) {
    logger.info('Registering MCP endpoints for Claude Desktop integration');
    app.use(express_1.default.json());
    app.get('/mcp', (req, res) => {
        logger.info('GET request to /mcp - sending Tool Manifest');
        const toolManifest = {
            schema_version: "v1",
            name_for_human: "ServiceNow Email",
            name_for_model: "servicenow_email",
            description_for_human: "Send emails through ServiceNow",
            description_for_model: "Use this tool to send emails through the ServiceNow platform.",
            auth: {
                type: "none"
            },
            api: {
                type: "openapi",
                url: `http://${req.headers.host}/mcp/schema`
            },
            tools: [
                {
                    name: "send_email",
                    description: "Send an email through ServiceNow",
                    parameters: {
                        type: ["object"],
                        properties: {
                            to: {
                                type: ["string"],
                                description: "Email address of the recipient"
                            },
                            subject: {
                                type: ["string"],
                                description: "Subject of the email"
                            },
                            body: {
                                type: ["string"],
                                description: "Body content of the email (can include HTML)"
                            },
                            from: {
                                type: ["string"],
                                description: "Optional sender email address"
                            }
                        },
                        required: ["to", "subject", "body"]
                    }
                }
            ]
        };
        res.json(toolManifest);
    });
    app.post('/mcp', async (req, res) => {
        try {
            logger.info('MCP request received', { body: req.body });
            if (req.body.jsonrpc === '2.0') {
                logger.info('Handling JSON-RPC 2.0 request', { method: req.body.method });
                if (req.body.method === 'initialize') {
                    logger.info('Handling initialize request');
                    return res.json({
                        jsonrpc: '2.0',
                        id: req.body.id,
                        result: {
                            protocolVersion: '2025-06-18',
                            serverInfo: {
                                name: 'ServiceNow MCP',
                                version: '1.0.0'
                            },
                            capabilities: {
                                functions: [
                                    {
                                        name: 'send_email',
                                        description: 'Send an email through ServiceNow',
                                        parameters: {
                                            type: ["object"],
                                            properties: {
                                                to: {
                                                    type: ["string"],
                                                    description: 'Email address of the recipient'
                                                },
                                                subject: {
                                                    type: ["string"],
                                                    description: 'Subject of the email'
                                                },
                                                body: {
                                                    type: ["string"],
                                                    description: 'Body content of the email (can include HTML)'
                                                },
                                                from: {
                                                    type: ["string"],
                                                    description: 'Optional sender email address'
                                                }
                                            },
                                            required: ['to', 'subject', 'body']
                                        }
                                    }
                                ]
                            }
                        }
                    });
                }
                if (req.body.method === 'notifications/initialized') {
                    logger.info('Handling notifications/initialized');
                    return res.json({
                        jsonrpc: '2.0'
                    });
                }
                if (req.body.method === 'tools/list') {
                    logger.info('Handling tools/list request');
                    return res.json({
                        jsonrpc: '2.0',
                        id: req.body.id,
                        result: {
                            tools: [
                                {
                                    name: 'send_email',
                                    description: 'Send an email through ServiceNow',
                                    is_declarative: false,
                                    input_schema: {
                                        type: ["object"],
                                        required: ['to', 'subject', 'body'],
                                        properties: {
                                            to: {
                                                type: ["string"],
                                                description: 'Email address of the recipient'
                                            },
                                            subject: {
                                                type: ["string"],
                                                description: 'Subject of the email'
                                            },
                                            body: {
                                                type: ["string"],
                                                description: 'Body content of the email (can include HTML)'
                                            },
                                            from: {
                                                type: ["string"],
                                                description: 'Optional sender email address'
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    });
                }
                if (req.body.method === 'executeFunction') {
                    const functionName = req.body.params?.name;
                    const functionParams = req.body.params?.parameters;
                    logger.info('Executing function', { functionName, functionParams });
                    if (functionName === 'send_email') {
                        if (!functionParams) {
                            return res.json({
                                jsonrpc: '2.0',
                                id: req.body.id,
                                error: {
                                    code: -32602,
                                    message: 'Invalid params: Missing parameters'
                                }
                            });
                        }
                        const { to, subject, body, from } = functionParams;
                        if (!to || !subject || !body) {
                            return res.json({
                                jsonrpc: '2.0',
                                id: req.body.id,
                                error: {
                                    code: -32602,
                                    message: 'Invalid params: Missing required parameters (to, subject, body)'
                                }
                            });
                        }
                        try {
                            const result = await (0, emailUtil_1.sendSimpleEmail)({ to, subject, body, from });
                            return res.json({
                                jsonrpc: '2.0',
                                id: req.body.id,
                                result: result
                            });
                        }
                        catch (error) {
                            return res.json({
                                jsonrpc: '2.0',
                                id: req.body.id,
                                error: {
                                    code: -32603,
                                    message: `Internal error: ${error.message}`
                                }
                            });
                        }
                    }
                    return res.json({
                        jsonrpc: '2.0',
                        id: req.body.id,
                        error: {
                            code: -32601,
                            message: `Method not found: ${functionName}`
                        }
                    });
                }
                return res.json({
                    jsonrpc: '2.0',
                    id: req.body.id || null,
                    error: {
                        code: -32601,
                        message: `Method not found: ${req.body.method}`
                    }
                });
            }
            const { function_name, parameters } = req.body;
            if (!function_name) {
                return res.status(400).json({
                    error: 'Missing function_name in request'
                });
            }
            if (function_name === 'send_email') {
                if (!parameters) {
                    return res.status(400).json({
                        error: 'Missing parameters for send_email function'
                    });
                }
                const { to, subject, body, from } = parameters;
                if (!to || !subject || !body) {
                    return res.status(400).json({
                        error: 'Missing required parameters: to, subject, and body are required'
                    });
                }
                const result = await (0, emailUtil_1.sendSimpleEmail)({ to, subject, body, from });
                return res.json(result);
            }
            return res.status(404).json({
                error: `Unknown function: ${function_name}`
            });
        }
        catch (error) {
            logger.error('Error handling MCP request', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });
    app.get('/mcp/schema', (req, res) => {
        logger.info('MCP schema request received');
        try {
            const fs = require('fs');
            const path = require('path');
            const schemaPath = path.resolve(process.cwd(), 'mcp-schema.json');
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
            res.json(schema);
        }
        catch (error) {
            logger.error('Failed to load MCP schema', error);
            res.status(500).json({
                error: 'Failed to load MCP schema',
                message: error.message
            });
        }
    });
    app.get('/mcp/test', (req, res) => {
        res.json({
            status: 'ok',
            message: 'MCP server is running and properly configured',
            endpoints: [
                { path: '/mcp', method: 'POST', description: 'MCP function endpoint' },
                { path: '/mcp/schema', method: 'GET', description: 'MCP schema endpoint' }
            ],
            functions: ['send_email']
        });
    });
    logger.info('MCP endpoints registered successfully');
}
//# sourceMappingURL=mcp-endpoint.js.map