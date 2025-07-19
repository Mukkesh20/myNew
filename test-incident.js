/**
 * Test creating an incident in ServiceNow to trigger email notifications
 * This is often the most reliable way to send emails in ServiceNow
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

async function createIncident() {
  console.log('Testing ServiceNow incident creation to trigger emails');
  console.log(`Using ServiceNow instance: ${instance}`);
  console.log(`With username: ${username}`);
  
  try {
    // First, find the user by email address
    console.log('Finding user...');
    const userResponse = await client.get('/table/sys_user?sysparm_query=email=gajendra.singh@servicenow.com');
    
    if (!userResponse.data?.result || userResponse.data.result.length === 0) {
      throw new Error('User not found');
    }
    
    const userId = userResponse.data.result[0].sys_id;
    console.log(`Found user with ID: ${userId}`);
    
    // Now create an incident and assign it to the user
    console.log('Creating incident...');
    const incidentPayload = {
      short_description: 'URGENT TEST EMAIL - Please check your inbox',
      description: `
        <h2>Email Delivery Test</h2>
        <p>This incident was created to test email delivery from ServiceNow.</p>
        <p>If you received an email notification about this incident, please mark it as resolved.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      impact: '1',              // High impact
      urgency: '1',             // High urgency
      priority: '1',            // Critical priority (should trigger notifications)
      assigned_to: userId,      // Assign to the user
      caller_id: userId,        // Set caller as the same user
      category: 'Network',      // A common category
      contact_type: 'email',    // Pretend it came in via email
      comments: 'Please verify email notification was received',
      work_notes: 'Created by MCP server to test email notifications'
    };
    
    const incidentResponse = await client.post('/table/incident', incidentPayload);
    
    console.log('Incident created successfully!');
    console.log(JSON.stringify(incidentResponse.data, null, 2));
    
    // Now send a comment update to the incident (which often triggers another notification)
    const incidentNumber = incidentResponse.data.result.number;
    const incidentSysId = incidentResponse.data.result.sys_id;
    
    console.log(`Adding comment to incident ${incidentNumber}...`);
    
    // Add a comment update
    const commentPayload = {
      work_notes: `Additional information added at ${new Date().toISOString()}. This comment should trigger another notification.`,
      comments: 'URGENT: Please verify notification email receipt'
    };
    
    const commentResponse = await client.patch(`/table/incident/${incidentSysId}`, commentPayload);
    
    console.log('Comment added successfully!');
    console.log(JSON.stringify(commentResponse.data, null, 2));
    
    return {
      incident: incidentResponse.data,
      comment: commentResponse.data
    };
  } catch (error) {
    console.error('Error creating incident:', error.message);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Execute the test
createIncident()
  .then(() => console.log('Test completed - check for incident notification emails'))
  .catch(err => console.error('Test failed:', err.message));
