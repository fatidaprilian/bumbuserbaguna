# Development Setup Guide

## Quick Start

### Prerequisites
- **WSL2** with Docker Desktop integration enabled
- **Node.js 20+** and npm
- Project cloned to **WSL filesystem** (e.g., `/home/user/projects/bumbuserbaguna` in WSL)

### Why WSL for Project?
- **Docker volumes are SLOW** when mounting from Windows to WSL (`/mnt/c` interop is expensive)
- Project should live in WSL filesystem for hot-reload, DB operations, file operations
- **If you move to E: in WSL**, both Docker and Node will perform at native speed

### Setup Steps

#### 1. Move Project to WSL (Recommended)
```bash
# In WSL terminal
cd ~
git clone https://github.com/[username]/bumbuserbaguna.git
cd bumbuserbaguna
```

#### 2. Environment Setup
```bash
# From project root
cp .env.example .env

# Edit .env with local values (defaults work for dev)
nano .env
```

#### 3. Start Docker Services
```bash
# Terminal 1: Start PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# Verify services
docker compose -f docker-compose.dev.yml ps
```

#### 4. Start Backend
```bash
# Terminal 2: From backend/ directory
cd backend
npm install
npm run dev
```

Backend should start at `http://localhost:3000`

#### 5. Test API
```bash
# Terminal 3: Test health endpoint
curl http://localhost:3000/api/health

# Test auth register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"student"}'
```

## Docker Compose Strategy

### `docker-compose.dev.yml` (Development)
- **Use this locally**: `docker compose -f docker-compose.dev.yml up -d`
- Lightweight: PostgreSQL 17-alpine + Redis 7-alpine
- Fast startup (~10s)
- Default credentials: `bumbu/localdev`
- Network: `bumbu_dev_network`
- **No password on Redis** for convenience

### `docker-compose.yml` (Production Reference)
- Production environment template
- Uses environment variables for secrets
- Persistent volumes: `postgres_prod_data`, `redis_prod_data`
- Network isolation: `bumbu_network`
- **Redis requires authentication**
- Deploy: `docker compose up -d` (after setting `.env`)

## Common Commands

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Reset data (WARNING: deletes all data)
docker compose -f docker-compose.dev.yml down -v

# View logs
docker compose -f docker-compose.dev.yml logs -f postgres
docker compose -f docker-compose.dev.yml logs -f redis

# Access PostgreSQL
docker exec -it bumbu_postgres psql -U bumbu -d bumbuserbaguna

# Access Redis
docker exec -it bumbu_redis redis-cli

# Clean up all containers
docker compose -f docker-compose.dev.yml down --remove-orphans
```

## Environment Variables

See `.env.example` for all available variables. Key ones:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=bumbu
DB_PASSWORD=localdev
DB_NAME=bumbuserbaguna

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NODE_ENV=development
LOG_LEVEL=debug
```

## Troubleshooting

### Docker daemon not running
```bash
# Restart Docker Desktop or WSL integration
docker run hello-world
```

### PostgreSQL connection refused
```bash
# Check if service is healthy
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs postgres

# Rebuild (last resort)
docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up -d
```

### Hot-reload not working
- Ensure project is in WSL filesystem (not `/mnt/c`)
- Check file permissions: `chmod +x backend/src/**/*.ts`
- Rebuild: `npm run dev --clear-cache`

### Schema not applied
```bash
# Manually run schema
docker exec -it bumbu_postgres psql -U bumbu -d bumbuserbaguna -f /docker-entrypoint-initdb.d/01-schema.sql
```

## Next Steps

- **Phase 2**: Build advanced plagiarism detection
- **Performance Tuning**: Monitor logs from `docker compose logs -f`
- **Production Deploy**: Use `docker-compose.yml` with secure env variables in CI/CD
