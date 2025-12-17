#!/usr/bin/env node

/**
 * Migration script to move billing data from Redis to MongoDB
 * Run this if you previously used Redis and want to migrate existing users
 */

require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('🔄 Redis → MongoDB Migration Tool');
  console.log('==================================');
  console.log('');

  // Check if Redis is configured
  if (!process.env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not configured - nothing to migrate');
    console.log('   If you never used Redis, you can ignore this script.');
    return;
  }

  // Check if MongoDB is configured
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured!');
    console.error('   Add MONGODB_URI to your .env.local file before running migration');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Redis: ${process.env.REDIS_URL}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<user>:<pass>@')}`);
  console.log('');

  try {
    // Connect to Redis
    console.log('1️⃣ Connecting to Redis...');
    const { createClient } = require('redis');
    const redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    // Connect to MongoDB
    console.log('');
    console.log('2️⃣ Connecting to MongoDB...');
    const { getDatabase } = require('./src/lib/mongodb');
    const db = await getDatabase();
    console.log('✅ Connected to MongoDB');

    // Find all billing keys in Redis
    console.log('');
    console.log('3️⃣ Scanning Redis for billing data...');
    const keys = await redisClient.keys('billing:visitor:*');
    console.log(`   Found ${keys.length} billing records in Redis`);

    if (keys.length === 0) {
      console.log('');
      console.log('ℹ️  No billing data found in Redis - nothing to migrate');
      await redisClient.disconnect();
      return;
    }

    // Migrate each record
    console.log('');
    console.log('4️⃣ Migrating records...');
    let migrated = 0;
    let errors = 0;

    for (const key of keys) {
      try {
        // Extract visitorId from key: billing:visitor:uuid
        const visitorId = key.replace('billing:visitor:', '');
        
        // Get data from Redis
        const redisData = await redisClient.hGetAll(key);
        
        if (!redisData || Object.keys(redisData).length === 0) {
          console.log(`   ⏭️  Skipping empty record: ${visitorId}`);
          continue;
        }

        // Convert Redis data to MongoDB format
        const mongoData = {
          visitorId,
          plan: redisData.plan || null,
          extraQueries: parseInt(redisData.extraQueries || '0', 10),
          activeUntil: redisData.activeUntil ? new Date(parseInt(redisData.activeUntil, 10)) : null,
          unlimited: redisData.unlimited === '1' || redisData.unlimited === 'true',
          blocked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Insert into MongoDB (upsert)
        await db.collection('billing').updateOne(
          { visitorId },
          { $set: mongoData },
          { upsert: true }
        );

        console.log(`   ✓ Migrated: ${visitorId} (unlimited=${mongoData.unlimited}, extraQueries=${mongoData.extraQueries})`);
        migrated++;
      } catch (error) {
        console.error(`   ✗ Failed to migrate ${key}:`, error.message);
        errors++;
      }
    }

    // Cleanup
    await redisClient.disconnect();

    // Summary
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('📊 Migration Summary:');
    console.log(`   Total records found: ${keys.length}`);
    console.log(`   Successfully migrated: ${migrated}`);
    console.log(`   Errors: ${errors}`);
    console.log('═══════════════════════════════════');
    console.log('');

    if (migrated > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('1. Verify data in MongoDB:');
      console.log('   mongosh "your_connection_string"');
      console.log('   > use repoinfo');
      console.log('   > db.billing.find()');
      console.log('');
      console.log('2. Test your application with MongoDB');
      console.log('   node scripts/test-billing-flow.js');
      console.log('');
      console.log('3. Once verified, you can safely:');
      console.log('   - Remove REDIS_URL from .env.local');
      console.log('   - Stop your Redis server');
      console.log('   - Delete Redis data');
      console.log('');
      console.log('⚠️  DO NOT delete Redis until you verify MongoDB works!');
    } else {
      console.log('ℹ️  No records were migrated');
    }

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:');
    console.error(error);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('1. Verify Redis is running and REDIS_URL is correct');
    console.error('2. Verify MongoDB is running and MONGODB_URI is correct');
    console.error('3. Check network connectivity to both databases');
    console.error('4. Review error message above for specific issues');
    process.exit(1);
  }
}

// Run migration
migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
