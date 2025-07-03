import React, { useState } from "react";
import {
  Upload,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Zap,
  Clock,
} from "lucide-react";
import { LogEntry } from "../types/logs";
import { logApi } from "../services/api";

interface LogIngestorProps {
  onSuccess: () => void;
}

const LogIngestor: React.FC<LogIngestorProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"single" | "batch" | "json">("single");
  const [singleLog, setSingleLog] = useState<
    Omit<LogEntry, "id" | "ingested_at">
  >({
    level: "info",
    message: "",
    resourceId: "",
    timestamp: new Date().toISOString(),
    traceId: "",
    spanId: "",
    commit: "",
    metadata: {},
  });
  const [batchLogs, setBatchLogs] = useState<
    Omit<LogEntry, "id" | "ingested_at">[]
  >([]);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSingleLogChange = (field: keyof typeof singleLog, value: any) => {
    setSingleLog((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBatchLog = () => {
    setBatchLogs((prev) => [
      ...prev,
      {
        level: "info",
        message: "",
        resourceId: "",
        timestamp: new Date().toISOString(),
        traceId: "",
        spanId: "",
        commit: "",
        metadata: {},
      },
    ]);
  };

  const updateBatchLog = (index: number, field: keyof LogEntry, value: any) => {
    setBatchLogs((prev) =>
      prev.map((log, i) => (i === index ? { ...log, [field]: value } : log))
    );
  };

  const removeBatchLog = (index: number) => {
    setBatchLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const parseJsonInput = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setBatchLogs(
          parsed.map((log) => ({
            level: log.level || "info",
            message: log.message || "",
            resourceId: log.resourceId || "",
            timestamp: log.timestamp || new Date().toISOString(),
            traceId: log.traceId || "",
            spanId: log.spanId || "",
            commit: log.commit || "",
            metadata: log.metadata || {},
          }))
        );
      } else {
        setBatchLogs([
          {
            level: parsed.level || "info",
            message: parsed.message || "",
            resourceId: parsed.resourceId || "",
            timestamp: parsed.timestamp || new Date().toISOString(),
            traceId: parsed.traceId || "",
            spanId: parsed.spanId || "",
            commit: parsed.commit || "",
            metadata: parsed.metadata || {},
          },
        ]);
      }
      setJsonInput("");
      setMessage({ type: "success", text: "JSON parsed successfully!" });
      setMode("batch");
    } catch (error) {
      setMessage({ type: "error", text: "Invalid JSON format" });
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await logApi.ingestLog(singleLog);
      setMessage({ type: "success", text: "Log ingested successfully!" });
      setSingleLog({
        level: "info",
        message: "",
        resourceId: "",
        timestamp: new Date().toISOString(),
        traceId: "",
        spanId: "",
        commit: "",
        metadata: {},
      });
      onSuccess();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to ingest log",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchLogs.length === 0) {
      setMessage({ type: "error", text: "No logs to submit" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await logApi.ingestLogsBatch(batchLogs);
      setMessage({ type: "success", text: response.message });
      setBatchLogs([]);
      onSuccess();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to ingest logs",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleLog = () => {
    const levels = ["info", "error", "warning", "debug", "critical"];
    const messages = [
      "User authentication successful",
      "Database connection failed",
      "API request timeout",
      "Memory usage threshold exceeded",
      "Payment processing completed",
      "Cache miss detected",
      "Network latency spike observed",
      "File upload completed successfully",
    ];
    const resources = [
      "server-001",
      "api-gateway",
      "db-primary",
      "cache-redis",
      "worker-node-1",
    ];

    setSingleLog({
      level: levels[Math.floor(Math.random() * levels.length)] as any,
      message: messages[Math.floor(Math.random() * messages.length)],
      resourceId: resources[Math.floor(Math.random() * resources.length)],
      timestamp: new Date().toISOString(),
      traceId: `trace-${Math.random().toString(36).substr(2, 9)}`,
      spanId: `span-${Math.random().toString(36).substr(2, 9)}`,
      commit: `${Math.random().toString(36).substr(2, 7)}`,
      metadata: {
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        endpoint: `/api/v1/${Math.random() > 0.5 ? "users" : "orders"}`,
        duration: Math.floor(Math.random() * 1000) + "ms",
      },
    });
  };

  const sampleJsonData = `[
  {
    "level": "info",
    "message": "User login successful",
    "resourceId": "auth-service",
    "timestamp": "${new Date().toISOString()}",
    "traceId": "trace-abc123",
    "spanId": "span-def456",
    "commit": "5e5342f",
    "metadata": {
      "userId": "user-123",
      "endpoint": "/api/v1/auth/login"
    }
  },
  {
    "level": "error",
    "message": "Database connection timeout",
    "resourceId": "db-primary",
    "timestamp": "${new Date().toISOString()}",
    "traceId": "trace-xyz789",
    "spanId": "span-ghi012",
    "commit": "a1b2c3d",
    "metadata": {
      "connectionId": "conn-456",
      "timeout": "30s"
    }
  }
]`;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Ingestion Mode
          </h3>
          <button
            onClick={generateSampleLog}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Sample</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setMode("single")}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              mode === "single"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Single Log</div>
            <div className="text-xs mt-1">Submit one log entry</div>
          </button>

          <button
            onClick={() => setMode("batch")}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              mode === "batch"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Batch Upload</div>
            <div className="text-xs mt-1">Submit multiple logs</div>
          </button>

          <button
            onClick={() => setMode("json")}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              mode === "json"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">JSON Import</div>
            <div className="text-xs mt-1">Paste JSON data</div>
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Single Log Form */}
      {mode === "single" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Single Log Entry
          </h3>

          <form onSubmit={handleSingleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Log Level *
                </label>
                <select
                  value={singleLog.level}
                  onChange={(e) =>
                    handleSingleLogChange("level", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resource ID *
                </label>
                <input
                  type="text"
                  value={singleLog.resourceId}
                  onChange={(e) =>
                    handleSingleLogChange("resourceId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., server-001, api-gateway"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                value={singleLog.message}
                onChange={(e) =>
                  handleSingleLogChange("message", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Describe what happened..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trace ID
                </label>
                <input
                  type="text"
                  value={singleLog.traceId}
                  onChange={(e) =>
                    handleSingleLogChange("traceId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="trace-abc123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Span ID
                </label>
                <input
                  type="text"
                  value={singleLog.spanId}
                  onChange={(e) =>
                    handleSingleLogChange("spanId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="span-def456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Commit
                </label>
                <input
                  type="text"
                  value={singleLog.commit}
                  onChange={(e) =>
                    handleSingleLogChange("commit", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="5e5342f"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timestamp *
                <span className="text-xs text-slate-500 ml-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Current time selected by default
                </span>
              </label>
              <input
                type="datetime-local"
                value={singleLog.timestamp.slice(0, 16)}
                onChange={(e) =>
                  handleSingleLogChange(
                    "timestamp",
                    new Date(e.target.value).toISOString()
                  )
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Metadata (JSON)
              </label>
              <textarea
                value={JSON.stringify(singleLog.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleSingleLogChange("metadata", parsed);
                  } catch (error) {
                    // Invalid JSON, keep typing
                  }
                }}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-colors"
                placeholder='{"key": "value", "userId": "user-123"}'
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Ingest Log</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* JSON Input Mode */}
      {mode === "json" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            JSON Import
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                JSON Data
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-colors"
                placeholder={sampleJsonData}
              />
            </div>
            <button
              onClick={parseJsonInput}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
            >
              Parse JSON & Continue
            </button>
          </div>
        </div>
      )}

      {/* Batch Upload */}
      {mode === "batch" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Batch Logs ({batchLogs.length})
              </h3>
              <button
                onClick={addBatchLog}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Log</span>
              </button>
            </div>

            {batchLogs.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No logs added yet</p>
                <p className="text-slate-400 text-sm">
                  Click "Add Log" or use JSON import to get started
                </p>
              </div>
            ) : (
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {batchLogs.map((log, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 relative bg-slate-50"
                    >
                      <button
                        type="button"
                        onClick={() => removeBatchLog(index)}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-8">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Level
                          </label>
                          <select
                            value={log.level}
                            onChange={(e) =>
                              updateBatchLog(index, "level", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="debug">Debug</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Resource ID
                          </label>
                          <input
                            type="text"
                            value={log.resourceId}
                            onChange={(e) =>
                              updateBatchLog(
                                index,
                                "resourceId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="server-001"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Trace ID
                          </label>
                          <input
                            type="text"
                            value={log.traceId}
                            onChange={(e) =>
                              updateBatchLog(index, "traceId", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="trace-abc123"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Commit
                          </label>
                          <input
                            type="text"
                            value={log.commit}
                            onChange={(e) =>
                              updateBatchLog(index, "commit", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="5e5342f"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Message
                        </label>
                        <input
                          type="text"
                          value={log.message}
                          onChange={(e) =>
                            updateBatchLog(index, "message", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe what happened..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || batchLogs.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Ingesting {batchLogs.length} logs...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Ingest {batchLogs.length} Logs</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogIngestor;
