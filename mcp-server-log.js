/**
 * Simple logging utility for the MCP server
 */
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logFile = options.logFile || path.join(__dirname, 'mcp-server.log');
    this.errorFile = options.errorFile || path.join(__dirname, 'mcp-server-error.log');
    
    // Create log files if they don't exist
    this._ensureFile(this.logFile);
    this._ensureFile(this.errorFile);
  }
  
  _ensureFile(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }
  }
  
  _getTimestamp() {
    return new Date().toISOString();
  }
  
  _writeToFile(filePath, message) {
    const timestamp = this._getTimestamp();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(filePath, logEntry);
  }
  
  info(message) {
    const formattedMessage = `INFO: ${message}`;
    console.log(formattedMessage);
    this._writeToFile(this.logFile, formattedMessage);
  }
  
  error(message, error) {
    let formattedMessage = `ERROR: ${message}`;
    
    if (error) {
      formattedMessage += `\n  ${error.message}`;
      if (error.stack) {
        formattedMessage += `\n  ${error.stack}`;
      }
    }
    
    console.error(formattedMessage);
    this._writeToFile(this.errorFile, formattedMessage);
  }
}

module.exports = Logger;
