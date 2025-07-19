/**
 * Final simplified test for ServiceNow email sending
 */
require('./register-paths');
const { sendSimpleEmail } = require('./dist/servicenow/emailUtil');

async function testSimpleEmail() {
  console.log('Testing simplified email sending...');
  
  try {
    const result = await sendSimpleEmail({
      to: "gajendra.singh@servicenow.com",
      subject: "FINAL TEST: Simple Email Delivery",
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Final Email Delivery Test</h2>
          <p>This is a final test of email delivery from ServiceNow.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      from: "gajendra.singh@servicenow.com"
    });
    
    console.log('Email sending result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.status === 'error') {
      console.log('\n==== TROUBLESHOOTING TIPS ====');
      console.log('1. Check ServiceNow SMTP configuration');
      console.log('2. Verify admin account has email sending permissions');
      console.log('3. Check if outbound email is enabled on this ServiceNow instance');
      console.log('4. Review ServiceNow system logs for email processing errors');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

// Run the test
testSimpleEmail()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err.message));
