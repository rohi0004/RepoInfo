import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;

export async function connectMongoDB() {
    // Return existing connection
    if (db) return db;
    
    // Wait if connection is in progress
    if (isConnecting) {
        let attempts = 0;
        while (isConnecting && attempts < 50) {
            await new Promise(res => setTimeout(res, 100));
            attempts++;
        }
        if (db) return db;
    }
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('⚠️  MONGODB_URI environment variable is not set. MongoDB features disabled.');
        console.warn('To enable MongoDB, add MONGODB_URI to your .env.local file');
        throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Try connecting with retries and clearer timeouts
    isConnecting = true;
    const maxAttempts = 3;
    let attempt = 0;
    const baseDelay = 1000; // 1s

    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            client = new MongoClient(uri, {
                serverSelectionTimeoutMS: 10000, // 10s for better reliability on cold starts
                connectTimeoutMS: 15000, // 15s to handle deployment latency
                socketTimeoutMS: 60000, // 60s for long-running queries
                maxPoolSize: 10,
                minPoolSize: 0,
                retryWrites: true,
                retryReads: true,
            });

            await client.connect();
            db = client.db(process.env.MONGODB_DB_NAME || 'repoinfo');

            console.log('✅ Connected to MongoDB');

            // Create indexes for better performance (in background to not block)
            Promise.all([
                db.collection('visitors').createIndex({ visitorId: 1 }, { unique: true }),
                db.collection('billing').createIndex({ visitorId: 1 }, { unique: true }),
                db.collection('analytics').createIndex({ visitorId: 1, timestamp: -1 })
            ]).catch(err => console.warn('⚠️  Index creation failed:', err.message));

            isConnecting = false;
            return db;
        } catch (error: any) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${maxAttempts} failed:`, error?.message || error);

            // Close client if partially opened
            try {
                if (client) {
                    await client.close();
                }
            } catch (closeErr) {
                // ignore
            }

            client = null;

            if (attempt >= maxAttempts) {
                isConnecting = false;
                console.error('\n❌ All MongoDB connection attempts failed.\n');
                console.error('📋 Troubleshooting steps:');
                console.error('1. Check if MongoDB is running:');
                console.error('   - Local: Run `docker run -d -p 27017:27017 mongo` or install MongoDB locally');
                console.error('   - Atlas: Verify your cluster is active at https://cloud.mongodb.com');
                console.error('');
                console.error('2. Verify `MONGODB_URI` in your `.env.local` file:');
                console.error('   - Local: mongodb://localhost:27017');
                console.error('   - Atlas: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/');
                console.error('');
                console.error('3. For MongoDB Atlas:');
                console.error('   - Whitelist your IP in Network Access');
                console.error('   - Check database user credentials');
                console.error('   - Ensure cluster is not paused');
                console.error('');
                console.error('4. Test connection: `mongosh "' + uri.replace(/\/\/[^:]+:[^@]+@/, '//<user>:<pass>@') + '"`');
                console.error('');
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
}

export async function getMongoClient(): Promise<Db> {
    if (!db) {
        await connectMongoDB();
    }
    if (!db) {
        throw new Error('Failed to connect to MongoDB');
    }
    return db;
}

// Alias for compatibility with billing-mongodb.ts
export async function getDatabase(): Promise<Db> {
    return getMongoClient();
}

export async function disconnectMongoDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('✅ Disconnected from MongoDB');
    }
}
