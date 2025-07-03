import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Database,
  Zap,
  TrendingUp,
  Server,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import { LogStats } from "../types/logs";
import { logApi } from "../services/api";

const COLORS = {
  critical: "#ef4444",
  error: "#f97316",
  warning: "#f59e0b",
  info: "#3b82f6",
  debug: "#6b7280",
};

export function Dashboard() {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const statsData = await logApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/analytics/logs-by-level`
      );

      const data = await response.json();

      const formattedData = data.slice(-24).map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        total:
          item.critical + item.error + item.warning + item.info + item.debug,
      }));

      setAnalyticsData(formattedData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchAnalyticsData()]);
      setLoading(false);
    };

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!stats)
      return {
        status: "Unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      };
    if (stats.errorRate > 15)
      return {
        status: "Critical",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    if (stats.errorRate > 5)
      return {
        status: "Warning",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return {
      status: "Healthy",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  };

  const health = getHealthStatus();

  // Prepare pie chart data
  const pieData = stats
    ? Object.entries(stats.logLevels).map(([level, count]) => ({
        name: level,
        value: count,
        color: COLORS[level as keyof typeof COLORS] || "#6b7280",
      }))
    : [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          System Dashboard
        </h1>
        <p className="text-slate-600">
          Real-time overview of your log management system performance and
          health metrics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Logs
            </CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stats?.totalLogs.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-blue-600 mt-1">In JSON database</p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${health.bgColor} border-opacity-50`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${health.color}`}>
              Error Rate
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${health.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${health.color}`}>
              {stats?.errorRate || 0}%
            </div>
            <p className={`text-xs mt-1 ${health.color}`}>{health.status}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Last 24 Hours
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats?.recentActivity.last24Hours.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-600 mt-1">Recent activity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Last Hour
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {stats?.recentActivity.lastHour.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-purple-600 mt-1">Current activity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Log Activity Trend</span>
                </CardTitle>
                <CardDescription>
                  Real-time log volume over the last 24 hours
                </CardDescription>
              </div>
              <Badge variant="outline">
                <LineChart className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient
                        id="colorTotal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Log Levels Distribution</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of log severity levels
                </CardDescription>
              </div>
              <Badge variant="outline">
                <BarChart3 className="h-3 w-3 mr-1" />
                Current
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No log level data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-green-600" />
            <span>Top Active Resources</span>
          </CardTitle>
          <CardDescription>
            Most active resources generating logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.topResources && stats.topResources.length > 0 ? (
            <div className="space-y-3">
              {stats.topResources.slice(0, 5).map((item, index) => (
                <div
                  key={item.resource}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.resource}
                      </p>
                      <p className="text-sm text-slate-600">Resource ID</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {item.count.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">logs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No resource data available
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>System Health Overview</span>
          </CardTitle>
          <CardDescription>
            Real-time system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${health.bgColor}`}
              >
                <AlertTriangle className={`w-8 h-8 ${health.color}`} />
              </div>
              <h4 className="font-medium text-slate-900">Error Rate</h4>
              <p className={`text-sm ${health.color}`}>{health.status}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.errorRate || 0}% error rate
              </p>
            </div>

            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  (stats?.recentActivity.lastHour || 0) > 0
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
              >
                <Activity
                  className={`w-8 h-8 ${
                    (stats?.recentActivity.lastHour || 0) > 0
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <h4 className="font-medium text-slate-900">Activity</h4>
              <p
                className={`text-sm ${
                  (stats?.recentActivity.lastHour || 0) > 0
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {(stats?.recentActivity.lastHour || 0) > 0
                  ? "Active"
                  : "Inactive"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.recentActivity.lastHour || 0} logs/hour
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-900">Data Volume</h4>
              <p className="text-sm text-blue-600">
                {(stats?.totalLogs || 0) > 10000
                  ? "High"
                  : (stats?.totalLogs || 0) > 1000
                  ? "Medium"
                  : "Low"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.totalLogs.toLocaleString() || 0} total logs
              </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
