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

# Wait for PostgreSQL to be ready (it should already be ready due to healthcheck)
echo ""
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U postgres -q; do
  echo "  PostgreSQL is not ready yet, waiting..."
  sleep 2
done
echo "PostgreSQL is ready!"

# Set DATABASE_HOST environment variable for the server
# In Codespaces, PostgreSQL runs in a container named 'postgres'
echo ""
echo "Configuring environment..."
echo 'export DATABASE_HOST=postgres' >> ~/.bashrc

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
