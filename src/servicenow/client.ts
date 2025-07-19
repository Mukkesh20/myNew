import axios, { AxiosInstance } from 'axios';
import { config } from '@/config';
import { Logger } from '@/utils/logger';
import { ErrorHandler, ServiceNowError } from '@/utils/error-handler';
import * as notification from './notification';
import {
  ServiceNowResponse,
  ServiceNowSingleResponse,
  QueryParams,
  CreateUpdatePayload,
  Incident,
  User,
  Request,
  KnowledgeArticle,
  TableInfo,
} from './types';

export class ServiceNowClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ServiceNowClient');
    this.client = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const baseURL = `${config.servicenow.instanceUrl}/api/now/${config.servicenow.apiVersion}`;
    
    const client = axios.create({
      baseURL,
      timeout: config.servicenow.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'NowGPT-MCP/1.0.0',
      },
      auth: {
        username: config.servicenow.username,
        password: config.servicenow.password,
      },
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        this.logger.debug('ServiceNow API request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        this.logger.error('ServiceNow request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    client.interceptors.response.use(
      (response) => {
        this.logger.debug('ServiceNow API response', {
          status: response.status,
          url: response.config.url,
          dataLength: Array.isArray(response.data?.result) ? response.data.result.length : 'N/A',
        });
        return response;
      },
      (error) => {
        this.logger.error('ServiceNow API error', error);
        return Promise.reject(ErrorHandler.handleServiceNowError(error));
      }
    );

    return client;
  }

  // Generic CRUD operations
  async getRecords<T>(table: string, params?: QueryParams): Promise<T[]> {
    const response = await ErrorHandler.withRetry(
      () => this.client.get<ServiceNowResponse<T>>(`/table/${table}`, { params }),
      config.servicenow.retryAttempts
    );
    
    return response.data.result;
  }

  async getRecord<T>(table: string, sysId: string, params?: QueryParams): Promise<T> {
    const response = await ErrorHandler.withRetry(
      () => this.client.get<ServiceNowSingleResponse<T>>(`/table/${table}/${sysId}`, { params }),
      config.servicenow.retryAttempts
    );
    
    return response.data.result;
  }

  async createRecord<T>(table: string, payload: CreateUpdatePayload): Promise<T> {
    const response = await ErrorHandler.withRetry(
      () => this.client.post<ServiceNowSingleResponse<T>>(`/table/${table}`, payload),
      config.servicenow.retryAttempts
    );
    
    return response.data.result;
  }

  async updateRecord<T>(table: string, sysId: string, payload: CreateUpdatePayload): Promise<T> {
    const response = await ErrorHandler.withRetry(
      () => this.client.patch<ServiceNowSingleResponse<T>>(`/table/${table}/${sysId}`, payload),
      config.servicenow.retryAttempts
    );
    
    return response.data.result;
  }

  async deleteRecord(table: string, sysId: string): Promise<void> {
    await ErrorHandler.withRetry(
      () => this.client.delete(`/table/${table}/${sysId}`),
      config.servicenow.retryAttempts
    );
  }

  // Incident-specific operations
  async createIncident(payload: Partial<Incident>): Promise<Incident> {
    this.logger.info('Creating incident', { payload });
    return this.createRecord<Incident>('incident', payload);
  }

  async getIncidents(params?: QueryParams): Promise<Incident[]> {
    return this.getRecords<Incident>('incident', params);
  }

  async getIncident(sysId: string): Promise<Incident> {
    return this.getRecord<Incident>('incident', sysId);
  }

  async updateIncident(sysId: string, payload: Partial<Incident>): Promise<Incident> {
    this.logger.info('Updating incident', { sysId, payload });
    return this.updateRecord<Incident>('incident', sysId, payload);
  }

  async searchIncidents(query: string, limit?: number): Promise<Incident[]> {
    const params: QueryParams = {
      sysparm_query: query,
      sysparm_limit: limit || 25,
    };
    
    return this.getIncidents(params);
  }

  // User-specific operations
  async getUsers(params?: QueryParams): Promise<User[]> {
    return this.getRecords<User>('sys_user', params);
  }

  async getUser(sysId: string): Promise<User> {
    return this.getRecord<User>('sys_user', sysId);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.getRecords<User>('sys_user', {
      sysparm_query: `user_name=${username}`,
      sysparm_limit: 1,
    });
    
    return users.length > 0 ? users[0] : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.getRecords<User>('sys_user', {
      sysparm_query: `email=${email}`,
      sysparm_limit: 1,
    });
    
    return users.length > 0 ? users[0] : null;
  }

  // Request-specific operations
  async createRequest(payload: Partial<Request>): Promise<Request> {
    this.logger.info('Creating request', { payload });
    return this.createRecord<Request>('sc_request', payload);
  }

  async getRequests(params?: QueryParams): Promise<Request[]> {
    return this.getRecords<Request>('sc_request', params);
  }

  async getRequest(sysId: string): Promise<Request> {
    return this.getRecord<Request>('sc_request', sysId);
  }

  async updateRequest(sysId: string, payload: Partial<Request>): Promise<Request> {
    this.logger.info('Updating request', { sysId, payload });
    return this.updateRecord<Request>('sc_request', sysId, payload);
  }

  // Knowledge article operations
  async getKnowledgeArticles(params?: QueryParams): Promise<KnowledgeArticle[]> {
    return this.getRecords<KnowledgeArticle>('kb_knowledge', params);
  }

  async searchKnowledgeArticles(searchTerm: string, limit?: number): Promise<KnowledgeArticle[]> {
    const params: QueryParams = {
      sysparm_query: `short_descriptionLIKE${searchTerm}^ORtextLIKE${searchTerm}`,
      sysparm_limit: limit || 10,
    };

    return this.getKnowledgeArticles(params);
  }
  
  // Email operations
  async sendEmail(params: { to: string; subject: string; body: string; from?: string }): Promise<any> {
    const { to, subject, body, from } = params;
    
    this.logger.info('Sending email via ServiceNow', { to, subject });
    
    try {
      // Use the dedicated notification module which has multiple fallback methods
      return await notification.sendEmail(params);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
  
  /**
   * Generic POST method for ServiceNow API
   */
  private async post<T>(endpoint: string, data: any): Promise<T> {
    return ErrorHandler.withRetry(async () => {
      try {
        const response = await this.client.post<T>(endpoint, data);
        this.logger.info(`POST ${endpoint} succeeded`);
        return response.data;
      } catch (err) {
        this.logger.error('ServiceNow API error', err);
        throw ErrorHandler.handleServiceNowError(err);
      }
    }, config.servicenow.retryAttempts);
  }
}

export default ServiceNowClient;