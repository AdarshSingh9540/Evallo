# Log Ingestion & Querying System

A full-stack tool for real-time log ingestion and querying. It uses modern web tech, offers a clean UI inspired by Grafana and Datadog, and supports easy Docker deployment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

## Features

- JSON-based storage: Logs saved in a single file, no external database needed.
- Real-time ingestion: Process single or batch logs with validation.
- Flexible querying: Filter logs by multiple fields using efficient JavaScript.
- Analytics dashboard: Interactive Recharts visualizations for log insights.
- Live updates: WebSocket streams logs to all connected clients.
- Responsive UI: Clean, modern design works on any device.
- Docker support: Simple setup with Docker and Docker Compose.

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.IO, JSON storage, CORS.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide React.
- **DevOps**: Docker, Docker Compose, Nginx, multi-stage builds.

## API Endpoints

- `POST /api/ingest`: Ingest a single log.
- `POST /api/ingest/batch`: Ingest multiple logs.
- `GET /api/query`: Filter and retrieve logs.
- `GET /api/logs/:id`: Fetch a specific log.
- `GET /api/stats`: View system stats.
- `GET /api/health`: Check system health.
- `GET /api/analytics/logs-by-level`: Get chart data for analytics.
- WebSocket event: `newLog` for real-time updates.

## Log Schema

```json
{
  "id": "unique-id",
  "level": "info|warning|error|debug|critical",
  "message": "Log content",
  "resourceId": "resource-id",
  "timestamp": "ISO-8601-timestamp",
  "traceId": "trace-id",
  "spanId": "span-id",
  "commit": "git-commit-hash",
  "metadata": {
    "parentResourceId": "parent-resource",
    "customField": "custom-value"
  },
  "ingested_at": "ISO-8601-timestamp"
}