/**
 * TypeScript path registration module
 * Ensures TypeScript path aliases (@/...) work correctly in the compiled JavaScript
 */
import path from 'path';

try {
  // Try to import module-alias - this is required at runtime
  // We use require here because it's a CommonJS module
  const moduleAlias = require('module-alias');
  
  // Calculate the base path for our project
  const basePath = path.resolve(__dirname, '..');
  
  // Register the path aliases
  moduleAlias.addAliases({
    '@': __dirname  // @ points to the src directory (or dist after compilation)
  });
  
  console.log('TypeScript path aliases registered:', {
    '@': __dirname
  });
} catch (err) {
  console.error('Failed to register path aliases:', err);
  console.error('Make sure you have installed module-alias: npm install --save module-alias');
}
