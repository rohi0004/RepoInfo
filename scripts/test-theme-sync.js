/**
 * Test script for theme preference synchronization
 * Run with: node scripts/test-theme-sync.js
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment');
  process.exit(1);
}

const testVisitorId = 'test-visitor-' + Date.now();
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testThemeSync() {
  console.log('🧪 Testing Theme Synchronization\n');

  // Test 1: Save theme preference
  console.log('1️⃣ Testing theme save...');
  try {
    const saveResponse = await fetch(`${baseUrl}/api/preferences/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'dark',
        visitorId: testVisitorId
      })
    });

    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${saveResponse.status}`);
    }

    const saveData = await saveResponse.json();
    console.log('✅ Theme saved:', saveData);
  } catch (error) {
    console.error('❌ Save test failed:', error.message);
    return;
  }

  // Test 2: Retrieve theme preference
  console.log('\n2️⃣ Testing theme retrieval...');
  try {
    const getResponse = await fetch(`${baseUrl}/api/preferences/theme`, {
      headers: {
        'x-visitor-id': testVisitorId
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Retrieval failed: ${getResponse.status}`);
    }

    const getData = await getResponse.json();
    
    if (getData.theme !== 'dark') {
      console.error(`❌ Expected theme 'dark', got '${getData.theme}'`);
      return;
    }

    console.log('✅ Theme retrieved correctly:', getData);
  } catch (error) {
    console.error('❌ Retrieval test failed:', error.message);
    return;
  }

  // Test 3: Update theme preference
  console.log('\n3️⃣ Testing theme update...');
  try {
    const updateResponse = await fetch(`${baseUrl}/api/preferences/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'light',
        visitorId: testVisitorId
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Theme updated:', updateData);
  } catch (error) {
    console.error('❌ Update test failed:', error.message);
    return;
  }

  // Test 4: Verify update
  console.log('\n4️⃣ Verifying update...');
  try {
    const verifyResponse = await fetch(`${baseUrl}/api/preferences/theme`, {
      headers: {
        'x-visitor-id': testVisitorId
      }
    });

    if (!verifyResponse.ok) {
      throw new Error(`Verification failed: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    
    if (verifyData.theme !== 'light') {
      console.error(`❌ Expected theme 'light', got '${verifyData.theme}'`);
      return;
    }

    console.log('✅ Update verified:', verifyData);
  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
    return;
  }

  // Test 5: Test invalid theme
  console.log('\n5️⃣ Testing invalid theme validation...');
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/preferences/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'invalid-theme',
        visitorId: testVisitorId
      })
    });

    if (invalidResponse.ok) {
      console.error('❌ Invalid theme should have been rejected');
      return;
    }

    console.log('✅ Invalid theme properly rejected');
  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
    return;
  }

  console.log('\n✅ All tests passed! Theme synchronization is working correctly.');
}

// Run tests
console.log('🚀 Starting theme sync tests...\n');
console.log(`Testing against: ${baseUrl}\n`);

testThemeSync().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
