/**
 * Test ServiceNow's built-in notification API directly
 * This is a last resort attempt to send emails
 */
require('dotenv').config();
const axios = require('axios');

// Extract credentials from .env
const instance = process.env.SERVICENOW_INSTANCE_URL;
const username = process.env.SERVICENOW_USERNAME;
const password = process.env.SERVICENOW_PASSWORD;

// Create API client
const client = axios.create({
  baseURL: `${instance}/api/now/v1`,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  auth: {
    username,
    password
  }
});

async function testDirectNotification() {
  console.log('Testing ServiceNow direct notification API');
  
  try {
    // First, try creating a real notification using ServiceNow's notification API
    const notifyResponse = await client.post('/ui/notification/create', {
      title: "CRITICAL TEST - Please acknowledge receipt",
      type: "error",  // Can be: info, error, warning
      message: `This is a direct notification API test at ${new Date().toISOString()}`,
      recipients: ["gajendra.singh@servicenow.com"],
      emailRecipients: ["gajendra.singh@servicenow.com"]
    });
    
    console.log('Notification created successfully!');
    console.log(JSON.stringify(notifyResponse.data, null, 2));
    
    return notifyResponse.data;
  } catch (notifyError) {
    console.error('Notification API failed:', notifyError.message);
    
    if (notifyError.response) {
      console.error('Error status:', notifyError.response.status);
      console.error('Error data:', JSON.stringify(notifyError.response.data, null, 2));
    }
    
    // Try inbound email API as a last resort
    try {
      console.log('\nTrying inbound email API...');
      
      // Simulate an inbound email which might create a ticket and send notifications
      const inboundResponse = await client.post('/email/simulate', {
        instance: instance,
        to: "helpdesk@" + new URL(instance).hostname,
        from: "gsailearning@service-now.com",
        subject: "URGENT SIMULATION TEST - Please acknowledge",
        body: "This is a test of the inbound email simulation API. Please confirm receipt."
      });
      
      console.log('Inbound email simulation successful!');
      console.log(JSON.stringify(inboundResponse.data, null, 2));
      
      return inboundResponse.data;
    } catch (inboundError) {
      console.error('Inbound email API failed:', inboundError.message);
      
      if (inboundError.response) {
        console.error('Error status:', inboundError.response.status);
        console.error('Error data:', JSON.stringify(inboundError.response.data, null, 2));
      }
      
      // Last attempt - try to directly create a user notification
      try {
        console.log('\nTrying user notification record creation...');
        
        // Get user sys_id first
        const userResponse = await client.get('/table/sys_user?sysparm_query=email=gajendra.singh@servicenow.com&sysparm_fields=sys_id,name');
        
        if (userResponse.data?.result?.length > 0) {
          const userId = userResponse.data.result[0].sys_id;
          console.log(`Found user with sys_id: ${userId}`);
          
          // Create direct notification for this user
          const userNotifyResponse = await client.post('/table/sys_notification', {
            state: "ready",
            user: userId,
            notification_type: "email",
            device_type: "email",
            description: "FINAL ATTEMPT - Direct notification",
            message: `This is a direct notification test at ${new Date().toISOString()}`
          });
          
          console.log('User notification created!');
          console.log(JSON.stringify(userNotifyResponse.data, null, 2));
          
          return userNotifyResponse.data;
        } else {
          throw new Error('User not found');
        }
      } catch (userNotifyError) {
        console.error('User notification failed:', userNotifyError.message);
        
        if (userNotifyError.response) {
          console.error('Error status:', userNotifyError.response.status);
          console.error('Error data:', JSON.stringify(userNotifyError.response.data, null, 2));
        }
        
        throw new Error('All notification attempts failed');
      }
    }
  }
}

// Execute the test
testDirectNotification()
  .then(() => console.log('\nTest completed - check your notifications or email'))
  .catch(err => console.error('\nAll notification methods failed:', err.message));
