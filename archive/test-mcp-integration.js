/**
 * Test script for ServiceNow MCP integration with Windsurf
 * This script demonstrates how to connect to your ServiceNow MCP server
 * and call the send_email function
 */
require('dotenv').config();
const { spawnSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ensure the MCP server is running first
console.log('Starting ServiceNow MCP server...');

// Test calling the MCP server directly
async function testDirectMcpCall() {
  try {
    // First check if the server is running by hitting the health endpoint
    console.log('Testing server health...');
    
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('Health check response:', healthResponse.data);
    
    // Now test the MCP endpoint with a direct API call
    console.log('\nTesting MCP send_email function...');
    
    const mcpResponse = await axios.post('http://localhost:3000/mcp', {
      function_name: 'send_email',
      parameters: {
        to: 'gajendra.singh@servicenow.com',
        subject: 'MCP Integration Test',
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>MCP Integration Test</h2>
            <p>This email was sent through the ServiceNow MCP server integration test.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('MCP Response:', JSON.stringify(mcpResponse.data, null, 2));
    return mcpResponse.data;
  } catch (error) {
    console.error('Error testing MCP server:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Use the Windsurf MCP client to test (requires @windsurf/mcp-client)
async function testWindsurfMcpClient() {
  try {
    // Check if the @windsurf/mcp-client package is installed
    let McpClient;
    try {
      McpClient = require('@windsurf/mcp-client').McpClient;
      console.log('Found @windsurf/mcp-client package');
    } catch (err) {
      console.warn('\nWarning: @windsurf/mcp-client package not found. Only direct testing will be performed.');
      console.warn('To install: npm install --save @windsurf/mcp-client');
      return;
    }
    
    console.log('\nTesting with Windsurf MCP client...');
    
    // Use MCP client to connect to your ServiceNow MCP
    const servicenowMcp = new McpClient('servicenow');
    
    // Send an email using the client
    const result = await servicenowMcp.call('send_email', {
      to: 'gajendra.singh@servicenow.com',
      subject: 'Windsurf MCP Client Test',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Windsurf MCP Client Test</h2>
          <p>This email was sent through the Windsurf MCP client.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    console.log('Windsurf MCP client result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error using Windsurf MCP client:', error.message);
    console.error('This is likely because the @windsurf/mcp-client package is not installed');
    console.error('or the client is not correctly configured with your MCP server.');
  }
}

// Execute the tests
async function runTests() {
  try {
    // First test - direct API call
    await testDirectMcpCall();
    
    // Second test - Windsurf MCP client
    await testWindsurfMcpClient();
    
    console.log('\nTests completed. Check your ServiceNow instance for email records.');
  } catch (error) {
    console.error('\nTesting failed:', error.message);
  }
}

// Make sure the MCP server is running first, then run tests
runTests();
