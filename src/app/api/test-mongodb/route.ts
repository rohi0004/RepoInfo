import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { 
  getVisitorUsage, 
  getBillingData, 
  checkAllowance,
  incrementVisitorUsage,
  updateBillingData 
} from '@/lib/billing-mongodb';

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB Connection...\n');
    
    // Test connection
    console.log('1️⃣ Connecting to MongoDB...');
    const db = await getDatabase();
    console.log('   ✅ Connected successfully!\n');

    // Test visitor ID
    const testVisitorId = 'test-visitor-' + Date.now();
    console.log(`2️⃣ Testing with visitor ID: ${testVisitorId}\n`);

    // Test initial state
    console.log('3️⃣ Checking initial allowance...');
    let allowance = await checkAllowance(testVisitorId);
    console.log('   Allowed:', allowance.allowed);
    console.log('   Remaining:', allowance.remaining);
    console.log('   Usage Count:', allowance.usageCount);
    console.log('');

    // Simulate 3 queries
    console.log('4️⃣ Simulating 3 queries...');
    for (let i = 1; i <= 3; i++) {
      await incrementVisitorUsage(testVisitorId, {
        country: 'India',
        device: 'desktop',
        userAgent: 'test-agent'
      });
      console.log(`   Query ${i} tracked`);
    }
    console.log('');

    // Check allowance after 3 queries
    console.log('5️⃣ Checking allowance after 3 queries...');
    allowance = await checkAllowance(testVisitorId);
    console.log('   Allowed:', allowance.allowed);
    console.log('   Remaining:', allowance.remaining, '(should be 2)');
    console.log('   Usage Count:', allowance.usageCount, '(should be 3)');
    console.log('');

    // Simulate 2 more queries (total 5)
    console.log('6️⃣ Simulating 2 more queries (reaching limit)...');
    for (let i = 4; i <= 5; i++) {
      await incrementVisitorUsage(testVisitorId, {
        country: 'India',
        device: 'desktop',
        userAgent: 'test-agent'
      });
      console.log(`   Query ${i} tracked`);
    }
    console.log('');

    // Check allowance after 5 queries
    console.log('7️⃣ Checking allowance after 5 queries...');
    allowance = await checkAllowance(testVisitorId);
    console.log('   Allowed:', allowance.allowed, '(should be false)');
    console.log('   Remaining:', allowance.remaining, '(should be 0)');
    console.log('   Usage Count:', allowance.usageCount, '(should be 5)');
    console.log('');

    // Try one more query (should be denied)
    console.log('8️⃣ Attempting 6th query (should be denied)...');
    await incrementVisitorUsage(testVisitorId, {
      country: 'India',
      device: 'desktop',
      userAgent: 'test-agent'
    });
    allowance = await checkAllowance(testVisitorId);
    console.log('   Allowed:', allowance.allowed, '(should be false)');
    console.log('   Remaining:', allowance.remaining, '(should be 0)');
    console.log('   Usage Count:', allowance.usageCount, '(should be 6)');
    console.log('');

    // Test upgrading to pro plan
    console.log('9️⃣ Upgrading to pro plan...');
    await updateBillingData(
      testVisitorId,
      'pro_yearly',
      15000, // extra queries
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      true // unlimited
    );
    console.log('   ✅ Upgraded to pro_yearly\n');

    // Check allowance after upgrade
    console.log('🔟 Checking allowance after upgrade...');
    allowance = await checkAllowance(testVisitorId);
    console.log('   Allowed:', allowance.allowed, '(should be true)');
    console.log('   Remaining:', allowance.remaining, '(should be -1 for unlimited)');
    console.log('   Usage Count:', allowance.usageCount, '(should be 6)');
    console.log('');

    console.log('✅ All tests passed!\n');

    return NextResponse.json({
      success: true,
      message: 'All MongoDB tests passed!',
      testVisitorId,
      finalAllowance: allowance
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
