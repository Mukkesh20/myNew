"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const logger_1 = require("@/utils/logger");
const client_1 = __importDefault(require("@/servicenow/client"));
const logger = new logger_1.Logger('SendEmailTool');
async function sendEmail(ctx, params) {
    const { to, subject, body, from } = params;
    logger.info('Sending email through ServiceNow MCP', { to, subject });
    try {
        const client = new client_1.default();
        const users = await client.getRecords('sys_user', {
            sysparm_query: `email=${to}`,
            sysparm_fields: 'sys_id,name,email',
            sysparm_limit: 1
        });
        let userId;
        if (users.length > 0) {
            userId = users[0].sys_id;
            logger.info(`Found existing user with ID: ${userId}`);
        }
        else {
            logger.warn(`User with email ${to} not found in ServiceNow`);
            const journalEntry = await client.createRecord('sys_journal_field', {
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
        const notificationRecord = await client.createRecord('sys_user_preference', {
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
    }
    catch (error) {
        logger.error('Failed to send email', error);
        throw error;
    }
}
exports.default = {
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
//# sourceMappingURL=sendEmail.js.map