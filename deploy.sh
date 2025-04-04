#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build frontend and backend
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npm run db:push

echo "Deployment preparation complete!"
echo "The application can now be started with 'npm run start'"