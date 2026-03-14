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
if ! node dist/src/migrate.js; then
    echo "❌ Migration failed! Aborting startup to prevent data corruption."
    exit 1
fi

# Start the compiled backend
node --import ./dist/src/instrument.js ./dist/src/index.js