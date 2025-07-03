import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

const DB_FILE = path.join(__dirname, 'logs.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function initializeDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ logs: [] }, null, 2));
  }
}

async function readLogs() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { logs: [] };
  }
}

async function writeLogs(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/api/ingest', async (req, res) => {
  try {
    const logEntry = req.body;
    if (!logEntry.level || !logEntry.message || !logEntry.timestamp) {
      return res.status(400).json({ error: 'Missing required fields: level, message, timestamp' });
    }

    const validLevels = ['info', 'error', 'warning', 'debug', 'critical'];
    if (!validLevels.includes(logEntry.level.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid log level.' });
    }

    const data = await readLogs();
    const newLog = {
      id: generateId(),
      level: logEntry.level.toLowerCase(),
      message: logEntry.message,
      resourceId: logEntry.resourceId || '',
      timestamp: new Date(logEntry.timestamp).toISOString(),
      traceId: logEntry.traceId || '',
      spanId: logEntry.spanId || '',
      commit: logEntry.commit || '',
      metadata: logEntry.metadata || {},
      ingested_at: new Date().toISOString()
    };

    data.logs.push(newLog);
    const success = await writeLogs(data);

    if (success) {
      io.emit('newLog', newLog);
      res.status(201).json({ message: 'Log ingested successfully', id: newLog.id });
    } else {
      res.status(500).json({ error: 'Failed to save log' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ingest/batch', async (req, res) => {
  try {
    const { logs } = req.body;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'Invalid logs array' });
    }

    const data = await readLogs();
    const processedLogs = [];
    const validLevels = ['info', 'error', 'warning', 'debug', 'critical'];

    for (const logEntry of logs) {
      if (!logEntry.level || !logEntry.message || !logEntry.timestamp) {
        return res.status(400).json({ error: 'Missing required fields in log entry' });
      }
      if (!validLevels.includes(logEntry.level.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid log level.' });
      }

      processedLogs.push({
        id: generateId(),
        level: logEntry.level.toLowerCase(),
        message: logEntry.message,
        resourceId: logEntry.resourceId || '',
        timestamp: new Date(logEntry.timestamp).toISOString(),
        traceId: logEntry.traceId || '',
        spanId: logEntry.spanId || '',
        commit: logEntry.commit || '',
        metadata: logEntry.metadata || {},
        ingested_at: new Date().toISOString()
      });
    }

    data.logs.push(...processedLogs);
    const success = await writeLogs(data);

    if (success) {
      processedLogs.forEach(log => io.emit('newLog', log));
      res.status(201).json({ message: `${processedLogs.length} logs ingested successfully`, count: processedLogs.length });
    } else {
      res.status(500).json({ error: 'Failed to save logs' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/query', async (req, res) => {
  try {
    const data = await readLogs();
    let filteredLogs = [...data.logs];

    const {
      level,
      message,
      resourceId,
      timestamp,
      traceId,
      spanId,
      commit,
      parentResourceId,
      from,
      to,
      page = 1,
      limit = 100,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    if (level) filteredLogs = filteredLogs.filter(log => log.level.toLowerCase() === level.toLowerCase());
    if (message) filteredLogs = filteredLogs.filter(log => log.message.toLowerCase().includes(message.toLowerCase()));
    if (resourceId) filteredLogs = filteredLogs.filter(log => log.resourceId && log.resourceId.toLowerCase().includes(resourceId.toLowerCase()));
    if (traceId) filteredLogs = filteredLogs.filter(log => log.traceId && log.traceId.toLowerCase().includes(traceId.toLowerCase()));
    if (spanId) filteredLogs = filteredLogs.filter(log => log.spanId && log.spanId.toLowerCase().includes(spanId.toLowerCase()));
    if (commit) filteredLogs = filteredLogs.filter(log => log.commit && log.commit.toLowerCase().includes(commit.toLowerCase()));
    if (parentResourceId) filteredLogs = filteredLogs.filter(log => log.metadata?.parentResourceId && log.metadata.parentResourceId.toLowerCase().includes(parentResourceId.toLowerCase()));
    if (timestamp) filteredLogs = filteredLogs.filter(log => log.timestamp === new Date(timestamp).toISOString());
    if (from) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(from));
    if (to) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(to));

    filteredLogs.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'timestamp' || sortBy === 'ingested_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / parseInt(limit))
      }
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readLogs();
    const log = data.logs.find(log => log.id === id);
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(log);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const data = await readLogs();
    const logs = data.logs;

    const stats = {
      totalLogs: logs.length,
      logLevels: {},
      recentActivity: {
        last24Hours: 0,
        lastHour: 0
      },
      topResources: {},
      errorRate: 0
    };

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    logs.forEach(log => {
      stats.logLevels[log.level] = (stats.logLevels[log.level] || 0) + 1;
      const logTime = new Date(log.timestamp);
      if (logTime >= last24Hours) stats.recentActivity.last24Hours++;
      if (logTime >= lastHour) stats.recentActivity.lastHour++;
      if (log.resourceId) stats.topResources[log.resourceId] = (stats.topResources[log.resourceId] || 0) + 1;
    });

    const errorLogs = (stats.logLevels.error || 0) + (stats.logLevels.critical || 0);
    stats.errorRate = logs.length > 0 ? parseFloat((errorLogs / logs.length * 100).toFixed(2)) : 0;

    stats.topResources = Object.entries(stats.topResources).sort(([,a],[,b]) => b - a).slice(0,10).map(([resource,count]) => ({resource,count}));

    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/logs-by-level', async (req, res) => {
  try {
    const data = await readLogs();
    const { from, to } = req.query;
    let filteredLogs = [...data.logs];
    if (from) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(from));
    if (to) filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(to));

    const hourlyData = {};
    filteredLogs.forEach(log => {
      const hour = new Date(log.timestamp).toISOString().slice(0,13)+':00:00.000Z';
      if (!hourlyData[hour]) {
        hourlyData[hour] = { timestamp: hour, info:0, warning:0, error:0, debug:0, critical:0 };
      }
      hourlyData[hour][log.level]++;
    });

    const chartData = Object.values(hourlyData).sort((a,b) => new Date(a.timestamp)-new Date(b.timestamp));

    res.json(chartData);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Log Ingestion System is running',
    connectedClients: io.engine.clientsCount
  });
});

initializeDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(() => {
  process.exit(1);
});
