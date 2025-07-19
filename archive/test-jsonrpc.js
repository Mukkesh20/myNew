/**
 * Test script for JSON-RPC 2.0 protocol compatibility with mcp-remote
 */
const axios = require('axios');

// Test the JSON-RPC 2.0 initialization request
async function testInitialize() {
  console.log('Testing initialize request...');
  const response = await axios.post('http://localhost:8080/mcp', {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  });
  
  console.log('Initialize response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

// Test sending an email via JSON-RPC 2.0
async function testSendEmail() {
  console.log('\nTesting send_email function...');
  const response = await axios.post('http://localhost:8080/mcp', {
    jsonrpc: '2.0',
    id: 2,
    method: 'executeFunction',
    params: {
      name: 'send_email',
      parameters: {
        to: 'gajendra.singh@servicenow.com',
        subject: 'JSON-RPC Test',
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>JSON-RPC Protocol Test</h2>
            <p>This email was sent through the JSON-RPC 2.0 protocol that mcp-remote uses.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
        from: 'gajendra.singh@servicenow.com'
      }
    }
  });
  
  console.log('Send email response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

// Run tests
async function runTests() {
  try {
    await testInitialize();
    await testSendEmail();
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing JSON-RPC protocol:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

runTests();
