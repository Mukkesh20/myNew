/**
 * ServiceNow Notification Module
 * Handles email and notification functionality for ServiceNow integration
 */
import axios from 'axios';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

const logger = new Logger('ServiceNowNotification');

/**
 * Creates a notification record in ServiceNow to send an email
 * This uses a different approach than the standard sys_email table
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
  from?: string;
}): Promise<any> {
  const { to, subject, body, from } = params;
  const sender = from || config.servicenow.defaultSenderEmail || config.servicenow.username;
  
  logger.info('Sending notification email via ServiceNow', { to, subject });
  
  // Create API client
  const baseURL = `${config.servicenow.instanceUrl}/api/now/${config.servicenow.apiVersion}`;
  const client = axios.create({
    baseURL,
    timeout: config.servicenow.timeout,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    auth: {
      username: config.servicenow.username,
      password: config.servicenow.password,
    },
  });

  try {
    // Create an email via sys_email table to trigger actual email delivery
    // This is the most direct way to send actual emails in ServiceNow
    const emailPayload = {
      type: 'send',           // Must be 'send' to trigger outbound email
      subject: subject,
      body: body,
      recipient: to,          // Primary recipient field 
      recipients: to,         // Alternative field some instances use
      mailbox: 'outbox',      // CRITICAL: This must be set to 'outbox' for the email to be sent
      direct: body.includes('<') ? 'true' : 'false', // Send as HTML if it contains HTML tags
      from: from || config.servicenow.defaultSenderEmail || config.servicenow.username,
      // Additional fields to ensure delivery
      error_string: '',
      weight: '100',          // High priority
      state: 'ready',         // Ready to send (string value, not number)
      notification_type: 'SMTP',  // Force SMTP delivery
      target_table: 'sys_user',   // Target user table
      // Important headers to ensure delivery
      headers: `To: ${to}\nFrom: ${from || config.servicenow.defaultSenderEmail || config.servicenow.username}\nImportance: High\nX-Priority: 1`
    };
    
    const response = await ErrorHandler.withRetry(async () => {
      try {
        const result = await client.post('/table/sys_email', emailPayload);
        logger.info('Email created for sending', { sys_id: result.data?.result?.sys_id });
        return result.data;
      } catch (err) {
        logger.error('ServiceNow email API error', err);
        throw ErrorHandler.handleServiceNowError(err);
      }
    }, config.servicenow.retryAttempts);
    
    logger.info('Notification created successfully');
    return {
      status: 'sent',
      messageId: response.result ? response.result.sys_id : undefined,
      details: response
    };
  } catch (error) {
    // If direct email sending fails, try creating an event that will trigger email notification
    logger.warn('Failed to create email, trying event-based approach', { error: (error as Error).message });
    
    try {
      // Look for existing notification email action first
      const emailActions = await ErrorHandler.withRetry(async () => {
        try {
          const result = await client.get('/table/sysevent_email_action?sysparm_limit=1&sysparm_query=name=MCP Email');
          return result.data;
        } catch (err) {
          logger.error('Failed to query email actions', err);
          throw ErrorHandler.handleServiceNowError(err);
        }
      }, config.servicenow.retryAttempts);
      
      let actionSysId;
      
      if (emailActions?.result?.length > 0) {
        // Use existing email action
        actionSysId = emailActions.result[0].sys_id;
        logger.info('Using existing email action', { action_id: actionSysId });
      } else {
        // Create new email action if not found
        const actionPayload = {
          name: 'MCP Email',
          collection: 'global',
          condition: 'true',
          process_order: '100',
          subject: `[MCP] ${subject}`, 
          message: `${body}\n\nSent via MCP Server`,
          recipient: to,
          event_name: 'mcp.email'
        };
        
        const newAction = await ErrorHandler.withRetry(async () => {
          try {
            const result = await client.post('/table/sysevent_email_action', actionPayload);
            return result.data;
          } catch (err) {
            logger.error('Failed to create email action', err);
            throw ErrorHandler.handleServiceNowError(err);
          }
        }, config.servicenow.retryAttempts);
        
        actionSysId = newAction?.result?.sys_id;
        logger.info('Created new email action', { action_id: actionSysId });
      }
      
      // Generate an event to trigger the email
      const eventPayload = {
        name: 'mcp.email',
        parm1: subject,
        parm2: to,
        state: 'ready', // Make it ready to process immediately
        source: 'MCP Server',
        instance: config.servicenow.instanceUrl
      };
      
      const eventResponse = await ErrorHandler.withRetry(async () => {
        try {
          const result = await client.post('/table/sysevent', eventPayload);
          return result.data;
        } catch (err) {
          logger.error('Failed to create event', err);
          throw ErrorHandler.handleServiceNowError(err);
        }
      }, config.servicenow.retryAttempts);
      
      logger.info('Email event created successfully');
      return {
        status: 'sent',
        messageId: eventResponse?.result?.sys_id,
        method: 'event',
        details: { event: eventResponse, action: actionSysId }
      };
    } catch (eventError) {
      logger.error('Failed to send email via event', eventError);
      throw eventError;
    }
  }
}
