#!/bin/bash

# Portfolio Database Backup Script
# Run with: npm run db:backup

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="portfolio_backup_$DATE.sql"

# Read database credentials from .env
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Extract DB credentials from DATABASE_URL
# Format: postgresql://user:password@host:port/database
# or postgres://...
DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

# Export password for pg_dump
export PGPASSWORD=$DB_PASS

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."
echo "Database: $DB_NAME"
echo "File: $FILENAME"

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --clean --if-exists > "$BACKUP_DIR/$FILENAME"

# Compress
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$FILENAME"

echo "✅ Backup created: $FILENAME.gz"
echo "📍 Location: $BACKUP_DIR/$FILENAME.gz"

# Keep only last 7 days
echo "🧹 Cleaning old backups (>7 days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup complete!"
