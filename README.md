# Log Ingestion & Querying System

A full-stack tool for real-time log ingestion and querying. It uses modern web tech, offers a clean UI inspired by Grafana and Datadog, and supports easy Docker deployment.

## LIVE DEPLOYED WEBSITE
https://evallo-eight.vercel.app/

## Frontend Deployed on Vercel 
 -  https://evallo-eight.vercel.app/
## Backend Deployed on Render 
 -  https://evallo-hab3.onrender.com/


## Command to setup locally
# 1. Clone the repository
git clone https://github.com/AdarshSingh9540/Evallo

# 2. Navigate into the project directory
cd Evallo

# 3. Install dependencies
npm install
# or
yarn install

# 4. Start the development server
npm run dev
# or
yarn dev


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
- **DevOps**: Docker, Docker Compose.

## API Endpoints

- `POST /api/ingest`: Ingest a single log.
- `POST /api/ingest/batch`: Ingest multiple logs.
- `GET /api/query`: Filter and retrieve logs.
- `GET /api/logs/:id`: Fetch a specific log.
- `GET /api/stats`: View system stats.
- `GET /api/health`: Check system health.
- `GET /api/analytics/logs-by-level`: Get chart data for analytics.
- WebSocket event: `newLog` for real-time updates.


## Bonus Points

- use socket connection for real time upadtion of log
- Docker - added  Dockerfile and docker-compose.yml file that 
allows the entire full-stack application (backend and frontend) to be built and run 
with a single docker-compose up command.
- Basic Analytics View: Added chart/graph using rechartjs for displaying Analytics.



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