#!/usr/bin/env node

/**
 * Test script to validate billing and chat limit functionality
 * Tests the complete flow from initial visit to payment to unlimited access
 */

const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_VISITOR_ID = `test-${crypto.randomUUID()}`;

console.log('🧪 Testing Billing Flow');
console.log('======================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test Visitor ID: ${TEST_VISITOR_ID}`);
console.log('');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  const response = await fetch(`${BASE_URL}/api/health`);
  const data = await response.json();
  
  if (data.database?.mongoStatus !== 'connected') {
    console.error('❌ MongoDB is not connected!');
    console.error('   Status:', data.database?.mongoStatus);
    console.error('   Error:', data.database?.mongoError);
    throw new Error('MongoDB connection failed');
  }
  
  console.log('✅ Health check passed - MongoDB connected');
  return data;
}

async function testInitialAllowance() {
  console.log('');
  console.log('2️⃣ Testing Initial Allowance (should have 5 free queries)...');
  const response = await fetch(`${BASE_URL}/api/billing/check?visitorId=${TEST_VISITOR_ID}`);
  const data = await response.json();
  
  if (!data.allowed) {
    console.error('❌ New user should be allowed!');
    throw new Error('Initial allowance check failed');
  }
  
  if (data.remaining !== 5) {
    console.error(`❌ New user should have 5 queries, got ${data.remaining}`);
    throw new Error('Initial allowance incorrect');
  }
  
  console.log('✅ Initial allowance correct:', data);
  return data;
}

async function testQueryDecrement() {
  console.log('');
  console.log('3️⃣ Testing Query Decrement (simulating chat queries)...');
  
  // Simulate 3 queries
  for (let i = 1; i <= 3; i++) {
    const response = await fetch(`${BASE_URL}/api/chat/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `Test query ${i}`,
        visitorId: TEST_VISITOR_ID
      })
    });
    
    if (!response.ok) {
      console.error(`❌ Query ${i} failed`);
      const error = await response.text();
      console.error('   Error:', error);
    } else {
      console.log(`   ✓ Query ${i} successful`);
    }
    
    await sleep(500); // Small delay between queries
  }
  
  // Check remaining queries
  const checkResponse = await fetch(`${BASE_URL}/api/billing/check?visitorId=${TEST_VISITOR_ID}`);
  const checkData = await checkResponse.json();
  
  if (checkData.usageCount !== 3) {
    console.error(`❌ Expected usage count 3, got ${checkData.usageCount}`);
    throw new Error('Usage count incorrect');
  }
  
  if (checkData.remaining !== 2) {
    console.error(`❌ Expected 2 remaining queries, got ${checkData.remaining}`);
    throw new Error('Remaining count incorrect');
  }
  
  console.log('✅ Query decrement working correctly:', checkData);
  return checkData;
}

async function testUnlimitedGrant() {
  console.log('');
  console.log('4️⃣ Testing Unlimited Access Grant (simulating payment)...');
  
  const response = await fetch(`${BASE_URL}/api/billing/test-unlimited`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: TEST_VISITOR_ID,
      planId: 'pro_yearly'
    })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    console.error('❌ Unlimited grant failed!');
    console.error('   Response:', data);
    throw new Error('Unlimited grant failed');
  }
  
  if (!data.unlimited) {
    console.error('❌ User should have unlimited access!');
    throw new Error('Unlimited flag not set');
  }
  
  console.log('✅ Unlimited access granted:', data);
  return data;
}

async function testUnlimitedAccess() {
  console.log('');
  console.log('5️⃣ Testing Unlimited Access (should allow any number of queries)...');
  
  const checkResponse = await fetch(`${BASE_URL}/api/billing/check?visitorId=${TEST_VISITOR_ID}`);
  const checkData = await checkResponse.json();
  
  if (!checkData.allowed) {
    console.error('❌ Unlimited user should be allowed!');
    console.error('   Data:', checkData);
    throw new Error('Unlimited user not allowed');
  }
  
  if (checkData.remaining !== -1) {
    console.error('❌ Unlimited user should have remaining=-1');
    console.error('   Data:', checkData);
    throw new Error('Unlimited remaining count incorrect');
  }
  
  // Try multiple queries to ensure no limit
  console.log('   Testing multiple queries with unlimited access...');
  for (let i = 1; i <= 5; i++) {
    const response = await fetch(`${BASE_URL}/api/chat/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `Unlimited test query ${i}`,
        visitorId: TEST_VISITOR_ID
      })
    });
    
    if (!response.ok) {
      console.error(`❌ Unlimited query ${i} failed`);
      const error = await response.text();
      console.error('   Error:', error);
      throw new Error('Unlimited query failed');
    }
    console.log(`   ✓ Unlimited query ${i} successful`);
    await sleep(500);
  }
  
  // Verify still unlimited after queries
  const finalCheck = await fetch(`${BASE_URL}/api/billing/check?visitorId=${TEST_VISITOR_ID}`);
  const finalData = await finalCheck.json();
  
  if (!finalData.allowed || finalData.remaining !== -1) {
    console.error('❌ User should still have unlimited access!');
    console.error('   Data:', finalData);
    throw new Error('Unlimited access lost after queries');
  }
  
  console.log('✅ Unlimited access working correctly');
  console.log('   Final usage count:', finalData.usageCount);
  return finalData;
}

async function testBlockedUser() {
  console.log('');
  console.log('6️⃣ Testing Blocked User Functionality...');
  
  // Note: This test requires manual database modification
  console.log('⚠️  To test blocked functionality, manually run in MongoDB:');
  console.log(`   db.billing.updateOne(`);
  console.log(`     { visitorId: "${TEST_VISITOR_ID}" },`);
  console.log(`     { $set: { blocked: true, blockedReason: "Test block" } }`);
  console.log(`   )`);
  console.log('');
  console.log('⏭️  Skipping blocked user test (requires manual setup)');
}

async function runTests() {
  try {
    await testHealthCheck();
    await testInitialAllowance();
    await testQueryDecrement();
    await testUnlimitedGrant();
    await testUnlimitedAccess();
    await testBlockedUser();
    
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════');
    console.log('');
    console.log('📊 Test Summary:');
    console.log(`   Test Visitor ID: ${TEST_VISITOR_ID}`);
    console.log('   Status: All billing flows working correctly');
    console.log('');
    console.log('🧹 Cleanup (optional):');
    console.log('   To remove test data from MongoDB:');
    console.log(`   db.visitors.deleteOne({ visitorId: "${TEST_VISITOR_ID}" })`);
    console.log(`   db.billing.deleteOne({ visitorId: "${TEST_VISITOR_ID}" })`);
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('1. Check MongoDB connection (MONGODB_URI env var)');
    console.error('2. Verify application is running');
    console.error('3. Check application logs for errors');
    console.error('4. Test MongoDB directly with mongosh');
    
    process.exit(1);
  }
}

// Run tests
runTests();
