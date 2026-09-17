.PHONY: help build run delete up down logs-backend logs-frontend ps clean

# Typing just 'make' will show this help menu
help:
	@echo "Welcome to the project! Here are the available commands:"
	@echo "  make build  - Build the Docker images"
	@echo "  make run    - Start the project in the background"
	@echo "  make delete - Stop and completely remove containers, volumes, and networks"
	@echo "  make logs   - View logs for all containers"
	@echo "  make down   - Stop the project without deleting data"

# 1. BUILD: Just builds the images
build:
	docker compose build

# 2. RUN: Starts the containers (fast, uses existing builds)
run:
	docker compose up -d

# 3. DELETE: Full teardown (removes database volumes and orphaned containers)
delete:
	docker compose down -v --remove-orphans
	@echo "All containers, networks, and volumes have been deleted."

# --- Existing / Utility Commands ---

# Combo command: Build and run together (your original 'up')
up:
	docker compose up --build -d

# Safe stop (keeps database/volume data intact)
down:
	docker compose down

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

ps:
	docker compose ps
