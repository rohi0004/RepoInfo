// Quick script to grant unlimited access to a visitor
const { grantExtraQueries, checkAllowance, initVisitor } = require('./src/lib/billing-mongodb.ts');

const visitorId = process.argv[2] || '65891f41-ce3a-4156-8893-cb5cc90b9cb8';

async function grantUnlimited() {
    try {
        console.log(`🎯 Granting unlimited access to: ${visitorId}`);
        
        // Initialize
        await initVisitor(visitorId);
        console.log('✅ Visitor initialized');
        
        // Grant with unlimited flag
        await grantExtraQueries(visitorId, 15000, true);
        console.log('✅ Granted 15000 queries with unlimited=true');
        
        // Verify
        const check = await checkAllowance(visitorId);
        console.log('🔍 Final check:', JSON.stringify(check, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

grantUnlimited();
