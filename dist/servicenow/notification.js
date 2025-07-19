"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("../utils/error-handler");
const logger = new logger_1.Logger('ServiceNowNotification');
async function sendEmail(params) {
    const { to, subject, body, from } = params;
    const sender = from || config_1.config.servicenow.defaultSenderEmail || config_1.config.servicenow.username;
    logger.info('Sending notification email via ServiceNow', { to, subject });
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
        const emailPayload = {
            type: 'send',
            subject: subject,
            body: body,
            recipient: to,
            recipients: to,
            mailbox: 'outbox',
            direct: body.includes('<') ? 'true' : 'false',
            from: from || config_1.config.servicenow.defaultSenderEmail || config_1.config.servicenow.username,
            error_string: '',
            weight: '100',
            state: 'ready',
            notification_type: 'SMTP',
            target_table: 'sys_user',
            headers: `To: ${to}\nFrom: ${from || config_1.config.servicenow.defaultSenderEmail || config_1.config.servicenow.username}\nImportance: High\nX-Priority: 1`
        };
        const response = await error_handler_1.ErrorHandler.withRetry(async () => {
            try {
                const result = await client.post('/table/sys_email', emailPayload);
                logger.info('Email created for sending', { sys_id: result.data?.result?.sys_id });
                return result.data;
            }
            catch (err) {
                logger.error('ServiceNow email API error', err);
                throw error_handler_1.ErrorHandler.handleServiceNowError(err);
            }
        }, config_1.config.servicenow.retryAttempts);
        logger.info('Notification created successfully');
        return {
            status: 'sent',
            messageId: response.result ? response.result.sys_id : undefined,
            details: response
        };
    }
    catch (error) {
        logger.warn('Failed to create email, trying event-based approach', { error: error.message });
        try {
            const emailActions = await error_handler_1.ErrorHandler.withRetry(async () => {
                try {
                    const result = await client.get('/table/sysevent_email_action?sysparm_limit=1&sysparm_query=name=MCP Email');
                    return result.data;
                }
                catch (err) {
                    logger.error('Failed to query email actions', err);
                    throw error_handler_1.ErrorHandler.handleServiceNowError(err);
                }
            }, config_1.config.servicenow.retryAttempts);
            let actionSysId;
            if (emailActions?.result?.length > 0) {
                actionSysId = emailActions.result[0].sys_id;
                logger.info('Using existing email action', { action_id: actionSysId });
            }
            else {
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
                const newAction = await error_handler_1.ErrorHandler.withRetry(async () => {
                    try {
                        const result = await client.post('/table/sysevent_email_action', actionPayload);
                        return result.data;
                    }
                    catch (err) {
                        logger.error('Failed to create email action', err);
                        throw error_handler_1.ErrorHandler.handleServiceNowError(err);
                    }
                }, config_1.config.servicenow.retryAttempts);
                actionSysId = newAction?.result?.sys_id;
                logger.info('Created new email action', { action_id: actionSysId });
            }
            const eventPayload = {
                name: 'mcp.email',
                parm1: subject,
                parm2: to,
                state: 'ready',
                source: 'MCP Server',
                instance: config_1.config.servicenow.instanceUrl
            };
            const eventResponse = await error_handler_1.ErrorHandler.withRetry(async () => {
                try {
                    const result = await client.post('/table/sysevent', eventPayload);
                    return result.data;
                }
                catch (err) {
                    logger.error('Failed to create event', err);
                    throw error_handler_1.ErrorHandler.handleServiceNowError(err);
                }
            }, config_1.config.servicenow.retryAttempts);
            logger.info('Email event created successfully');
            return {
                status: 'sent',
                messageId: eventResponse?.result?.sys_id,
                method: 'event',
                details: { event: eventResponse, action: actionSysId }
            };
        }
        catch (eventError) {
            logger.error('Failed to send email via event', eventError);
            throw eventError;
        }
    }
}
//# sourceMappingURL=notification.js.map