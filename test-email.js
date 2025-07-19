/**
 * Simple test client for the ServiceNow MCP send_email function
 */
const http = require('http');
require('dotenv').config();

// Test email parameters
const testEmail = {
  to: "gajendra.singh@servicenow.com", // Replace with a real email for actual testing
  subject: "Test Email from ServiceNow MCP",
  body: "<h1>Hello from ServiceNow MCP!</h1><p>This is a test email sent via the MCP server.</p>",
  // from is optional, will use default from config if not provided
};

console.log('Sending test email:', testEmail);

// Create a simple HTTP request to the MCP server
const postData = JSON.stringify({
  function: "send_email",
  parameters: testEmail,
  // Typically MCP would include context, but our mock implementation doesn't require it
  context: {
    userId: "test-user",
    conversationId: "test-conversation-" + Date.now()
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,  // Default port for the MCP server
  path: '/invoke',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Response:', parsedData);
      console.log('Email test completed successfully!');
    } catch (e) {
      console.log('Raw response:', responseData);
      console.error('Error parsing response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
