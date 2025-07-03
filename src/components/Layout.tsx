import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Search,
  Upload,
  Home,
  Database,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { cn } from "../lib/utils";
import { LogEntry, LogStats } from "../types/logs";
import { logApi } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    description: "System overview and statistics",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Visual analytics and charts",
  },
  {
    title: "Log Inspector",
    href: "/inspector",
    icon: Search,
    description: "Search and filter logs",
  },
  {
    title: "Log Ingestion",
    href: "/ingestion",
    icon: Upload,
    description: "Submit logs to the system",
  },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [stats, setStats] = useState<LogStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<string>("checking...");
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewLog = useCallback((newLog: LogEntry) => {
    fetchStats();
  }, []);

  const socket = useWebSocket({ onNewLog: handleNewLog });

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
    }
  }, [socket]);

  const fetchStats = async () => {
    try {
      const statsData = await logApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await logApi.healthCheck();
      setSystemHealth(health.status);
    } catch (error) {
      console.error("Failed to check health:", error);
      setSystemHealth("ERROR");
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), checkHealth()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    checkHealth();
  }, []);

  const getHealthIndicator = () => {
    switch (systemHealth) {
      case "OK":
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        );
      case "ERROR":
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        );
      default:
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm border-r border-slate-200/50 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Evallo
                </h1>
                <p className="text-xs text-slate-600">Log Ingestion</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-slate-600">
                  {isConnected ? "Live Connection" : "Offline"}
                </span>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {getHealthIndicator()}
                <span className="text-slate-600">System Health</span>
              </div>
              <Badge
                variant={systemHealth === "OK" ? "default" : "destructive"}
              >
                {systemHealth}
              </Badge>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-700">Total</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-900">
                    {stats.totalLogs.toLocaleString()}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-yellow-700">24h</span>
                  </div>
                  <div className="text-sm font-semibold text-yellow-900">
                    {stats.recentActivity.last24Hours}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
              />
              Refresh Data
            </Button>
          </div>

          <Separator />
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/50">
            <div className="text-xs text-slate-500 text-center">
              © 2025 Evallo
            </div>
            <div className="text-xs text-slate-400 text-center mt-1">
              Log Injection
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200/50 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-slate-600">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
