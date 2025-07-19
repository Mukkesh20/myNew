/**
 * Test basic ServiceNow API access with the v1 API version
 */
require('dotenv').config();

const axios = require('axios');

// Extract credentials from .env
const instance = process.env.SERVICENOW_INSTANCE_URL;
const username = process.env.SERVICENOW_USERNAME;
const password = process.env.SERVICENOW_PASSWORD;

console.log(`Testing v1 API connection to: ${instance}`);
console.log(`Using username: ${username}`);
console.log(`Using API version: v1`);

// Test the connection with the v1 API to list available tables
axios({
  method: 'get',
  url: `${instance}/api/now/v1/table/sys_db_object?sysparm_fields=name,label&sysparm_limit=10`,
  auth: {
    username,
    password
  },
  headers: {
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('✅ API connection successful!');
  console.log('Status:', response.status);
  console.log('Available tables:');
  if (response.data && response.data.result) {
    response.data.result.forEach(table => {
      console.log(`- ${table.name}: ${table.label}`);
    });
  } else {
    console.log('No tables found in response');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  }
})
.catch(error => {
  console.error('❌ API connection failed!');
  console.error('Error:', error.message);
  
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response data:', JSON.stringify(error.response.data, null, 2));
  }
});
