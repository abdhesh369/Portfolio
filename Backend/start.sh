#!/bin/bash
echo "==============================================="
echo "Starting Portfolio Backend on Render"
echo "==============================================="
echo "NODE_ENV: $NODE_ENV"
echo "RENDER: $RENDER"
echo "PWD: $(pwd)"
echo "==============================================="

# Run migrations before starting
echo "Running database migrations..."
node dist/src/migrate.js || echo "Migration skipped or failed (non-fatal)"

# Start the compiled backend
node dist/src/index.js