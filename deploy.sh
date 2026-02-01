#!/bin/bash

# Deployment Script for Aporto

echo "🚀 Starting Deployment..."

# 1. Reset local changes (fixes "unstaged changes" error)
echo "🧹 Resetting local changes..."
git reset --hard origin/main

# 2. Pull latest code
echo "⬇️  Pulling latest code from GitHub..."
git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Build application
echo "🏗️  Building application..."
npm run build

# 5. Restart PM2 process
echo "🔄 Restarting Service..."
pm2 restart aporto || pm2 start npm --name "aporto" -- start
echo "🔄 Restarting Worker..."
pm2 restart aporto-worker || pm2 start npm --name "aporto-worker" -- run worker



echo "✅ Deployment Complete!"
