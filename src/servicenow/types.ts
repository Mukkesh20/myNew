// Core ServiceNow record interface
export interface ServiceNowRecord {
  sys_id: string;
  sys_created_on: string;
  sys_updated_on: string;
  sys_created_by: string;
  sys_updated_by: string;
  [key: string]: any;
}

// Incident record interface
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

// User record interface
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

// Request record interface
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

// Knowledge article interface
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

// API Response interfaces
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

// Query parameters
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

// Create/Update payload
export interface CreateUpdatePayload {
  [key: string]: any;
}

// Tool execution context
export interface ToolContext {
  table: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'search';
  params?: QueryParams;
  payload?: CreateUpdatePayload;
  recordId?: string;
}

// Authentication types
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

// ServiceNow table information
export interface TableInfo {
  name: string;
  label: string;
  access: string;
  create_access: boolean;
  read_access: boolean;
  update_access: boolean;
  delete_access: boolean;
}

// Common ServiceNow states
export enum IncidentState {
  New = '1',
  InProgress = '2',
  OnHold = '3',
  Resolved = '6',
  Closed = '7',
  Canceled = '8'
}

export enum RequestState {
  Open = '1',
  WorkInProgress = '2',
  Closed = '3',
  Canceled = '4'
}

export enum Priority {
  Critical = '1',
  High = '2',
  Moderate = '3',
  Low = '4',
  Planning = '5'
}

export enum Urgency {
  High = '1',
  Medium = '2',
  Low = '3'
}

export enum Impact {
  High = '1',
  Medium = '2',
  Low = '3'
}

// MCP Tool argument types
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
  identifier: string; // Can be sys_id, user_name, or email
  identifierType?: 'sys_id' | 'user_name' | 'email';
}

export interface AddCommentArgs {
  table: string;
  sys_id: string;
  comment: string;
  work_notes?: boolean;
}