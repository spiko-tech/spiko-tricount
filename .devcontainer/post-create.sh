#!/bin/bash
set -e

echo "=========================================="
echo "  Setting up Spiko Tricount Development"
echo "=========================================="

# Install pnpm
echo ""
echo "Installing pnpm..."
corepack enable
corepack prepare pnpm@9.8.0 --activate

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install

# Wait for PostgreSQL to be ready with timeout
echo ""
echo "Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
until nc -z postgres 5432 2>/dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "  Warning: PostgreSQL connection check timed out after ${MAX_ATTEMPTS} attempts"
    echo "  The database may still be starting up. You can check with: nc -z postgres 5432"
    break
  fi
  echo "  PostgreSQL is not ready yet, waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done
if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
  echo "PostgreSQL is ready!"
fi

# Set DATABASE_HOST environment variable for the server
# In Codespaces, PostgreSQL runs in a container named 'postgres'
echo ""
echo "Configuring environment..."
if ! grep -q "DATABASE_HOST=postgres" ~/.bashrc 2>/dev/null; then
  echo 'export DATABASE_HOST=postgres' >> ~/.bashrc
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
echo "  Host:     postgres"
echo "  Port:     5432"
echo "  Database: spiko_tricount"
echo "  User:     postgres"
echo "  Password: postgres"
echo ""
echo "Happy coding!"
echo "=========================================="
