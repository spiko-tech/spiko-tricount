#!/bin/bash
set -e

echo "=========================================="
echo "  Setting up Spiko Tricount Development"
echo "=========================================="

# Install pnpm
echo ""
echo "Installing pnpm..."
corepack enable
corepack prepare pnpm@10 --activate

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install

# Setup PostgreSQL database
echo ""
echo "Setting up PostgreSQL database..."
sudo -u postgres createdb spiko_tricount 2>/dev/null || echo "  Database 'spiko_tricount' already exists"

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
until pg_isready -q; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "  Warning: PostgreSQL connection check timed out after ${MAX_ATTEMPTS} attempts"
    break
  fi
  echo "  PostgreSQL is not ready yet, waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done
if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
  echo "PostgreSQL is ready!"
fi

# Display welcome message
echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Available commands:"
echo "  pnpm nx run-many -t dev    Start all services in dev mode"
echo "  pnpm nx run-many -t build  Build all projects"
echo "  pnpm nx run-many -t test   Run all tests"
echo "  pnpm nx run-many -t lint   Lint all projects"
echo ""
echo "Services will be available at:"
echo "  Frontend: http://localhost:4200"
echo "  Backend:  http://localhost:3000"
echo ""
echo "Database connection:"
echo "  Host:     localhost"
echo "  Port:     5432"
echo "  Database: spiko_tricount"
echo "  User:     postgres"
echo "  Password: postgres"
echo ""
echo "Happy coding!"
echo "=========================================="
