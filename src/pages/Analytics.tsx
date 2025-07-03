import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

interface AnalyticsData {
  timestamp: string;
  info: number;
  warning: number;
  error: number;
  debug: number;
  critical: number;
  time?: string;
  total?: number;
}

const COLORS = {
  critical: "#ef4444",
  error: "#f97316",
  warning: "#f59e0b",
  info: "#3b82f6",
  debug: "#6b7280",
};

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(
    "bar"
  );

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/analytics/logs-by-level`
      );

      const data = await response.json();

      const formattedData = data.map((item: AnalyticsData) => ({
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-sm sm:text-base text-slate-900 mb-1 sm:mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-xs sm:text-sm"
            >
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const pieData =
    analyticsData.length > 0
      ? Object.keys(COLORS)
          .map((level) => ({
            name: level,
            value: analyticsData.reduce(
              (sum, item) =>
                sum + (item[level as keyof AnalyticsData] as number),
              0
            ),
            color: COLORS[level as keyof typeof COLORS],
          }))
          .filter((item) => item.value > 0)
      : [];

  const radialData = pieData.map((item, index) => ({
    ...item,
    fill: item.color,
    uv: item.value,
  }));

  const renderChart = () => {
    if (analyticsData.length === 0) {
      return (
        <div className="h-60 sm:h-80 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-slate-400" />
            <p className="text-sm sm:text-lg">No analytics data available</p>
            <p className="text-xs sm:text-sm">
              Ingest some logs to see analytics
            </p>
          </div>
        </div>
      );
    }

    const chartProps = {
      data: analyticsData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="critical"
              stackId="a"
              fill={COLORS.critical}
              name="Critical"
            />
            <Bar dataKey="error" stackId="a" fill={COLORS.error} name="Error" />
            <Bar
              dataKey="warning"
              stackId="a"
              fill={COLORS.warning}
              name="Warning"
            />
            <Bar dataKey="info" stackId="a" fill={COLORS.info} name="Info" />
            <Bar dataKey="debug" stackId="a" fill={COLORS.debug} name="Debug" />
          </BarChart>
        );

      case "line":
        return (
          <RechartsLineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="critical"
              stroke={COLORS.critical}
              strokeWidth={2}
              dot={{ r: 2 }}
              sm:dot={{ r: 4 }}
              name="Critical"
            />
            <Line
              type="monotone"
              dataKey="error"
              stroke={COLORS.error}
              strokeWidth={2}
              dot={{ r: 2 }}
              sm:dot={{ r: 4 }}
              name="Error"
            />
            <Line
              type="monotone"
              dataKey="warning"
              stroke={COLORS.warning}
              strokeWidth={2}
              dot={{ r: 2 }}
              sm:dot={{ r: 4 }}
              name="Warning"
            />
            <Line
              type="monotone"
              dataKey="info"
              stroke={COLORS.info}
              strokeWidth={2}
              dot={{ r: 2 }}
              sm:dot={{ r: 4 }}
              name="Info"
            />
            <Line
              type="monotone"
              dataKey="debug"
              stroke={COLORS.debug}
              strokeWidth={2}
              dot={{ r: 2 }}
              sm:dot={{ r: 4 }}
              name="Debug"
            />
          </RechartsLineChart>
        );

      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              sm:fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke={COLORS.critical}
              fill={COLORS.critical}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="error"
              stackId="1"
              stroke={COLORS.error}
              fill={COLORS.error}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="warning"
              stackId="1"
              stroke={COLORS.warning}
              fill={COLORS.warning}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="info"
              stackId="1"
              stroke={COLORS.info}
              fill={COLORS.info}
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="debug"
              stackId="1"
              stroke={COLORS.debug}
              fill={COLORS.debug}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case "pie":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-60 sm:h-80">
            <div>
              <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-center">
                Distribution (Pie Chart)
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    sm:outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-center">
                Radial Distribution
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius={40}
                  sm:outerRadius={80}
                  data={radialData}
                >
                  <RadialBar
                    dataKey="uv"
                    cornerRadius={5}
                    sm:cornerRadius={10}
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Visual analytics and interactive charts showing log distribution
          patterns and trends over time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                <span className="text-base sm:text-lg">
                  Log Analytics Visualization
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Interactive charts with real-time data updates
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0 w-full lg:w-56">
              <div className="flex sm:flex-row lg:flex-row sm:items-center gap-2 sm:gap-1 bg-slate-100 rounded-lg p-1 w-full">
                <Button
                  onClick={() => setChartType("bar")}
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  Bar
                </Button>

                <Button
                  onClick={() => setChartType("line")}
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <LineChart className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  Line
                </Button>

                <Button
                  onClick={() => setChartType("area")}
                  variant={chartType === "area" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Activity className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  Area
                </Button>
              </div>
              {/* 
              <Button
                onClick={fetchAnalyticsData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Refresh
              </Button> */}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="h-60 sm:h-80 flex items-center justify-center">
              <div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-slate-600">
                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading analytics...</span>
              </div>
            </div>
          ) : (
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {analyticsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Summary Statistics</span>
            </CardTitle>
            <CardDescription>
              Aggregated metrics from the current dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
              {Object.entries(COLORS).map(([level, color]) => {
                const total = analyticsData.reduce(
                  (sum, item) =>
                    sum + (item[level as keyof AnalyticsData] as number),
                  0
                );
                const percentage =
                  analyticsData.length > 0
                    ? (
                        (total /
                          analyticsData.reduce(
                            (sum, item) => sum + (item.total || 0),
                            0
                          )) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <div
                    key={level}
                    className="text-center p-2 sm:p-4 rounded-lg border"
                    style={{
                      borderColor: color + "40",
                      backgroundColor: color + "10",
                    }}
                  >
                    <div
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color }}
                    >
                      {total}
                    </div>
                    <div
                      className="text-xs sm:text-sm font-medium capitalize"
                      style={{ color }}
                    >
                      {level}
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs sm:text-sm"
                    >
                      {percentage}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg sm:text-xl">
              Total Data Points
            </CardTitle>
            <CardDescription className="text-blue-700 text-sm sm:text-base">
              Number of time intervals analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {analyticsData.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900 text-lg sm:text-xl">
              Peak Activity
            </CardTitle>
            <CardDescription className="text-green-700 text-sm sm:text-base">
              Highest log volume in single interval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-900">
              {Math.max(...analyticsData.map((item) => item.total || 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 text-lg sm:text-xl">
              Average Rate
            </CardTitle>
            <CardDescription className="text-purple-700 text-sm sm:text-base">
              Average logs per time interval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900">
              {analyticsData.length > 0
                ? Math.round(
                    analyticsData.reduce(
                      (sum, item) => sum + (item.total || 0),
                      0
                    ) / analyticsData.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
