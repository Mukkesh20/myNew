/**
 * Direct test of the MCP email functionality
 * This bypasses the MCP server and directly calls the email utility
 */
require('dotenv').config();
require('./register-paths');

// Import the email utility directly
const { sendSimpleEmail } = require('./dist/servicenow/emailUtil');

async function testDirectEmailSending() {
  console.log('Testing ServiceNow email sending directly (bypassing MCP)...');
  
  try {
    // Send a test email
    const result = await sendSimpleEmail({
      to: 'gajendra.singh@servicenow.com',
      subject: 'Direct MCP Test',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Direct MCP Test</h2>
          <p>This email was sent by directly calling the email utility.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      from: 'gajendra.singh@servicenow.com'
    });
    
    console.log('Email result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Run the test
testDirectEmailSending()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err.message));
