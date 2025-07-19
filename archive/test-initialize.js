/**
 * Test script specifically for the initialize request
 * This validates that your MCP server correctly advertises its functions to Claude Desktop
 */
const axios = require('axios');

async function testInitializeRequest() {
  console.log('Testing initialize request format...');
  
  try {
    const response = await axios.post('http://localhost:8080/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: {
          name: 'claude-ai',
          version: '0.1.0'
        }
      }
    });
    
    console.log('Initialize response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validate the response format
    const result = response.data.result;
    if (result && result.capabilities && Array.isArray(result.capabilities.functions)) {
      console.log('\nFunctions advertised by your MCP server:');
      result.capabilities.functions.forEach(func => {
        console.log(`- ${func.name}: ${func.description}`);
        console.log('  Required parameters:', func.parameters?.required?.join(', '));
      });
      
      console.log('\nResponse format is valid and functions are properly defined.');
      console.log('Claude Desktop should now be able to see these functions.');
    } else {
      console.error('\nError: Invalid response format');
    }
  } catch (error) {
    console.error('Error testing initialize request:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testInitializeRequest();
