#!/bin/bash
echo "==============================================="
echo "Starting Portfolio Backend on Render"
echo "==============================================="
echo "NODE_ENV: $NODE_ENV"
echo "RENDER: $RENDER"
echo "DATABASE_PATH: /tmp/portfolio-db"
echo "PWD: $(pwd)"
echo "==============================================="

# Start the compiled backend
node dist/src/index.js
echo "Starting Portfolio Backend on Render"
echo "==============================================="