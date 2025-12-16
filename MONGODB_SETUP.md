# MongoDB Setup Guide

## Issue
Your application requires MongoDB for visitor tracking and billing features. The connection errors occur because MongoDB is not configured or running.

## Quick Solutions

### Option 1: Use MongoDB with Docker (Recommended for Development)

1. **Start MongoDB using Docker:**
   ```bash
   docker run -d -p 27017:27017 --name repoinfo-mongo mongo:latest
   ```

2. **Verify it's running:**
   ```bash
   docker ps | grep mongo
   ```

3. **Your `.env.local` is already configured with:**
   ```
   MONGODB_URI="mongodb://localhost:27017"
   MONGODB_DB_NAME="repoinfo"
   ```

4. **Restart your application:**
   ```bash
   npm run dev
   ```

### Option 2: Install MongoDB Locally

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Option 3: Use MongoDB Atlas (Free Cloud Database)

1. **Create a free cluster:**
   - Go to https://cloud.mongodb.com
   - Sign up and create a free cluster (M0)
   - Wait for cluster to be created (~5-10 minutes)

2. **Configure Network Access:**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose username and password (save these!)
   - Grant "Read and Write" permissions

4. **Get Connection String:**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Update `.env.local`:**
   ```bash
   MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
   MONGODB_DB_NAME="repoinfo"
   ```

## Testing the Connection

Run this command to test your MongoDB connection:

```bash
node -e "const {MongoClient} = require('mongodb'); const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; new MongoClient(uri).connect().then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Failed:', e.message));"
```

## Verifying the Fix

After setting up MongoDB, restart your dev server:

```bash
# Kill existing process
pkill -f "next dev"

# Start fresh
npm run dev
```

You should see: `✅ Connected to MongoDB`

## Common Issues

### "Server selection timed out"
- MongoDB is not running
- Wrong connection string
- Firewall blocking port 27017

### "Topology is closed"
- Previous failed connection not cleaned up
- Restart your application

### "Authentication failed"
- Wrong username/password in connection string
- Database user not created in Atlas

## Features Requiring MongoDB

- Visitor tracking and analytics
- Query rate limiting (5 free queries per user)
- Billing and subscription management
- Pro plan features

## Optional: Disable MongoDB (Not Recommended)

If you want to run without MongoDB temporarily, you would need to modify the billing logic to use in-memory storage. However, this means losing all visitor tracking and billing features.
