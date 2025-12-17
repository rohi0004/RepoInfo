#!/usr/bin/env node

/**
 * Manual script to grant unlimited access to a user
 * Use this if payment succeeded but access wasn't granted
 * 
 * Usage: node scripts/manual-grant-unlimited.js <visitorId>
 */

require('dotenv').config({ path: '.env.local' });

async function grantUnlimited(visitorId) {
  if (!visitorId) {
    console.error('❌ Usage: node scripts/manual-grant-unlimited.js <visitorId>');
    console.error('   Example: node scripts/manual-grant-unlimited.js 7fb7395c-1a09-4a1d-9202-f860704ab9a9');
    process.exit(1);
  }

  console.log('🔧 Manual Unlimited Access Grant');
  console.log('================================');
  console.log(`Visitor ID: ${visitorId}`);
  console.log('');

  try {
    // Connect to MongoDB
    const { getDatabase } = require('./src/lib/mongodb');
    const { grantExtraQueries, updateBillingData, checkAllowance, initVisitor } = require('./src/lib/billing-mongodb');
    
    console.log('1️⃣ Connecting to MongoDB...');
    const db = await getDatabase();
    console.log('✅ Connected');
    
    console.log('');
    console.log('2️⃣ Initializing visitor...');
    await initVisitor(visitorId);
    console.log('✅ Initialized');
    
    console.log('');
    console.log('3️⃣ Granting unlimited access...');
    await grantExtraQueries(visitorId, 15000, true); // 15000 queries + unlimited flag
    console.log('✅ Granted');
    
    console.log('');
    console.log('4️⃣ Updating billing data...');
    const activeUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await updateBillingData(visitorId, 'pro_yearly', 15000, activeUntil, true);
    console.log('✅ Updated');
    
    console.log('');
    console.log('5️⃣ Verifying access...');
    const check = await checkAllowance(visitorId);
    console.log('✅ Verification:', JSON.stringify(check, null, 2));
    
    if (check.allowed && check.remaining === -1) {
      console.log('');
      console.log('═══════════════════════════════════');
      console.log('✅ SUCCESS!');
      console.log('═══════════════════════════════════');
      console.log(`Visitor ${visitorId} now has unlimited access!`);
      console.log('');
      console.log('The user can now:');
      console.log('1. Close the error page');
      console.log('2. Go back to the app');
      console.log('3. Start chatting (unlimited queries)');
    } else {
      console.log('');
      console.log('⚠️  WARNING: Access may not be properly set');
      console.log('Check:', check);
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify MONGODB_URI is set in .env.local');
    console.error('2. Check MongoDB connection');
    console.error('3. Verify visitor ID is correct');
    process.exit(1);
  }
}

// Get visitorId from command line
const visitorId = process.argv[2];
grantUnlimited(visitorId);
