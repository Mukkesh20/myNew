/**
 * Direct MCP endpoint implementation for Claude Desktop integration
 */
import express from 'express';
import { Logger } from '../utils/logger';
import { sendSimpleEmail } from '../servicenow/emailUtil';

const logger = new Logger('MCP-Endpoint');

/**
 * Register MCP endpoints for Claude Desktop integration
 */
export function registerMcpEndpoints(app: express.Express): void {
  logger.info('Registering MCP endpoints for Claude Desktop integration');
  
  // Add middleware to parse JSON requests
  app.use(express.json());
  
  // GET handler for /mcp endpoint - returns tool manifest for Claude Desktop
  app.get('/mcp', (req: express.Request, res: express.Response) => {
    logger.info('GET request to /mcp - sending Tool Manifest');
    
    // Tool Manifest format that Claude Desktop expects
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

  // MCP endpoint for function calls
  app.post('/mcp', async (req: express.Request, res: express.Response) => {
    try {
      logger.info('MCP request received', { body: req.body });
      
      // Check if this is a JSON-RPC 2.0 request
      if (req.body.jsonrpc === '2.0') {
        logger.info('Handling JSON-RPC 2.0 request', { method: req.body.method });
        
        // Handle initialization request
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
        
        // Handle notifications
        if (req.body.method === 'notifications/initialized') {
          logger.info('Handling notifications/initialized');
          return res.json({
            jsonrpc: '2.0'
          });
        }
        
        // Handle tools/list method
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
        
        // Handle function execution
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
              const result = await sendSimpleEmail({ to, subject, body, from });
              
              return res.json({
                jsonrpc: '2.0',
                id: req.body.id,
                result: result
              });
            } catch (error) {
              return res.json({
                jsonrpc: '2.0',
                id: req.body.id,
                error: {
                  code: -32603,
                  message: `Internal error: ${(error as Error).message}`
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
        
        // Return error for unknown methods
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id || null,
          error: {
            code: -32601,
            message: `Method not found: ${req.body.method}`
          }
        });
      }
      
      // Handle legacy direct API format
      const { function_name, parameters } = req.body;
      
      if (!function_name) {
        return res.status(400).json({
          error: 'Missing function_name in request'
        });
      }
      
      // Handle email sending function
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
        
        // Call email sending function directly
        const result = await sendSimpleEmail({ to, subject, body, from });
        
        return res.json(result);
      }
      
      // Return error for unknown functions
      return res.status(404).json({
        error: `Unknown function: ${function_name}`
      });
    } catch (error) {
      logger.error('Error handling MCP request', error);
      
      return res.status(500).json({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  });
  
  // Schema endpoint for MCP discovery
  app.get('/mcp/schema', (req: express.Request, res: express.Response) => {
    logger.info('MCP schema request received');
    
    try {
      // Get schema from file
      const fs = require('fs');
      const path = require('path');
      
      // Read schema from the file system
      const schemaPath = path.resolve(process.cwd(), 'mcp-schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      res.json(schema);
    } catch (error) {
      logger.error('Failed to load MCP schema', error);
      
      res.status(500).json({
        error: 'Failed to load MCP schema',
        message: (error as Error).message
      });
    }
  });
  
  // Add a test endpoint
  app.get('/mcp/test', (req: express.Request, res: express.Response) => {
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
