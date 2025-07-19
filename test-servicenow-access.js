/**
 * Test basic ServiceNow API access to understand available endpoints
 */
require('./register-paths');

const axios = require('axios');
const config = require('./dist/config').config;

async function testServiceNowAccess() {
  console.log('Testing ServiceNow API Access');
  
  const baseURL = `${config.servicenow.instanceUrl}/api/now/${config.servicenow.apiVersion}`;
  console.log(`Base URL: ${baseURL}`);
  
  const client = axios.create({
    baseURL,
    timeout: config.servicenow.timeout,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    auth: {
      username: config.servicenow.username,
      password: config.servicenow.password,
    },
  });
  
  try {
    // Test 1: Check if we can access the incident API
    console.log('\n--- Test 1: Checking access to incident API ---');
    const incidentResponse = await client.get('/table/incident?sysparm_limit=1');
    console.log('✅ Successfully accessed incident API');
    console.log(`Status: ${incidentResponse.status}`);
    console.log(`Results: ${incidentResponse.data.result ? incidentResponse.data.result.length : 0} incidents`);
  } catch (error) {
    console.error('❌ Failed to access incident API:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
  
  try {
    // Test 2: Check email notification table access
    console.log('\n--- Test 2: Checking access to email notification table ---');
    const emailResponse = await client.get('/table/sys_email?sysparm_limit=1');
    console.log('✅ Successfully accessed email table');
    console.log(`Status: ${emailResponse.status}`);
    console.log(`Results: ${emailResponse.data.result ? emailResponse.data.result.length : 0} email records`);
  } catch (error) {
    console.error('❌ Failed to access email table:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
  
  try {
    // Test 3: Check notification API access
    console.log('\n--- Test 3: Checking access to notification API ---');
    const notifyResponse = await client.get('/table/sysevent_email_action?sysparm_limit=1');
    console.log('✅ Successfully accessed notification API');
    console.log(`Status: ${notifyResponse.status}`);
    console.log(`Results: ${notifyResponse.data.result ? notifyResponse.data.result.length : 0} notification templates`);
  } catch (error) {
    console.error('❌ Failed to access notification API:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the tests
testServiceNowAccess().catch(err => console.error('Test failed:', err.message));
