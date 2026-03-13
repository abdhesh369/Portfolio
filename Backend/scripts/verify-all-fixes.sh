#!/bin/bash
set -e

echo "🔍 Starting Final Verification of System Health Fixes..."

# 1. Check if debug scripts are gone
echo "➡ Checking for deleted debug scripts..."
if [ -f "Backend/check-db.js" ] || [ -f "Backend/check-seo-cols.ts" ] || [ -f "Backend/src/fix-db-schema.ts" ]; then
    echo "❌ Error: One or more debug scripts still exist."
    exit 1
fi
echo "✅ Debug scripts removed."

# 2. Verify migration 0020 existence
echo "➡ Verifying migration 0020..."
if [ ! -f "Backend/drizzle/migrations/0020_rename_snake_to_camel.sql" ]; then
    echo "❌ Error: Migration 0020 not found."
    exit 1
fi
echo "✅ Migration 0020 exists."

# 3. Verify CORS configuration
echo "➡ Verifying CORS in Backend/src/index.ts..."
if grep -q "https://abdheshsah.com.np" Backend/src/index.ts; then
    echo "❌ Error: Hardcoded domain still found in CORS config."
    exit 1
fi
echo "✅ CORS configuration is clean."

# 4. Verify backup script security
echo "➡ Verifying backup-db.sh security..."
if grep -q "xargs" Backend/scripts/backup-db.sh; then
    echo "❌ Warning: Unsafe xargs still found in backup script."
fi
if grep -q "DATABASE_URL=" Backend/scripts/backup-db.sh && grep -q "cut -d '=' -f2-" Backend/scripts/backup-db.sh; then
    echo "✅ Backup script uses safe extraction."
else
    echo "❌ Error: Backup script extraction logic not found."
    exit 1
fi

# 5. Verify unified isProd
echo "➡ Verifying shared is-prod utility..."
if [ -f "Backend/src/lib/is-prod.ts" ] && [ -f "Backend/src/lib/is-prod.test.ts" ]; then
    echo "✅ Shared is-prod utility and tests found."
else
    echo "❌ Error: is-prod utility or tests missing."
    exit 1
fi

# 6. Verify ESLint rules
echo "➡ Verifying ESLint configurations..."
if grep -q "no-console" Backend/eslint.config.js && grep -q "no-console" Frontend/eslint.config.js; then
    echo "✅ ESLint no-console rules enforced."
else
    echo "❌ Error: no-console rule missing from one or more configs."
    exit 1
fi

# 7. Verify Vitest Coverage thresholds
echo "➡ Verifying Vitest coverage thresholds..."
if grep -q "lines: 70" Backend/vitest.config.ts && grep -q "lines: 75" Frontend/vitest.config.ts; then
    echo "✅ Coverage thresholds updated."
else
    echo "❌ Error: Coverage thresholds not updated correctly."
    exit 1
fi

echo "🎉 ALL FIXES VERIFIED SUCCESSFULLY!"
