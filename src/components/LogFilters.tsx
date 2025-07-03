import React, { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, RotateCcw, Sliders } from "lucide-react";
import { LogFilters as LogFiltersType } from "../types/logs";

interface LogFiltersProps {
  filters: LogFiltersType;
  onFiltersChange: (filters: LogFiltersType) => void;
  loading: boolean;
}

const LogFilters: React.FC<LogFiltersProps> = ({
  filters,
  onFiltersChange,
  loading,
}) => {
  const [localFilters, setLocalFilters] = useState<LogFiltersType>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof LogFiltersType, value: string) => {
    const newFilters = {
      ...localFilters,
      [key]: value === "" ? undefined : value,
    };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const resetFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFilterCount = Object.values(localFilters).filter(
    (value) => value !== undefined && value !== null && value !== ""
  ).length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Search & Filter
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showAdvanced
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Advanced</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Message
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localFilters.message || ""}
                onChange={(e) => handleFilterChange("message", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search in messages..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Log Level
            </label>
            <select
              value={localFilters.level || ""}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resource ID
            </label>
            <input
              type="text"
              value={localFilters.resourceId || ""}
              onChange={(e) => handleFilterChange("resourceId", e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., server-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trace ID
            </label>
            <input
              type="text"
              value={localFilters.traceId || ""}
              onChange={(e) => handleFilterChange("traceId", e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., trace-abc123"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="datetime-local"
                value={
                  localFilters.from
                    ? new Date(localFilters.from).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleFilterChange(
                    "from",
                    e.target.value ? new Date(e.target.value).toISOString() : ""
                  )
                }
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="datetime-local"
                value={
                  localFilters.to
                    ? new Date(localFilters.to).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleFilterChange(
                    "to",
                    e.target.value ? new Date(e.target.value).toISOString() : ""
                  )
                }
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h4 className="text-md font-medium text-slate-700 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Span ID
                </label>
                <input
                  type="text"
                  value={localFilters.spanId || ""}
                  onChange={(e) => handleFilterChange("spanId", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., span-def456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Commit Hash
                </label>
                <input
                  type="text"
                  value={localFilters.commit || ""}
                  onChange={(e) => handleFilterChange("commit", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 5e5342f"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parent Resource ID
                </label>
                <input
                  type="text"
                  value={localFilters.parentResourceId || ""}
                  onChange={(e) =>
                    handleFilterChange("parentResourceId", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Parent resource"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  value={localFilters.sortBy || "timestamp"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="timestamp">Timestamp</option>
                  <option value="level">Level</option>
                  <option value="resourceId">Resource ID</option>
                  <option value="message">Message</option>
                  <option value="ingested_at">Ingested At</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={localFilters.sortOrder || "desc"}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortOrder",
                      e.target.value as "asc" | "desc"
                    )
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Press Enter in any field to search quickly
          </div>

          <button
            onClick={applyFilters}
            disabled={loading}
            className="flex w-full lg:w-44 items-center text-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>Search Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogFilters;
