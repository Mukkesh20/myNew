/**
 * Health check endpoint for Windsurf deployment
 */
import express from 'express';
import { config } from '../config';
import { Logger } from '../utils/logger';

const logger = new Logger('Health');

/**
 * Register health check routes
 */
export function registerHealthRoutes(app: express.Express): void {
  // Basic health check endpoint
  app.get('/health', (req: express.Request, res: express.Response) => {
    logger.info('Health check request received');
    
    // Return basic health information
    res.json({
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      serverTime: new Date().toISOString(),
      config: {
        servicenow: {
          instanceUrl: config.servicenow.instanceUrl,
          apiVersion: config.servicenow.apiVersion,
          // Don't include sensitive information like username/password
        }
      }
    });
  });
}
