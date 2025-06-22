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

# Create backups directory if it doesn't exist
BACKUP_DIR="../backups"
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/auto_order_backup_$TIMESTAMP.sql"

# Set PGPASSWORD environment variable
export PGPASSWORD=$DB_PASS

# Create the backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Database backup created successfully at: $BACKUP_FILE"
else
  echo "❌ Error creating database backup"
  exit 1
fi

# Remove PGPASSWORD from environment
unset PGPASSWORD 