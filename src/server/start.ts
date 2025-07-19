/**
 * Server entry point with proper path registration
 */

// First, register the path aliases
import '../register-paths';

// Then import and start the server
import { server } from './index';

// This file should be used as the entry point when starting the server
console.log('ServiceNow MCP Server starting...');
