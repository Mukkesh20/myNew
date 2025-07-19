/**
 * Test for actual email delivery from ServiceNow
 */
require('./register-paths');
const { sendEmail } = require('./dist/servicenow/notification');

async function testActualEmailDelivery() {
  console.log('Testing ServiceNow direct email delivery...');
  
  try {
    const result = await sendEmail({
      to: "gajendra.singh@servicenow.com",
      subject: "IMPORTANT: Direct Email Test from ServiceNow MCP",
      body: `
        <h1 style="color: #1c87c9;">ServiceNow MCP Email Test</h1>
        <p>This is a test of the <strong>direct email delivery</strong> functionality.</p>
        <p>If you received this in your inbox, it means the ServiceNow MCP server is correctly configured to send actual emails!</p>
        <hr>
        <p><em>Timestamp: ${new Date().toISOString()}</em></p>
      `,
      from: "gsailearning@service-now.com"
    });
    
    console.log('Email delivery request successful:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    if (error.details) {
      console.error('Error details:', JSON.stringify(error.details, null, 2));
    }
    throw error;
  }
}

// Run the test
testActualEmailDelivery()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err.message));
