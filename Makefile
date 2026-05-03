.PHONY: dev dev-backend dev-front docker-up docker-down build

# Development
dev:
	@echo "Starting local development environment..."
	cd backend && cargo run &
	cd frontend && npm run dev &

dev-backend:
	cd backend && cargo run

dev-frontend:
	cd frontend && npm run dev

# Docker
docker-up:
	docker compose up --build

docker-down:
	docker compose down

# Build
build-backend:
	cd backend && cargo build --release

build-frontend:
	cd frontend && npm run build

build: build-backend build-frontend

# Database
db-migrate:
	cd backend && sqlx migrate run

db-reset:
	cd backend && sqlx database drop && sqlx database create && sqlx migrate run

# Clean
clean:
	cd backend && cargo clean
	cd frontend && rm -rf dist node_modules
