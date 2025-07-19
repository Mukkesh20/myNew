import moduleAlias from 'module-alias';
import path from 'path';

// Register path aliases for runtime
// In development, __dirname is /Users/gajendra.singh/NowGPT/src/utils
// In production (after build), __dirname is /Users/gajendra.singh/NowGPT/dist/utils
const srcPath = __dirname.includes('/dist/') 
  ? path.resolve(__dirname, '../../src') 
  : path.resolve(__dirname, '..');

moduleAlias.addAliases({
  '@': srcPath
});

console.log('Module aliases registered with base path:', srcPath);
