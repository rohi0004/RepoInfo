#!/usr/bin/env node

// Clear billing test data from Redis
const { createClient } = require('redis');

async function clearTestData() {
  const visitorId = process.argv[2];
  
  if (!visitorId) {
    console.log('Usage: node clear-test-billing.js <visitorId>');
    console.log('Example: node clear-test-billing.js ff662a4a-2724-4210-ab4c-302e81cbe4d3');
    process.exit(1);
  }

  const client = createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Delete visitor data
    const visitorKey = `visitor:${visitorId}`;
    const billingKey = `billing:visitor:${visitorId}`;
    
    console.log(`🗑️  Deleting ${visitorKey}...`);
    await client.del(visitorKey);
    
    console.log(`🗑️  Deleting ${billingKey}...`);
    await client.del(billingKey);
    
    // Remove from visitors set
    console.log(`🗑️  Removing from visitors set...`);
    await client.sRem('visitors', visitorId);
    
    console.log('✅ Test data cleared successfully!');
    console.log('\n💡 Tip: Clear your browser localStorage and refresh to get a new visitor ID');
    console.log('   Or use: localStorage.removeItem("visitor_id")');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

clearTestData();
