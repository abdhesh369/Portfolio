#!/bin/bash

# Portfolio Database Restore Script
# Usage: npm run db:restore backups/portfolio_backup_2026-02-18.sql.gz

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: npm run db:restore [backup-file]"
    echo "Example: npm run db:restore backups/portfolio_backup_2026-02-18_10-30-00.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Extract DATABASE_URL securely without xargs (which mangles special characters)
if [ -f ../.env ]; then
    DATABASE_URL=$(grep -E '^DATABASE_URL=' ../.env | cut -d '=' -f2-)
fi

# Fallback to system env if not in .env
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL=$DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env or system environment"
    exit 1
fi

# Display basic info safely
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/||' | cut -d '?' -f1)

echo "⚠️  WARNING: This will REPLACE ALL DATA in database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you absolutely sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "📥 Restoring database from backup..."

# Decompress and restore using the full connection string (avoids brittle manual parsing)
# Use -v ON_ERROR_STOP=1 to ensure the script fails if psql encounters an error
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1

echo "✅ Database restored successfully!"
echo "🔄 Please restart your backend server"
