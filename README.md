# Floxy UI

A web interface for managing and monitoring Floxy workflows.

## Features

- **Dashboard**: Overview of workflow statistics and active instances
- **Workflow Management**: View workflow definitions and their execution graphs
- **Instance Monitoring**: Real-time monitoring of workflow execution
- **Statistics**: Detailed analytics and performance metrics
- **Step Tracking**: Individual step execution details and status

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build Docker image
docker build -t floxy-ui .

# Run container
docker run -p 3001:3001 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=floxy \
  -e DB_USER=floxy \
  -e DB_PASSWORD=your-password \
  floxy-ui
```

## Environment Variables

- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: floxy)
- `DB_USER`: Database user (default: floxy)
- `DB_PASSWORD`: Database password (default: password)
- `PORT`: Server port (default: 3001)

## API Endpoints

### Workflows
- `GET /api/workflows` - List all workflow definitions
- `GET /api/workflows/:id` - Get workflow definition details
- `GET /api/workflows/:id/instances` - Get workflow instances

### Instances
- `GET /api/instances/active` - Get active workflow instances
- `GET /api/instances/:id` - Get instance details
- `GET /api/instances/:id/steps` - Get instance steps
- `GET /api/instances/:id/events` - Get instance events

### Statistics
- `GET /api/stats` - Get workflow statistics
- `GET /api/stats/summary` - Get summary statistics

## Architecture

The application consists of:

- **Backend**: Express.js server with TypeScript
- **Frontend**: React application with TypeScript
- **Database**: PostgreSQL with floxy schema
- **Build**: Webpack for frontend bundling

The backend serves both the API endpoints and the static frontend files, making it a single-container deployment.