import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Calendar, Hash, AlertCircle, Info, AlertTriangle, CheckCircle, Zap, Clock, Server } from 'lucide-react';
import { LogEntry, PaginationInfo } from '../types/logs';
import { format } from 'date-fns';

interface LogViewerProps {
  logs: LogEntry[];
  loading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, loading, pagination, onPageChange }) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'debug':
        return <Hash className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'debug':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return timestamp;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      return '';
    }
  };

  const generatePaginationPages = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading logs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{logs.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.total.toLocaleString()}</span> logs
            </span>
            {pagination.total > 0 && (
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            )}
          </div>
          
          {logs.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Real-time data</span>
            </div>
          )}
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs found</h3>
            <p className="text-slate-600">Try adjusting your filters or ingest some logs to see them here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start space-x-4">
                  {/* Log Level Badge */}
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getLevelColor(log.level)}`}>
                    {getLevelIcon(log.level)}
                    <span className="uppercase">{log.level}</span>
                  </div>
                  
                  {/* Log Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-slate-900 font-medium truncate pr-4">
                        {log.message}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        <span>{getRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Server className="w-4 h-4" />
                        <span>{log.resourceId}</span>
                      </div>
                      {log.traceId && (
                        <div className="flex items-center space-x-1">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono text-xs">{log.traceId}</span>
                        </div>
                      )}
                      {log.commit && (
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="font-mono text-xs">{log.commit}</span>
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {/* View Icon */}
                  <Eye className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-1">
              {generatePaginationPages().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                  disabled={page === '...'}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : page === '...'
                      ? 'text-slate-400 cursor-default'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getLevelColor(selectedLog.level)}`}>
                  {getLevelIcon(selectedLog.level)}
                  <span className="text-sm font-medium uppercase">{selectedLog.level}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Log Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Message</h4>
                  <p className="text-slate-900 bg-slate-50 p-4 rounded-lg border">{selectedLog.message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">ID:</span>
                        <span className="font-mono text-slate-900 text-sm">{selectedLog.id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Resource ID:</span>
                        <span className="font-mono text-slate-900">{selectedLog.resourceId}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Timestamp:</span>
                        <span className="text-slate-900">{formatTimestamp(selectedLog.timestamp)}</span>
                      </div>
                      {selectedLog.ingested_at && (
                        <div className="flex justify-between py-2">
                          <span className="text-slate-600">Ingested At:</span>
                          <span className="text-slate-900">{formatTimestamp(selectedLog.ingested_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Tracing Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Trace ID:</span>
                        <span className="font-mono text-slate-900 text-sm">{selectedLog.traceId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Span ID:</span>
                        <span className="font-mono text-slate-900 text-sm">{selectedLog.spanId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Commit:</span>
                        <span className="font-mono text-slate-900">{selectedLog.commit || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Metadata</h4>
                    <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto border font-mono">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogViewer;