#!/bin/bash
# Start the ServiceNow MCP server for Claude Desktop

echo "Starting ServiceNow MCP server for Claude Desktop..."
cd "$(dirname "$0")"

# Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
  echo "No .env file found. Creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created .env file. Please update with your actual credentials."
  else
    echo "Error: .env.example not found. Please create a .env file manually."
    exit 1
  fi
 fi

# Build TypeScript if dist directory doesn't exist or is outdated
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ] || [ "$(find src -type f -name "*.ts" -newer dist -print -quit)" ]; then
  echo "Building TypeScript code..."
  npm run build
fi

# Start the server using npm script
echo "Starting MCP server..."
npm start
