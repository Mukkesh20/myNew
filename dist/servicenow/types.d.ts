export interface ServiceNowRecord {
    sys_id: string;
    sys_created_on: string;
    sys_updated_on: string;
    sys_created_by: string;
    sys_updated_by: string;
    [key: string]: any;
}
export interface Incident extends ServiceNowRecord {
    number: string;
    short_description: string;
    description?: string;
    caller_id: string;
    assigned_to?: string;
    assignment_group?: string;
    state: string;
    priority: string;
    urgency: string;
    impact: string;
    category?: string;
    subcategory?: string;
    work_notes?: string;
    comments?: string;
    resolution_code?: string;
    resolution_notes?: string;
    close_code?: string;
    close_notes?: string;
}
export interface User extends ServiceNowRecord {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department?: string;
    manager?: string;
    active: boolean;
    roles: string;
}
export interface Request extends ServiceNowRecord {
    number: string;
    short_description: string;
    description?: string;
    requested_for: string;
    requested_by: string;
    assignment_group?: string;
    assigned_to?: string;
    state: string;
    priority: string;
    urgency: string;
    approval: string;
}
export interface KnowledgeArticle extends ServiceNowRecord {
    number: string;
    short_description: string;
    text: string;
    topic: string;
    category: string;
    subcategory?: string;
    workflow_state: string;
    valid_to?: string;
    author: string;
    kb_knowledge_base: string;
}
export interface ServiceNowResponse<T> {
    result: T[];
}
export interface ServiceNowSingleResponse<T> {
    result: T;
}
export interface ServiceNowError {
    error: {
        message: string;
        detail: string;
    };
    status: string;
}
export interface QueryParams {
    sysparm_query?: string;
    sysparm_limit?: number;
    sysparm_offset?: number;
    sysparm_fields?: string;
    sysparm_view?: string;
    sysparm_display_value?: 'true' | 'false' | 'all';
    sysparm_exclude_reference_link?: boolean;
    sysparm_suppress_pagination_header?: boolean;
}
export interface CreateUpdatePayload {
    [key: string]: any;
}
export interface ToolContext {
    table: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'search';
    params?: QueryParams;
    payload?: CreateUpdatePayload;
    recordId?: string;
}
export interface AuthCredentials {
    username: string;
    password: string;
}
export interface AuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}
export interface TableInfo {
    name: string;
    label: string;
    access: string;
    create_access: boolean;
    read_access: boolean;
    update_access: boolean;
    delete_access: boolean;
}
export declare enum IncidentState {
    New = "1",
    InProgress = "2",
    OnHold = "3",
    Resolved = "6",
    Closed = "7",
    Canceled = "8"
}
export declare enum RequestState {
    Open = "1",
    WorkInProgress = "2",
    Closed = "3",
    Canceled = "4"
}
export declare enum Priority {
    Critical = "1",
    High = "2",
    Moderate = "3",
    Low = "4",
    Planning = "5"
}
export declare enum Urgency {
    High = "1",
    Medium = "2",
    Low = "3"
}
export declare enum Impact {
    High = "1",
    Medium = "2",
    Low = "3"
}
export interface CreateIncidentArgs {
    short_description: string;
    description?: string;
    caller_id: string;
    priority?: string;
    urgency?: string;
    impact?: string;
    category?: string;
    subcategory?: string;
    assignment_group?: string;
}
export interface UpdateRecordArgs {
    table: string;
    sys_id: string;
    updates: Record<string, any>;
}
export interface SearchRecordsArgs {
    table: string;
    query?: string;
    limit?: number;
    offset?: number;
    fields?: string[];
    orderBy?: string;
}
export interface GetUserArgs {
    identifier: string;
    identifierType?: 'sys_id' | 'user_name' | 'email';
}
export interface AddCommentArgs {
    table: string;
    sys_id: string;
    comment: string;
    work_notes?: boolean;
}
//# sourceMappingURL=types.d.ts.map