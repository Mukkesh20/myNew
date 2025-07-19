#!/usr/bin/env node
/**
 * Simple MCP bridge for Claude Desktop
 * This uses ESM module format which is required by mcp-remote
 */

// Import dependencies
import { createServer } from 'mcp-remote';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Setup path handling for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register path aliases (simplified version for ESM)
const distPath = join(__dirname, 'dist');
process.env.NODE_PATH = distPath;
require('module').Module._initPaths();

// Import ServiceNow email function
import('./dist/servicenow/emailUtil.js').then(({ sendSimpleEmail }) => {
  console.log('ServiceNow email utility loaded successfully');
  
  // Create the MCP server with the send_email function
  const server = createServer({
    name: 'ServiceNow',
    description: 'ServiceNow Email API Integration',
    version: '1.0.0',
    functions: {
      send_email: {
        description: 'Send an email through ServiceNow',
        parameters: {
          type: ["object"],
          required: ['to', 'subject', 'body'],
          properties: {
            to: { type: ["string"], description: 'Email recipient' },
            subject: { type: ["string"], description: 'Email subject' },
            body: { type: ["string"], description: 'Email body content' },
            from: { type: ["string"], description: 'Sender email (optional)' }
          }
        },
        handler: async (params) => {
          console.log('Sending email:', params);
          try {
            const result = await sendSimpleEmail(params);
            console.log('Email sent successfully:', result.messageId);
            return result;
          } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
          }
        }
      }
    }
  });
  
  // Start the server on port 8888
  const PORT = 8888;
  server.listen(PORT, () => {
    console.log(`ServiceNow MCP server running on port ${PORT}`);
    console.log('Use this configuration in Claude Desktop:');
    console.log(JSON.stringify({
      mcpServers: {
        ServiceNow: {
          url: `http://localhost:${PORT}`,
          type: 'remote'
        }
      }
    }, null, 2));
  });
}).catch(err => {
  console.error('Failed to import email utility:', err);
});
