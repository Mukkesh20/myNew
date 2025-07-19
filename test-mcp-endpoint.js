/**
 * Test script for MCP endpoint integration with Claude Desktop
 */
const axios = require('axios');

// Test the MCP test endpoint
async function testMcpEndpoint() {
  console.log('Testing MCP test endpoint...');
  try {
    const response = await axios.get('http://localhost:3000/mcp/test');
    console.log('MCP Test Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing MCP endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test the MCP schema endpoint
async function testMcpSchema() {
  console.log('\nTesting MCP schema endpoint...');
  try {
    const response = await axios.get('http://localhost:3000/mcp/schema');
    console.log('MCP Schema Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing MCP schema endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test the main MCP endpoint with a send_email function call
async function testMcpSendEmail() {
  console.log('\nTesting MCP send_email function...');
  try {
    const response = await axios.post('http://localhost:3000/mcp', {
      function_name: 'send_email',
      parameters: {
        to: 'gajendra.singh@servicenow.com',
        subject: 'Claude Desktop MCP Integration Test',
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Claude Desktop MCP Integration Test</h2>
            <p>This email was sent through the MCP endpoint that integrates with Claude Desktop.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
        from: 'gajendra.singh@servicenow.com'
      }
    });
    console.log('MCP Send Email Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing MCP send_email function:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testMcpEndpoint();
  await testMcpSchema();
  await testMcpSendEmail();
  console.log('\nAll tests completed');
}

runAllTests();
