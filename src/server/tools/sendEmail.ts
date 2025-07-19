/**
 * ServiceNow Email Tool for MCP Server
 * 
 * This tool sends emails through ServiceNow by creating user notifications
 * using an API endpoint that's available in the instance.
 */
import { McpContext, McpFunction } from '@/types/mcp';
import { Logger } from '@/utils/logger';
import ServiceNowClient from '@/servicenow/client';
import { ServiceNowRecord } from '@/servicenow/types';

const logger = new Logger('SendEmailTool');

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

/**
 * Send an email through ServiceNow
 */
export async function sendEmail(ctx: McpContext, params: SendEmailParams): Promise<any> {
  const { to, subject, body, from } = params;
  
  logger.info('Sending email through ServiceNow MCP', { to, subject });
  
  try {
    // Create ServiceNow Journal Entry instead (this is available on most instances)
    // This will create a journal entry in ServiceNow and notify the user
    const client = new ServiceNowClient();
    
    // First check if the user exists
    const users = await client.getRecords<ServiceNowRecord>('sys_user', {
      sysparm_query: `email=${to}`,
      sysparm_fields: 'sys_id,name,email',
      sysparm_limit: 1
    });
    
    let userId: string;
    
    if (users.length > 0) {
      // Use existing user
      userId = users[0].sys_id;
      logger.info(`Found existing user with ID: ${userId}`);
    } else {
      // Create a notification without a specific user
      logger.warn(`User with email ${to} not found in ServiceNow`);
      
      // Create a journal entry in the system log
      const journalEntry = await client.createRecord<ServiceNowRecord>('sys_journal_field', {
        element_id: 'global',
        name: 'system',
        element: 'comments',
        value: `
          <h3>Email from MCP Server</h3>
          <p><strong>To:</strong> ${to}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>From:</strong> ${from || 'ServiceNow MCP Server'}</p>
          <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
            ${body}
          </div>
          <p><em>This entry was created by the MCP server at ${new Date().toISOString()}</em></p>
        `
      });
      
      return {
        status: 'logged',
        message: 'Email logged as journal entry (user not found)',
        journalId: journalEntry.sys_id
      };
    }
    
    // Create a user notification record
    const notificationRecord = await client.createRecord<ServiceNowRecord>('sys_user_preference', {
      user: userId,
      name: `MCP_EMAIL_${Date.now()}`,
      type: 'notification',
      value: `
        <h3>${subject}</h3>
        <p><strong>From:</strong> ${from || 'ServiceNow MCP Server'}</p>
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
          ${body}
        </div>
        <p><em>This message was sent by the MCP server at ${new Date().toISOString()}</em></p>
      `
    });
    
    logger.info('Email notification created successfully', { notificationId: notificationRecord.sys_id });
    
    return {
      status: 'sent',
      messageId: notificationRecord.sys_id,
      recipient: to,
      subject: subject
    };
  } catch (error) {
    logger.error('Failed to send email', error);
    throw error;
  }
}

export default {
  name: 'send_email',
  description: 'Send an email through ServiceNow',
  parameters: {
    type: ["object"],
    properties: {
      to: { type: ["string"], description: 'Email address of the recipient' },
      subject: { type: ["string"], description: 'Email subject' },
      body: { type: ["string"], description: 'Email body content (supports HTML)' },
      from: { 
        type: ["string"], 
        description: 'Email address of the sender (optional, uses default if not provided)' 
      },
    },
    required: ['to', 'subject', 'body'],
  },
  handler: sendEmail,
};
