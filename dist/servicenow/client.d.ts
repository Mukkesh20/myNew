import { QueryParams, CreateUpdatePayload, Incident, User, Request, KnowledgeArticle } from './types';
export declare class ServiceNowClient {
    private client;
    private logger;
    constructor();
    private createAxiosInstance;
    getRecords<T>(table: string, params?: QueryParams): Promise<T[]>;
    getRecord<T>(table: string, sysId: string, params?: QueryParams): Promise<T>;
    createRecord<T>(table: string, payload: CreateUpdatePayload): Promise<T>;
    updateRecord<T>(table: string, sysId: string, payload: CreateUpdatePayload): Promise<T>;
    deleteRecord(table: string, sysId: string): Promise<void>;
    createIncident(payload: Partial<Incident>): Promise<Incident>;
    getIncidents(params?: QueryParams): Promise<Incident[]>;
    getIncident(sysId: string): Promise<Incident>;
    updateIncident(sysId: string, payload: Partial<Incident>): Promise<Incident>;
    searchIncidents(query: string, limit?: number): Promise<Incident[]>;
    getUsers(params?: QueryParams): Promise<User[]>;
    getUser(sysId: string): Promise<User>;
    findUserByUsername(username: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    createRequest(payload: Partial<Request>): Promise<Request>;
    getRequests(params?: QueryParams): Promise<Request[]>;
    getRequest(sysId: string): Promise<Request>;
    updateRequest(sysId: string, payload: Partial<Request>): Promise<Request>;
    getKnowledgeArticles(params?: QueryParams): Promise<KnowledgeArticle[]>;
    searchKnowledgeArticles(searchTerm: string, limit?: number): Promise<KnowledgeArticle[]>;
    sendEmail(params: {
        to: string;
        subject: string;
        body: string;
        from?: string;
    }): Promise<any>;
    private post;
}
export default ServiceNowClient;
//# sourceMappingURL=client.d.ts.map