#!/usr/bin/env node
/**
 * Claude Desktop MCP Bridge
 * 
 * This script acts as a direct bridge between Claude Desktop and your ServiceNow API
 * It uses the mcp-remote package and implements a simple MCP server with the send_email function
 */
require('dotenv').config();
require('./register-paths');

// Import required modules
const { createServer } = require('mcp-remote');
const { sendSimpleEmail } = require('./dist/servicenow/emailUtil');

// Create the MCP server
const server = createServer({
  name: 'ServiceNow',
  description: 'ServiceNow MCP Server for Email Integration',
  version: '1.0.0',
  
  // Define the functions available in this MCP server
  functions: {
    // Define the send_email function
    send_email: {
      description: 'Send an email through ServiceNow',
      parameters: {
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
      },
      
      // Implement the function handler
      handler: async (params) => {
        console.log('Received email request:', params);
        
        try {
          // Call the ServiceNow email function
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

// Start the server
console.log('Starting ServiceNow MCP bridge for Claude Desktop...');
server.listen(8090, () => {
  console.log('ServiceNow MCP bridge running on port 8090');
  console.log('This server implements the send_email function for Claude Desktop');
  console.log('To use, configure Claude Desktop with the following:');
  console.log(JSON.stringify({
    mcpServers: {
      ServiceNow: {
        url: 'http://localhost:8090',
        type: 'remote'
      }
    }
  }, null, 2));
});
