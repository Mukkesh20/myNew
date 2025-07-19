"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceNowClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@/config");
const logger_1 = require("@/utils/logger");
const error_handler_1 = require("@/utils/error-handler");
const notification = __importStar(require("./notification"));
class ServiceNowClient {
    client;
    logger;
    constructor() {
        this.logger = new logger_1.Logger('ServiceNowClient');
        this.client = this.createAxiosInstance();
    }
    createAxiosInstance() {
        const baseURL = `${config_1.config.servicenow.instanceUrl}/api/now/${config_1.config.servicenow.apiVersion}`;
        const client = axios_1.default.create({
            baseURL,
            timeout: config_1.config.servicenow.timeout,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'NowGPT-MCP/1.0.0',
            },
            auth: {
                username: config_1.config.servicenow.username,
                password: config_1.config.servicenow.password,
            },
        });
        client.interceptors.request.use((config) => {
            this.logger.debug('ServiceNow API request', {
                method: config.method,
                url: config.url,
                params: config.params,
            });
            return config;
        }, (error) => {
            this.logger.error('ServiceNow request interceptor error', error);
            return Promise.reject(error);
        });
        client.interceptors.response.use((response) => {
            this.logger.debug('ServiceNow API response', {
                status: response.status,
                url: response.config.url,
                dataLength: Array.isArray(response.data?.result) ? response.data.result.length : 'N/A',
            });
            return response;
        }, (error) => {
            this.logger.error('ServiceNow API error', error);
            return Promise.reject(error_handler_1.ErrorHandler.handleServiceNowError(error));
        });
        return client;
    }
    async getRecords(table, params) {
        const response = await error_handler_1.ErrorHandler.withRetry(() => this.client.get(`/table/${table}`, { params }), config_1.config.servicenow.retryAttempts);
        return response.data.result;
    }
    async getRecord(table, sysId, params) {
        const response = await error_handler_1.ErrorHandler.withRetry(() => this.client.get(`/table/${table}/${sysId}`, { params }), config_1.config.servicenow.retryAttempts);
        return response.data.result;
    }
    async createRecord(table, payload) {
        const response = await error_handler_1.ErrorHandler.withRetry(() => this.client.post(`/table/${table}`, payload), config_1.config.servicenow.retryAttempts);
        return response.data.result;
    }
    async updateRecord(table, sysId, payload) {
        const response = await error_handler_1.ErrorHandler.withRetry(() => this.client.patch(`/table/${table}/${sysId}`, payload), config_1.config.servicenow.retryAttempts);
        return response.data.result;
    }
    async deleteRecord(table, sysId) {
        await error_handler_1.ErrorHandler.withRetry(() => this.client.delete(`/table/${table}/${sysId}`), config_1.config.servicenow.retryAttempts);
    }
    async createIncident(payload) {
        this.logger.info('Creating incident', { payload });
        return this.createRecord('incident', payload);
    }
    async getIncidents(params) {
        return this.getRecords('incident', params);
    }
    async getIncident(sysId) {
        return this.getRecord('incident', sysId);
    }
    async updateIncident(sysId, payload) {
        this.logger.info('Updating incident', { sysId, payload });
        return this.updateRecord('incident', sysId, payload);
    }
    async searchIncidents(query, limit) {
        const params = {
            sysparm_query: query,
            sysparm_limit: limit || 25,
        };
        return this.getIncidents(params);
    }
    async getUsers(params) {
        return this.getRecords('sys_user', params);
    }
    async getUser(sysId) {
        return this.getRecord('sys_user', sysId);
    }
    async findUserByUsername(username) {
        const users = await this.getRecords('sys_user', {
            sysparm_query: `user_name=${username}`,
            sysparm_limit: 1,
        });
        return users.length > 0 ? users[0] : null;
    }
    async findUserByEmail(email) {
        const users = await this.getRecords('sys_user', {
            sysparm_query: `email=${email}`,
            sysparm_limit: 1,
        });
        return users.length > 0 ? users[0] : null;
    }
    async createRequest(payload) {
        this.logger.info('Creating request', { payload });
        return this.createRecord('sc_request', payload);
    }
    async getRequests(params) {
        return this.getRecords('sc_request', params);
    }
    async getRequest(sysId) {
        return this.getRecord('sc_request', sysId);
    }
    async updateRequest(sysId, payload) {
        this.logger.info('Updating request', { sysId, payload });
        return this.updateRecord('sc_request', sysId, payload);
    }
    async getKnowledgeArticles(params) {
        return this.getRecords('kb_knowledge', params);
    }
    async searchKnowledgeArticles(searchTerm, limit) {
        const params = {
            sysparm_query: `short_descriptionLIKE${searchTerm}^ORtextLIKE${searchTerm}`,
            sysparm_limit: limit || 10,
        };
        return this.getKnowledgeArticles(params);
    }
    async sendEmail(params) {
        const { to, subject, body, from } = params;
        this.logger.info('Sending email via ServiceNow', { to, subject });
        try {
            return await notification.sendEmail(params);
        }
        catch (error) {
            this.logger.error('Failed to send email', error);
            throw error;
        }
    }
    async post(endpoint, data) {
        return error_handler_1.ErrorHandler.withRetry(async () => {
            try {
                const response = await this.client.post(endpoint, data);
                this.logger.info(`POST ${endpoint} succeeded`);
                return response.data;
            }
            catch (err) {
                this.logger.error('ServiceNow API error', err);
                throw error_handler_1.ErrorHandler.handleServiceNowError(err);
            }
        }, config_1.config.servicenow.retryAttempts);
    }
}
exports.ServiceNowClient = ServiceNowClient;
exports.default = ServiceNowClient;
//# sourceMappingURL=client.js.map