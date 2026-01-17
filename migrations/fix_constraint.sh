#!/bin/bash

# Quick fix script to drop the obsolete foreign key constraint
# This should be run on the production server

echo "Dropping obsolete foreign key constraint from user_prizes table..."

# Execute SQL directly using psql
psql $POSTGRES_URL -c "ALTER TABLE user_prizes DROP CONSTRAINT IF EXISTS user_prizes_telegram_id_fkey;"

echo "Constraint dropped. Verifying..."

# Verify it's gone
psql $POSTGRES_URL -c "SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE constraint_name = 'user_prizes_telegram_id_fkey';"

echo "Done!"
