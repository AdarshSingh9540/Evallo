import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
interface AnalyticsData {
  timestamp: string;
  info: number;
  warning: number;
  error: number;
  debug: number;
  critical: number;
}

interface LogAnalyticsProps {
  dateRange?: {
    from?: string;
    to?: string;
  };
}

const LogAnalytics: React.FC<LogAnalyticsProps> = ({ dateRange }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append("from", dateRange.from);
      if (dateRange?.to) params.append("to", dateRange.to);
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/analytics/logs-by-level?${params.toString()}`
      );

      const data = await response.json();

      // Format data for chart display
      const formattedData = data.map((item: AnalyticsData) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));

      setAnalyticsData(formattedData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Log Analytics Dashboard
              </h3>
              <p className="text-sm text-slate-600">
                Real-time log distribution by severity level
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === "bar"
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Bar</span>
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === "line"
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-700"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Line</span>
              </button>
            </div>

            <button
              onClick={fetchAnalyticsData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {analyticsData.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              No analytics data available
            </p>
            <p className="text-slate-400 text-sm">
              Ingest some logs to see analytics
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={analyticsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="critical"
                    stackId="a"
                    fill="#ef4444"
                    name="Critical"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="error"
                    stackId="a"
                    fill="#f97316"
                    name="Error"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="warning"
                    stackId="a"
                    fill="#f59e0b"
                    name="Warning"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="info"
                    stackId="a"
                    fill="#3b82f6"
                    name="Info"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="debug"
                    stackId="a"
                    fill="#6b7280"
                    name="Debug"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={analyticsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Critical"
                  />
                  <Line
                    type="monotone"
                    dataKey="error"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Error"
                  />
                  <Line
                    type="monotone"
                    dataKey="warning"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Warning"
                  />
                  <Line
                    type="monotone"
                    dataKey="info"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Info"
                  />
                  <Line
                    type="monotone"
                    dataKey="debug"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Debug"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analyticsData.length > 0 && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-5 gap-4">
            {["critical", "error", "warning", "info", "debug"].map((level) => {
              const total = analyticsData.reduce(
                (sum, item) =>
                  sum + (item[level as keyof AnalyticsData] as number),
                0
              );
              const color = {
                critical: "text-red-600 bg-red-50 border-red-200",
                error: "text-orange-600 bg-orange-50 border-orange-200",
                warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
                info: "text-blue-600 bg-blue-50 border-blue-200",
                debug: "text-gray-600 bg-gray-50 border-gray-200",
              }[level];

              return (
                <div key={level} className={`p-3 rounded-lg border ${color}`}>
                  <div className="text-lg font-bold">{total}</div>
                  <div className="text-xs uppercase font-medium">{level}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogAnalytics;
