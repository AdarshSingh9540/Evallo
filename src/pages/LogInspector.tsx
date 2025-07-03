import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Search } from "lucide-react";
import LogFilters from "../components/LogFilters";
import LogViewer from "../components/LogViewer";
import { LogEntry, LogFilters as LogFiltersType } from "../types/logs";
import { logApi } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

export function LogInspector() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<LogFiltersType>({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const handleNewLog = useCallback(
    (newLog: LogEntry) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]);

      const matchesFilters = (log: LogEntry) => {
        if (filters.level && log.level !== filters.level) return false;
        if (
          filters.message &&
          !log.message.toLowerCase().includes(filters.message.toLowerCase())
        )
          return false;
        if (
          filters.resourceId &&
          !log.resourceId
            .toLowerCase()
            .includes(filters.resourceId.toLowerCase())
        )
          return false;
        if (
          filters.traceId &&
          !log.traceId.toLowerCase().includes(filters.traceId.toLowerCase())
        )
          return false;
        return true;
      };

      if (matchesFilters(newLog)) {
        setFilteredLogs((prevFiltered) => [newLog, ...prevFiltered]);
      }
    },
    [filters]
  );

  useWebSocket({ onNewLog: handleNewLog });

  const fetchLogs = async (
    currentFilters: LogFiltersType = filters,
    page: number = 1
  ) => {
    setLoading(true);
    try {
      const response = await logApi.queryLogs({
        ...currentFilters,
        page,
        limit: pagination.limit,
      });

      setLogs(response.logs);
      setFilteredLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: LogFiltersType) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs(newFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchLogs(filters, page);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Log Inspector
        </h1>
        <p className="text-slate-600">
          Search, filter, and analyze logs with advanced querying capabilities
          and real-time updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span className="text-lg lg:text-xl">
              Advanced Search & Filtering
            </span>
          </CardTitle>
          <CardDescription>
            Use multiple criteria to find specific logs in your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </CardContent>
      </Card>

      <LogViewer
        logs={filteredLogs}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
