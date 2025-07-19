/**
 * Direct ServiceNow REST API email sending test
 * This uses the REST API directly with the specialized email endpoint
 */
require('dotenv').config();
const axios = require('axios');

// Extract credentials from .env
const instance = process.env.SERVICENOW_INSTANCE_URL;
const username = process.env.SERVICENOW_USERNAME;
const password = process.env.SERVICENOW_PASSWORD;

async function sendDirectEmail() {
  console.log(`Using ServiceNow instance: ${instance}`);
  console.log(`With username: ${username}`);
  
  try {
    // Create the email payload using a specialized REST API endpoint
    const emailEndpoint = `${instance}/api/now/v1/email`;
    
    const emailPayload = {
      email_to: 'gajendra.singh@servicenow.com',
      email_from: 'gajendra.singh@servicenow.com', // Using sender that's likely allowed in your instance
      email_subject: 'DIRECT API TEST - Please verify receipt',
      email_body: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Direct API Email Test</h2>
          <p>This is a test sent via the direct ServiceNow email REST API endpoint.</p>
          <p>If you receive this, please confirm that the direct API approach works.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      direct: true
    };
    
    console.log('Sending email via direct REST API...');
    
    // Make the REST API call
    const response = await axios({
      method: 'post',
      url: emailEndpoint,
      auth: {
        username,
        password
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: emailPayload
    });
    
    console.log('Email sent successfully via direct API!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Failed to send email via direct API:', error.message);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Try another endpoint approach if the first one fails
    try {
      console.log('\nTrying alternate email endpoint...');
      
      // Alternative approach using a different endpoint
      const alternateEndpoint = `${instance}/api/now/v1/email/send`;
      
      const alternatePayload = {
        to: 'gajendra.singh@servicenow.com',
        from: 'gajendra.singh@servicenow.com',
        subject: 'ALTERNATE ENDPOINT TEST',
        body: 'This is a test using the alternate email sending endpoint.',
        type: 'send'
      };
      
      const alternateResponse = await axios({
        method: 'post',
        url: alternateEndpoint,
        auth: {
          username,
          password
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: alternatePayload
      });
      
      console.log('Email sent successfully via alternate API!');
      console.log('Response:', JSON.stringify(alternateResponse.data, null, 2));
      return alternateResponse.data;
    } catch (alternateError) {
      console.error('Failed with alternate endpoint too:', alternateError.message);
      
      if (alternateError.response) {
        console.error('Error status:', alternateError.response.status);
        console.error('Error data:', JSON.stringify(alternateError.response.data, null, 2));
      }
      
      // As a last resort, try the notification API
      try {
        console.log('\nTrying notification API as last resort...');
        
        // Create a notification (which will send an email)
        const notificationEndpoint = `${instance}/api/now/v1/table/sysevent_email_action`;
        
        const notificationPayload = {
          name: `Direct_Email_Test_${Date.now()}`,
          recipient: 'gajendra.singh@servicenow.com',
          subject: 'NOTIFICATION API TEST',
          message: 'This is a test using the notification API directly.'
        };
        
        const notificationResponse = await axios({
          method: 'post',
          url: notificationEndpoint,
          auth: {
            username,
            password
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: notificationPayload
        });
        
        console.log('Notification created successfully!');
        console.log('Response:', JSON.stringify(notificationResponse.data, null, 2));
        return notificationResponse.data;
      } catch (notificationError) {
        console.error('All approaches failed. ServiceNow email capability may be disabled or restricted.');
        throw notificationError;
      }
    }
  }
}

// Execute the test
sendDirectEmail()
  .then(() => console.log('\nEmail test completed'))
  .catch(err => console.error('\nTest failed with all approaches'));
