import { LogEntry, LogFilters, QueryResponse, LogStats } from '../types/logs';

const API_BASE_URL =  import.meta.env.VITE_BACKEND_BASE_URL;

class LogAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async ingestLog(log: Omit<LogEntry, 'id' | 'ingested_at'>): Promise<{ message: string; id: string }> {
    return this.request('/ingest', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async ingestLogsBatch(logs: Omit<LogEntry, 'id' | 'ingested_at'>[]): Promise<{ message: string; count: number }> {
    return this.request('/ingest/batch', {
      method: 'POST',
      body: JSON.stringify({ logs }),
    });
  }

  async queryLogs(filters: LogFilters = {}): Promise<QueryResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/query?${params.toString()}`);
  }

  async getLogById(id: string): Promise<LogEntry> {
    return this.request(`/logs/${id}`);
  }

  async getStats(): Promise<LogStats> {
    return this.request('/stats');
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; message: string }> {
    return this.request('/health');
  }
}

export const logApi = new LogAPI();