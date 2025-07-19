"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSimpleEmail = sendSimpleEmail;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@/config");
const logger_1 = require("@/utils/logger");
const error_handler_1 = require("@/utils/error-handler");
const logger = new logger_1.Logger('EmailUtil');
async function sendSimpleEmail(params) {
    const { to, subject, body, from } = params;
    const sender = from || config_1.config.servicenow.defaultSenderEmail || config_1.config.servicenow.username;
    logger.info('Sending email via ServiceNow sys_email table', { to, subject });
    const baseURL = `${config_1.config.servicenow.instanceUrl}/api/now/${config_1.config.servicenow.apiVersion}`;
    const client = axios_1.default.create({
        baseURL,
        timeout: config_1.config.servicenow.timeout,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        auth: {
            username: config_1.config.servicenow.username,
            password: config_1.config.servicenow.password,
        },
    });
    try {
        const formattedBody = body.includes('<') ? body : `<p>${body}</p>`;
        const emailPayload = {
            type: 'email',
            state: 'ready',
            mailbox: 'outbox',
            recipients: to,
            subject: subject,
            body: formattedBody,
            from: sender,
            fromAddress: sender,
            weight: '100',
            notification_type: 'SMTP',
            direct: formattedBody.includes('<') ? 'true' : 'false',
            headers: `To: ${to}\r\n` +
                `From: ${sender}\r\n` +
                `Subject: ${subject}\r\n` +
                `Importance: High\r\n` +
                `Content-Type: ${formattedBody.includes('<') ? 'text/html' : 'text/plain'}; charset=UTF-8`
        };
        logger.info('Creating sys_email record');
        const response = await error_handler_1.ErrorHandler.withRetry(async () => {
            try {
                const result = await client.post('/table/sys_email', emailPayload);
                logger.info('Email record created', { sys_id: result.data?.result?.sys_id });
                return result.data;
            }
            catch (err) {
                logger.error('ServiceNow email record creation error', err);
                throw error_handler_1.ErrorHandler.handleServiceNowError(err);
            }
        }, config_1.config.servicenow.retryAttempts);
        return {
            status: 'sent',
            messageId: response.result?.sys_id,
            details: response.result
        };
    }
    catch (error) {
        logger.error('Failed to send email via sys_email table', error);
        try {
            logger.info('Attempting fallback to user notification');
            const result = await createUserNotification(client, to, subject, body);
            return {
                status: 'sent',
                method: 'notification',
                messageId: result.sys_id,
                details: result
            };
        }
        catch (notificationError) {
            logger.warn('Notification fallback failed, trying incident creation', notificationError);
            try {
                logger.info('Attempting fallback to incident creation');
                const result = await createEmailIncident(client, to, subject, body, sender);
                return {
                    status: 'sent',
                    method: 'incident',
                    messageId: result.number,
                    details: result
                };
            }
            catch (incidentError) {
                logger.error('All fallback methods failed', incidentError);
                return {
                    status: 'error',
                    error: error.message,
                    details: 'Failed to send email through any available method'
                };
            }
        }
    }
}
async function createUserNotification(client, to, subject, body) {
    const userResponse = await client.get(`/table/sys_user?sysparm_query=email=${to}&sysparm_fields=sys_id,name,email`);
    if (!userResponse.data?.result || userResponse.data.result.length === 0) {
        throw new Error(`User with email ${to} not found`);
    }
    const userId = userResponse.data.result[0].sys_id;
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
async function createEmailIncident(client, to, subject, body, sender) {
    const userResponse = await client.get(`/table/sys_user?sysparm_query=email=${to}&sysparm_fields=sys_id,name,email`);
    if (!userResponse.data?.result || userResponse.data.result.length === 0) {
        throw new Error(`User with email ${to} not found`);
    }
    const userId = userResponse.data.result[0].sys_id;
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
//# sourceMappingURL=emailUtil.js.map