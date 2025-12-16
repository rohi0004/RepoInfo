const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('repoinfo');
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database: repoinfo, Collections: ${collections.length}`);
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
