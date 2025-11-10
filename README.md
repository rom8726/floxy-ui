# Floxy UI

A web interface for monitoring Floxy workflows.

Preferable for dev usage. If you want use advanced manager, use [Floxy Manager](https://github.com/floxy-project/floxy-manager).

## Features

- **Go Backend**: High-performance backend using the Floxy library
- **React Frontend**: Modern TypeScript/React interface
- **Single Container**: Both backend and frontend in one Docker image
- **Workflow Visualization**: Interactive workflow graphs

## Quick Start

### Development Mode

```bash
# Install dependencies
make install

# Start development mode (frontend + backend)
make dev
```

The application will be available at:
- Frontend: http://localhost:3001

### Production Build

```bash
# Build everything
make build

# Run production build
make run
```

### Docker

```bash
# Build Docker image
make docker-build

# Run with Docker
make docker-run
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5435)
- `DB_NAME` - Database name (default: floxy)
- `DB_USER` - Database user (default: floxy)
- `DB_PASSWORD` - Database password (default: password)

## Architecture

```
floxy-ui/
├── internal/            # Internal Go packages
│   ├── config/         # Configuration
│   └── server/         # HTTP server
├── web/                # React frontend
│   ├── src/           # TypeScript source
│   ├── public/        # Static assets
│   └── dist/          # Built frontend
└── Dockerfile         # Multi-stage Docker build
```

## Development

### Backend (Go)
- Uses the Floxy library
- HTTP server with CORS support
- Serves static files in production
- Development mode with fallback HTML

### Frontend (React/TypeScript)
- Modern React with TypeScript
- Webpack for bundling
- Production build optimization

## License

Apache 2.0
