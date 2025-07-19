/**
 * ServiceNow Email Utility
 * Uses direct sys_email record creation to send emails in ServiceNow
 */
import axios from 'axios';
import { config } from '@/config';
import { Logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';

const logger = new Logger('EmailUtil');

/**
 * Send an email using ServiceNow's sys_email table
 * Based on the exact server-side method provided
 */
export async function sendSimpleEmail(params: {
  to: string;
  subject: string;
  body: string;
  from?: string;
}): Promise<any> {
  const { to, subject, body, from } = params;
  const sender = from || config.servicenow.defaultSenderEmail || config.servicenow.username;
  
  logger.info('Sending email via ServiceNow sys_email table', { to, subject });
  
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
    // Format the email body if needed
    const formattedBody = body.includes('<') ? body : `<p>${body}</p>`;
    
    // Create an email record with the exact fields needed for automatic processing
    // Based on examining successful, automatically sent emails in ServiceNow
    const emailPayload = {
      // Required fields for email delivery
      type: 'email',                // Ensure type is 'email'
      state: 'ready',               // 'ready' state for processing
      mailbox: 'outbox',            // Always 'outbox' for outgoing mail
    
      // Recipient and content
      recipients: to,               // Email recipient(s)
      subject: subject,             // Subject line
      body: formattedBody,          // Email body (can be plain or HTML)
    
      // Sender info (MUST be valid email address format)
      from: sender,                 // e.g., 'mcp-notifier@example.com'
      fromAddress: sender,          // Explicitly set sender address
    
      // Optional but helpful fields
      weight: '100',                // Priority
      notification_type: 'SMTP',   // Force SMTP delivery
      direct: formattedBody.includes('<') ? 'true' : 'false', // HTML flag
    
      // Email headers — use CRLF format, and make sure From/To match `recipients`/`fromAddress`
      headers: 
        `To: ${to}\r\n` +
        `From: ${sender}\r\n` +
        `Subject: ${subject}\r\n` +
        `Importance: High\r\n` +
        `Content-Type: ${formattedBody.includes('<') ? 'text/html' : 'text/plain'}; charset=UTF-8`
    };
    
    logger.info('Creating sys_email record');
    
    // Create the email record
    const response = await ErrorHandler.withRetry(async () => {
      try {
        const result = await client.post('/table/sys_email', emailPayload);
        logger.info('Email record created', { sys_id: result.data?.result?.sys_id });
        return result.data;
      } catch (err) {
        logger.error('ServiceNow email record creation error', err);
        throw ErrorHandler.handleServiceNowError(err);
      }
    }, config.servicenow.retryAttempts);
    
    return {
      status: 'sent',
      messageId: response.result?.sys_id,
      details: response.result
    };
  } catch (error) {
    logger.error('Failed to send email via sys_email table', error);
    
    // If direct email record creation fails, try the fallback notification approach
    try {
      logger.info('Attempting fallback to user notification');
      const result = await createUserNotification(client, to, subject, body);
      return {
        status: 'sent',
        method: 'notification',
        messageId: result.sys_id,
        details: result
      };
    } catch (notificationError) {
      logger.warn('Notification fallback failed, trying incident creation', notificationError);
      
      // Last resort: create an incident
      try {
        logger.info('Attempting fallback to incident creation');
        const result = await createEmailIncident(client, to, subject, body, sender);
        return {
          status: 'sent',
          method: 'incident',
          messageId: result.number,
          details: result
        };
      } catch (incidentError) {
        logger.error('All fallback methods failed', incidentError);
        return {
          status: 'error',
          error: (error as Error).message,
          details: 'Failed to send email through any available method'
        };
      }
    }
  }
}

/**
 * First fallback method: Create a user notification
 */
async function createUserNotification(client: any, to: string, subject: string, body: string): Promise<any> {
  // Find the user by email
  const userResponse = await client.get(
    `/table/sys_user?sysparm_query=email=${to}&sysparm_fields=sys_id,name,email`
  );
  
  if (!userResponse.data?.result || userResponse.data.result.length === 0) {
    throw new Error(`User with email ${to} not found`);
  }
  
  const userId = userResponse.data.result[0].sys_id;
  
  // Create a notification for this user
  const notificationPayload = {
    user: userId,
    state: 'ready',
    device_type: 'email',
    notification_type: 'email',
    message: body,
    description: subject,
    action_insert: true,
    action_update: true,
    active: true
  };
  
  const notificationResponse = await client.post('/table/sys_notification', notificationPayload);
  return notificationResponse.data.result;
}

/**
 * Second fallback method: Create an incident to notify a user
 */
async function createEmailIncident(client: any, to: string, subject: string, body: string, sender: string): Promise<any> {
  // Find the user by email
  const userResponse = await client.get(
    `/table/sys_user?sysparm_query=email=${to}&sysparm_fields=sys_id,name,email`
  );
  
  if (!userResponse.data?.result || userResponse.data.result.length === 0) {
    throw new Error(`User with email ${to} not found`);
  }
  
  const userId = userResponse.data.result[0].sys_id;
  
  // Create an incident assigned to this user
  const incidentPayload = {
    short_description: `[Email] ${subject}`,
    description: body,
    urgency: '2',
    impact: '3',
    priority: '3',
    assigned_to: userId,
    caller_id: userId,
    category: 'inquiry',
    contact_type: 'email',
    comments: `This incident was created to deliver an email from ${sender}`
  };
  
  const incidentResponse = await client.post('/table/incident', incidentPayload);
  return incidentResponse.data.result;
}
