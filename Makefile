.PHONY: up down seed dev logs clean restart

# Start the full stack with Docker (production-like)
up:
	docker compose up --build -d

# Stop and remove containers
down:
	docker compose down

# Seed the database inside Docker
seed:
	docker compose --profile seed run --rm seed

# Start in development mode with hot reload
dev:
	docker compose -f docker-compose.dev.yml up --build

# View logs from the app container
logs:
	docker compose logs -f app

# Restart containers
restart:
	docker compose restart app

# Clean all volumes and containers
clean:
	docker compose down -v
