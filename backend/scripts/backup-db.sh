#!/bin/bash

# Check for required tools
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ Error: $1 is not installed or not in PATH"
    echo "Please install PostgreSQL client tools:"
    echo "1. Download from: https://www.postgresql.org/download/windows/"
    echo "2. Or download binaries from: https://www.enterprisedb.com/download-postgresql-binaries"
    echo "3. Make sure the bin directory is in your PATH"
    exit 1
  fi
}

check_command pg_dump
check_command psql

# Use environment variables directly if they exist
DB_NAME=${DB_NAME:-"railway"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"centerbeam.proxy.rlwy.net"}
DB_PORT=${DB_PORT:-"54868"}
DB_PASS=${DB_PASSWORD:-"arwEMOAzGJyWNxmAVbBTeRutmeADLXSe"}

# Create backups directory if it doesn't exist
BACKUP_DIR="../backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/auto_order_backup_$TIMESTAMP.sql"

# Test database connection first
echo "Testing database connection..."
if ! PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
  echo "❌ Error: Could not connect to database. Please check your credentials and make sure the database is accessible."
  echo "Connection details:"
  echo "  Host: $DB_HOST"
  echo "  Port: $DB_PORT"
  echo "  Database: $DB_NAME"
  echo "  User: $DB_USER"
  exit 1
fi

echo "Creating backup..."
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Database backup created successfully at: $BACKUP_FILE"
  echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "❌ Error creating database backup"
  rm -f "$BACKUP_FILE"  # Clean up failed backup file
  exit 1
fi 