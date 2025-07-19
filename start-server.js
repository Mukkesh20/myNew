/**
 * Server startup script that handles path registration before loading the app
 */

// First register module aliases
require('./register-paths');

// Then load and start the server
require('./dist/server/index.js');
