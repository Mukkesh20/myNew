/**
 * Final test for the improved ServiceNow email notification system
 */
require('./register-paths'); // Register our path aliases

const { sendEmail } = require('./dist/servicenow/notification');

async function testEmailNotification() {
  try {
    console.log('Testing ServiceNow email notification...');
    
    const result = await sendEmail({
      to: 'gajendra.singh@servicenow.com',
      subject: 'Test Email from ServiceNow MCP [Final Test]',
      body: `
        <h1>Hello from ServiceNow MCP!</h1>
        <p>This is a test of the notification email system using multiple fallback methods.</p>
        <p>If you received this email, it means our MCP server's email functionality is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      // From is optional
    });
    
    console.log('Email notification sent successfully!');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error sending email notification:', error);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    throw error;
  }
}

// Execute the test
testEmailNotification()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err.message));
