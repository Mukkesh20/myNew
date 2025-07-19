/**
 * Test for creating a direct user notification in ServiceNow
 */
require('./register-paths');
const ServiceNowClient = require('./dist/servicenow/client').default;
const { config } = require('./dist/config');

async function testDirectNotification() {
  console.log('Testing direct user notification...');
  
  try {
    const client = new ServiceNowClient();
    
    // First find the user
    const users = await client.getRecords('sys_user', {
      sysparm_query: `email=${config.servicenow.username}`,  // Use the admin email
      sysparm_fields: 'sys_id,name,email',
      sysparm_limit: 1
    });
    
    if (users.length === 0) {
      throw new Error('Could not find admin user');
    }
    
    const userId = users[0].sys_id;
    console.log(`Found admin user with ID: ${userId}`);
    
    // Create push notification that will trigger email
    const result = await client.createRecord('sysevent_email_action', {
      name: 'MCP Direct Email ' + Date.now(),
      collection: 'global',
      condition: 'true',
      event_name: 'direct.email.' + Date.now(),
      process_order: '100',
      subject: 'URGENT TEST: Direct notification from MCP',
      message: `
        <h1>This is a direct notification test</h1>
        <p>This notification should trigger an immediate email.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      recipient: config.servicenow.username,  // Send to admin email
      recipientFields: 'email',
      user: userId,
      userField: 'sys_id',
      mailbox: config.servicenow.username
    });
    
    console.log('Created notification action:', result.sys_id);
    
    // Now trigger the event
    const eventResult = await client.createRecord('sysevent', {
      name: 'direct.email.' + Date.now(),
      state: 'ready',
      process_on: 'now',
      queue: 'default',
      user_id: userId,
      user_name: config.servicenow.username,
      parm1: 'test',
      parm2: config.servicenow.username
    });
    
    console.log('Created event trigger:', eventResult.sys_id);
    console.log('Email should be triggered directly to:', config.servicenow.username);
    
    return { action: result, event: eventResult };
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    throw error;
  }
}

// Run the test
testDirectNotification()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err.message));
