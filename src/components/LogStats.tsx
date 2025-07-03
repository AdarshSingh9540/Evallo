import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Activity, Server, Clock, Database, Zap } from 'lucide-react';
import { LogStats as LogStatsType } from '../types/logs';

interface LogStatsProps {
  stats: LogStatsType | null;
  loading: boolean;
}

const LogStats: React.FC<LogStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center text-slate-600">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>No statistics available</p>
        </div>
      </div>
    );
  }

  const logLevels = Object.entries(stats.logLevels);
  const maxCount = Math.max(...logLevels.map(([, count]) => count));

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'debug':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  };

  const getHealthStatus = () => {
    if (stats.errorRate > 15) return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (stats.errorRate > 5) return { status: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Healthy', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Logs</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLogs.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">In JSON database</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.errorRate}%</p>
              <p className={`text-xs mt-1 ${health.color}`}>{health.status}</p>
            </div>
            <div className={`w-12 h-12 ${health.bgColor} rounded-xl flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${health.color}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Last 24 Hours</p>
              <p className="text-2xl font-bold text-slate-900">{stats.recentActivity.last24Hours.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Recent activity</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Last Hour</p>
              <p className="text-2xl font-bold text-slate-900">{stats.recentActivity.lastHour.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Current activity</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Levels Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Log Levels Distribution
          </h3>
          
          {logLevels.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No log level data available
            </div>
          ) : (
            <div className="space-y-4">
              {logLevels.map(([level, count]) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`}></div>
                      <span className="font-medium text-slate-700 capitalize">{level}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-900 font-semibold">{count.toLocaleString()}</span>
                      <span className="text-slate-500 text-xs ml-1">
                        ({Math.round((count / stats.totalLogs) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getLevelColor(level)} transition-all duration-500`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Top Resources
          </h3>
          
          {stats.topResources.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No resource data available
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topResources.map((item, index) => (
                <div key={item.resource} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.resource}</p>
                      <p className="text-sm text-slate-600">Resource ID</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.count.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">logs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          System Health Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${health.bgColor}`}>
              <AlertTriangle className={`w-8 h-8 ${health.color}`} />
            </div>
            <h4 className="font-medium text-slate-900">Error Rate</h4>
            <p className={`text-sm ${health.color}`}>{health.status}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.errorRate}% error rate</p>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              stats.recentActivity.lastHour > 0 ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Activity className={`w-8 h-8 ${
                stats.recentActivity.lastHour > 0 ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <h4 className="font-medium text-slate-900">Activity</h4>
            <p className={`text-sm ${
              stats.recentActivity.lastHour > 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {stats.recentActivity.lastHour > 0 ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stats.recentActivity.lastHour} logs/hour</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-slate-900">Data Volume</h4>
            <p className="text-sm text-blue-600">
              {stats.totalLogs > 10000 ? 'High' : stats.totalLogs > 1000 ? 'Medium' : 'Low'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{stats.totalLogs.toLocaleString()} total logs</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-medium text-slate-900">Performance</h4>
            <p className="text-sm text-purple-600">JSON Database</p>
            <p className="text-xs text-slate-500 mt-1">File-based storage</p>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Real-time Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.last24Hours}</p>
            <p className="text-sm text-slate-600">Last 24h</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.recentActivity.lastHour}</p>
            <p className="text-sm text-slate-600">Last hour</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.topResources.length}</p>
            <p className="text-sm text-slate-600">Active resources</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{Object.keys(stats.logLevels).length}</p>
            <p className="text-sm text-slate-600">Log levels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogStats;