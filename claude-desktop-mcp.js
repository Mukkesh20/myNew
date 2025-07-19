/**
 * ServiceNow MCP Server for Claude Desktop integration
 * 
 * This MCP server provides email sending functionality through ServiceNow
 * and implements the necessary endpoints for Claude Desktop integration.
 */

// Load environment variables from .env file
require('dotenv').config();
require('./register-paths');

// Import dependencies
const express = require('express');
const cors = require('cors');
const { sendSimpleEmail } = require('./dist/servicenow/emailUtil');

// Reusable email schema constant - MCP compatible format
const EMAIL_SCHEMA = {
  type: ['object'],
  properties: {
    to: {
      type: ['string'],
      description: 'Email address of the recipient'
    },
    subject: {
      type: ['string'],
      description: 'Subject of the email'
    },
    body: {
      type: ['string'],
      description: 'Body content of the email (can include HTML)'
    },
    from: {
      type: ['string'],
      description: 'Optional sender email address'
    }
  },
  required: ['to', 'subject', 'body'],
  additionalProperties: false
};

// Log environment variables (without sensitive info)
console.log('Environment loaded:', {
  SERVICENOW_INSTANCE_URL: process.env.SERVICENOW_INSTANCE_URL,
  SERVICENOW_API_VERSION: process.env.SERVICENOW_API_VERSION,
  SERVICENOW_USERNAME: process.env.SERVICENOW_USERNAME ? '[SET]' : '[NOT SET]',
  SERVICENOW_PASSWORD: process.env.SERVICENOW_PASSWORD ? '[SET]' : '[NOT SET]',
  SERVICENOW_AUTH_TYPE: process.env.SERVICENOW_AUTH_TYPE,
  SERVICENOW_DEFAULT_SENDER_EMAIL: process.env.SERVICENOW_DEFAULT_SENDER_EMAIL
});

// Create Express app with CORS enabled for Claude Desktop
const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint for discovery
app.get('/', (req, res) => {
  res.json({
    name: "ServiceNow MCP",
    description: "ServiceNow Email Integration for Claude Desktop",
    version: "1.0.0",
    status: "running",
    endpoints: ["/mcp", "/openapi.json"]
  });
});

// Root MCP endpoint for Claude Desktop - GET handler for Tool Manifest
app.get('/mcp', (req, res) => {
  console.log('GET request to /mcp received - sending Tool Manifest');
  
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
      url: "http://localhost:8080/openapi.json"
    },
    tools: [
      {
        name: "send_email",
        description: "Send an email through ServiceNow",
        input_schema: EMAIL_SCHEMA
      }
    ]
  };
  
  res.json(toolManifest);
});

// OpenAPI specification endpoint
app.get('/openapi.json', (req, res) => {
  console.log('OpenAPI specification requested');
  
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "ServiceNow Email API",
      description: "API for sending emails through ServiceNow",
      version: "1.0.0"
    },
    paths: {
      "/send-email": {
        post: {
          operationId: "send_email",
          summary: "Send an email through ServiceNow",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: EMAIL_SCHEMA
              }
            }
          },
          responses: {
            "200": {
              description: "Email sent successfully",
              content: {
                "application/json": {
                  schema: {
                    type: ['object'],
                    properties: {
                      status: {
                        type: ['string'],
                        enum: ["sent", "error"],
                        description: "Status of the email sending operation"
                      },
                      messageId: {
                        type: ['string'],
                        description: "ID of the sent message"
                      },
                      error: {
                        type: ['string'],
                        description: "Error message if status is 'error'"
                      }
                    },
                    additionalProperties: false
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  res.json(openApiSpec);
});

// Root MCP endpoint for Claude Desktop - POST handler for actual functionality
app.post('/mcp', express.json(), async (req, res) => {
  console.log('MCP POST request received:', req.body);
  try {
    // Handle various request formats
    
    // Check if this is a jsonrpc request (used by mcp-remote)
    if (req.body.jsonrpc === '2.0') {
      console.log('Detected jsonrpc 2.0 request');
      
      // Handle initialization request
      if (req.body.method === 'initialize') {
        console.log('Handling initialize request with full function definitions');
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
                  parameters: EMAIL_SCHEMA
                }
              ]
            }
          }
        });
      }
      
      // Handle tools/list method for Claude Desktop tool discovery
      if (req.body.method === 'tools/list') {
        console.log('Handling tools/list request');
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            tools: [
              {
                name: 'send_email',
                description: 'Send an email through ServiceNow',
                is_declarative: false,
                safe_to_run: false,
                input_schema: EMAIL_SCHEMA
              }
            ]
          }
        });
      }
      
      // Handle function calls
      if (req.body.method === 'executeFunction') {
        const functionName = req.body.params?.name;
        const functionParams = req.body.params?.parameters;
        
        if (functionName === 'send_email') {
          console.log('Processing send_email request:', functionParams);
          const result = await sendSimpleEmail(functionParams);
          
          return res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            result: result
          });
        }
        
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32601,
            message: `Function not found: ${functionName}`
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
    
    // Original direct request format
    const { function_name, parameters } = req.body;
    
    if (!function_name) {
      return res.status(400).json({ error: 'Missing function_name in request' });
    }
    
    if (function_name === 'send_email') {
      if (!parameters || !parameters.to || !parameters.subject || !parameters.body) {
        return res.status(400).json({ 
          error: 'Missing required parameters for send_email function' 
        });
      }
      
      console.log('Sending email:', parameters);
      const result = await sendSimpleEmail(parameters);
      console.log('Email sent successfully:', result);
      
      return res.json(result);
    }
    
    return res.status(404).json({ error: `Unknown function: ${function_name}` });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Test endpoint for checking server status
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MCP server is running',
    timestamp: new Date().toISOString()
  });
});

// Direct schema access endpoint - necessary for Windsurf to bypass its internal schema validation
app.get('/schema.json', (req, res) => {
  console.log('Schema access requested - providing fixed schema');
  res.json({
    "send_email": {
      "name": "send_email",
      "description": "Send an email through ServiceNow",
      "parameters": {
        "type": ["object"],
        "required": ["to", "subject", "body"],
        "properties": {
          "to": {
            "type": ["string"],
            "description": "Email address of the recipient"
          },
          "subject": {
            "type": ["string"],
            "description": "Subject of the email"
          },
          "body": {
            "type": ["string"],
            "description": "Body content of the email (can include HTML)"
          },
          "from": {
            "type": ["string"],
            "description": "Optional sender email address"
          }
        }
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ServiceNow MCP server running on port ${PORT}`);
  console.log('MCP Endpoint: http://localhost:8080/mcp');
  console.log('OpenAPI Endpoint: http://localhost:8080/openapi.json');
  console.log('Test with: curl http://localhost:8080/test');
  console.log('\nClaude Desktop Config:');
  console.log(JSON.stringify({
    "mcpServers": {
      "ServiceNow": {
        "url": `http://localhost:${PORT}/mcp`,
        "type": "remote"
      }
    }
  }, null, 2));
});