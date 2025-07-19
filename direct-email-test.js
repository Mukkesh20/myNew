/**
 * Direct test for ServiceNow email functionality bypassing the MCP server
 */
require('./register-paths'); // Register our path aliases

const ServiceNowClient = require('./dist/servicenow/client').default;

async function testSendEmail() {
  try {
    console.log('Creating ServiceNow client...');
    const client = new ServiceNowClient();
    
    console.log('Sending test email...');
    const result = await client.sendEmail({
      to: 'gajendra.singh@servicenow.com',
      subject: 'Direct Test Email from ServiceNow API',
      body: '<h1>Hello from ServiceNow!</h1><p>This is a direct test of the email functionality.</p>',
      // from is optional, defaults to configured sender
    });
    
    console.log('Email sent successfully!');
    console.log('ServiceNow response:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    throw error;
  }
}

// Execute the test
testSendEmail()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err.message));
