/**
 * Standalone MCP server for Claude Desktop integration
 * This creates a dedicated server with the exact endpoints Claude Desktop expects
 */
require('dotenv').config();
require('./register-paths');
const express = require('express');
const { sendSimpleEmail } = require('./dist/servicenow/emailUtil');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
app.use(express.json());

// Load the MCP schema
const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'mcp-schema.json'), 'utf8'));

// Define routes for Claude Desktop integration
app.get('/', (req, res) => {
  res.json({
    name: 'ServiceNow MCP',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/mcp', '/schema', '/test']
  });
});

// MCP schema endpoint (Claude Desktop checks this)
app.get('/schema', (req, res) => {
  console.log('Schema request received');
  res.json(schema);
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ServiceNow MCP server is running and ready for Claude Desktop integration',
    functions: ['send_email']
  });
});

// Main MCP endpoint for function calls
app.post('/', async (req, res) => {
  try {
    console.log('MCP function call received:', req.body.function_name);
    
    const { function_name, parameters } = req.body;
    
    if (!function_name) {
      return res.status(400).json({
        error: 'Missing function_name in request'
      });
    }
    
    if (function_name === 'send_email') {
      if (!parameters || !parameters.to || !parameters.subject || !parameters.body) {
        return res.status(400).json({
          error: 'Missing required parameters for send_email function'
        });
      }
      
      const { to, subject, body, from } = parameters;
      
      // Call the email function
      const result = await sendSimpleEmail({ to, subject, body, from });
      console.log('Email sent successfully:', result.messageId);
      
      return res.json(result);
    }
    
    return res.status(404).json({
      error: `Unknown function: ${function_name}`
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.CLAUDE_MCP_PORT || 9000;
app.listen(PORT, () => {
  console.log(`ServiceNow MCP server for Claude Desktop running on port ${PORT}`);
  console.log(`- Main endpoint: http://localhost:${PORT}/`);
  console.log(`- Schema endpoint: http://localhost:${PORT}/schema`);
  console.log(`- Test endpoint: http://localhost:${PORT}/test`);
});
