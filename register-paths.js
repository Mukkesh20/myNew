/**
 * Simple module path registration for handling TypeScript path aliases at runtime
 * This must be required at the start of the application
 */
const path = require('path');
const moduleAlias = require('module-alias');

// Register the base path for aliases - this handles both development and production
const basePath = path.resolve(__dirname);

// Handle both dist directory and direct directory structure
let distPath = path.join(basePath, 'dist');

// Register multiple possible paths to handle various execution environments
moduleAlias.addAliases({
  '@': distPath,
  '@/config': path.join(distPath, 'config'),
  '@/utils': path.join(distPath, 'utils'),
  '@/types': path.join(distPath, 'types'),
  '@/servicenow': path.join(distPath, 'servicenow'),
  '@/server': path.join(distPath, 'server')
});

console.log('Path aliases registered with base path:', distPath);
