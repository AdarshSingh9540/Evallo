export interface LogEntry {
  id: string;
  level: 'info' | 'error' | 'warning' | 'debug' | 'critical';
  message: string;
  resourceId: string;
  timestamp: string;
  traceId: string;
  spanId: string;
  commit: string;
  metadata?: {
    parentResourceId?: string;
    [key: string]: any;
  };
  ingested_at?: string;
}

export interface LogFilters {
  level?: string;
  message?: string;
  resourceId?: string;
  timestamp?: string;
  traceId?: string;
  spanId?: string;
  commit?: string;
  parentResourceId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LogStats {
  totalLogs: number;
  logLevels: Record<string, number>;
  recentActivity: {
    last24Hours: number;
    lastHour: number;
  };
  topResources: Array<{
    resource: string;
    count: number;
  }>;
  errorRate: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryResponse {
  logs: LogEntry[];
  pagination: PaginationInfo;
}