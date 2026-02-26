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

# Read .env
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Extract credentials
DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*://[^@]*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

export PGPASSWORD=$DB_PASS

echo "⚠️  WARNING: This will REPLACE ALL DATA in database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you absolutely sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "📥 Restoring database from backup..."

# Decompress and restore
gunzip -c "$BACKUP_FILE" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

echo "✅ Database restored successfully!"
echo "🔄 Please restart your backend server"
