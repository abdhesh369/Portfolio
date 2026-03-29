#!/bin/bash

# Portfolio Database Backup Script
# Run with: npm run db:backup

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="portfolio_backup_$DATE.sql"

# Extract DATABASE_URL directly rather than sourcing the whole .env file.
# xargs-based sourcing splits on whitespace, breaking passwords that
# contain spaces, quotes, or dollar signs.
if [ -f ../.env ]; then
    # Extract, remove 'DATABASE_URL=' prefix, and strip any surrounding quotes
    DATABASE_URL=$(grep -E '^DATABASE_URL=' ../.env | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export DATABASE_URL
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Creating database backup..."
echo "File: $FILENAME"

# Create backup using DATABASE_URL directly
pg_dump "$DATABASE_URL" --clean --if-exists > "$BACKUP_DIR/$FILENAME"

# Compress
echo "🗜️  Compressing backup..."
gzip "$BACKUP_DIR/$FILENAME"

echo "✅ Backup created: $FILENAME.gz"
echo "📍 Location: $BACKUP_DIR/$FILENAME.gz"

# Keep only last 7 days
echo "🧹 Cleaning old backups (>7 days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup complete!"
