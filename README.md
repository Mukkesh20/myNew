# NowGPT MCP Server

ServiceNow MCP Server for AI-powered ServiceNow interactions. This server provides tools for Claude Desktop and other AI assistants to interact with ServiceNow.

## Features

- **Email Integration**: Send emails through ServiceNow
- **JSON-RPC 2.0 Support**: Compatible with Claude Desktop and other MCP clients
- **TypeScript Implementation**: Modern, type-safe codebase

## Quick Start

The easiest way to start the server is using the provided script:

```bash
./start-mcp.sh
```

This script will:
1. Create `.env` from `.env.example` if needed
2. Build TypeScript code if needed
3. Start the server on port 8080

## Manual Setup

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Copy the example environment file and edit it with your ServiceNow credentials:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

Required environment variables:
- `SERVICENOW_INSTANCE_URL`: Your ServiceNow instance URL
- `SERVICENOW_USERNAME`: ServiceNow username
- `SERVICENOW_PASSWORD`: ServiceNow password

Optional environment variables:
- `SERVICENOW_API_VERSION`: API version (default: v1)
- `SERVICENOW_TIMEOUT`: Request timeout in ms (default: 30000)
- `SERVICENOW_RETRY_ATTEMPTS`: Number of retry attempts (default: 3)
- `SERVICENOW_DEFAULT_SENDER_EMAIL`: Default sender email address
- `MCP_NAME`: MCP server name (default: now-gpt-mcp)
- `MCP_VERSION`: MCP server version (default: 1.0.0)
- `MCP_MAX_CONCURRENT`: Max concurrent requests (default: 10)
- `LOG_LEVEL`: Logging level (default: info)
- `LOG_FORMAT`: Logging format (default: json)

### Build

```bash
npm run build
```

### Start Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

## API Endpoints

- **Main MCP Endpoint**: `http://localhost:8080/mcp`
- **Health Check**: `http://localhost:8080/health`
- **Test Endpoint**: `http://localhost:8080/mcp/test`
- **Schema Endpoint**: `http://localhost:8080/mcp/schema`

## Claude Desktop Integration

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "ServiceNow": {
      "url": "http://localhost:8080/mcp",
      "type": "remote"
    }
  }
}
```

## Available Tools

### send_email

Send an email through ServiceNow.

**Parameters**:
- `to`: Email address of the recipient (required)
- `subject`: Email subject (required)
- `body`: Email body content (supports HTML) (required)
- `from`: Email address of the sender (optional)

## Development

### Project Structure

- `src/`: Source code
  - `config/`: Configuration management
  - `server/`: Server implementation
    - `tools/`: MCP tools implementation
  - `servicenow/`: ServiceNow API client
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions

### Scripts

- `npm run build`: Build TypeScript code
- `npm run dev`: Start development server with auto-reload
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code

## Troubleshooting

If you encounter issues:

1. Verify your ServiceNow credentials in `.env`
2. Check that your ServiceNow instance is accessible
3. Ensure port 8080 is available
4. Check logs for detailed error messages

## License

MIT
