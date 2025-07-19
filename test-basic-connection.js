/**
 * Basic ServiceNow connection test
 */
const axios = require('axios');
require('dotenv').config();

// Extract credentials from .env
const instance = process.env.SERVICENOW_INSTANCE_URL;
const username = process.env.SERVICENOW_USERNAME;
const password = process.env.SERVICENOW_PASSWORD;

console.log(`Testing connection to: ${instance}`);
console.log(`Using username: ${username}`);

// Test the connection directly without any API paths
axios({
  method: 'get',
  url: `${instance}/api/now/table/sys_user?sysparm_limit=1`,
  auth: {
    username,
    password
  },
  headers: {
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('✅ Connection successful!');
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.error('❌ Connection failed!');
  console.error('Error:', error.message);
  
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response data:', JSON.stringify(error.response.data, null, 2));
  }
  
  // Try to provide some diagnostic information
  console.log('\n--- Diagnostic Information ---');
  console.log('1. Check if the instance URL is correct and accessible');
  console.log(`2. Try accessing ${instance} in a browser`);
  console.log('3. Verify username and password are correct');
  console.log('4. Check if REST API access is enabled for your account');
});
