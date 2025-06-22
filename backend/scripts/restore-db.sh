#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(cat ../.env | grep DATABASE_URL)
fi

# Extract database connection details from DATABASE_URL
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
else
  echo "Error: Could not parse DATABASE_URL"
  exit 1
fi

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <backup_file>"
  echo "Example: ./restore-db.sh ../backups/auto_order_backup_20240622_123456.sql"
  exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Set PGPASSWORD environment variable
export PGPASSWORD=$DB_PASS

# Warn user about data loss
echo "⚠️  WARNING: This will overwrite the current database with the backup."
echo "    Database: $DB_NAME"
echo "    Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled"
  exit 1
fi

# Drop all connections to the database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();"

# Drop and recreate the database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore the backup
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo "✅ Database restored successfully from: $BACKUP_FILE"
else
  echo "❌ Error restoring database"
  exit 1
fi

# Remove PGPASSWORD from environment
unset PGPASSWORD 