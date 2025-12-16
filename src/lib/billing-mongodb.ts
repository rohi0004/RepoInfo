import { getDatabase } from './mongodb';
import Stripe from 'stripe';

const FREE_QUERIES = 5;

export interface VisitorUsage {
  visitorId: string;
  queryCount: number;
  firstSeen: Date;
  lastSeen: Date;
  country?: string;
  device?: string;
  userAgent?: string;
}

export interface BillingData {
  visitorId: string;
  plan: string | null;
  extraQueries: number;
  activeUntil: Date | null;
  unlimited: boolean;
  blocked: boolean;
  blockedReason?: string;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function getVisitorUsage(visitorId: string) {
  try {
    if (!visitorId) return { queryCount: 0, exists: false };

    const db = await getDatabase();
    const collection = db.collection<VisitorUsage>('visitors');
    
    const visitor = await collection.findOne({ visitorId });
    
    if (visitor) {
      return {
        queryCount: visitor.queryCount || 0,
        exists: true
      };
    }
    
    return { queryCount: 0, exists: false };
  } catch (e) {
    console.warn('getVisitorUsage failed', e);
    return { queryCount: 0, exists: false };
  }
}

export async function getBillingData(visitorId: string) {
  try {
    if (!visitorId) return { plan: null, extraQueries: 0, unlimited: false, exists: false };

    const db = await getDatabase();
    const collection = db.collection<BillingData>('billing');
    
    const billing = await collection.findOne({ visitorId });
    
    if (billing) {
      const result = {
        plan: billing.plan || null,
        extraQueries: billing.extraQueries || 0,
        activeUntil: billing.activeUntil ? billing.activeUntil.getTime() : null,
        unlimited: billing.unlimited || false,
        exists: true
      };
      console.log(`📊 getBillingData(${visitorId}) [MongoDB]:`, JSON.stringify(result));
      return result;
    }
    
    return { plan: null, extraQueries: 0, unlimited: false, exists: false };
  } catch (e) {
    console.warn('getBillingData failed', e);
    return { plan: null, extraQueries: 0, unlimited: false, exists: false };
  }
}

export async function checkAllowance(visitorId: string) {
  const usage = await getVisitorUsage(visitorId);
  const billing = await getBillingData(visitorId);

  const visitorExists = Boolean((usage as any).exists || (billing as any).exists);
  console.log(`🔍 checkAllowance for ${visitorId}: unlimited=${(billing as any).unlimited}, blocked=${(billing as any).blocked}, exists=${visitorExists}`);
  
  // Check if user is blocked
  if ((billing as any).blocked) {
    console.log(`🚫 Access blocked for ${visitorId}: ${(billing as any).blockedReason || 'No reason provided'}`);
    return {
      allowed: false,
      remaining: 0,
      allowedTotal: 0,
      usageCount: usage.queryCount || 0,
      billing,
      visitorExists,
      blocked: true,
      blockedReason: (billing as any).blockedReason
    };
  }
  
  if ((billing as any).unlimited) {
    console.log(`✅ Unlimited access granted for ${visitorId}`);
    return {
      allowed: true,
      remaining: -1,
      allowedTotal: Number.POSITIVE_INFINITY,
      usageCount: usage.queryCount || 0,
      billing,
      visitorExists
    };
  }

  const allowedTotal = FREE_QUERIES + ((billing as any).extraQueries || 0);
  const remaining = Math.max(0, allowedTotal - (usage.queryCount || 0));

  return {
    allowed: remaining > 0,
    remaining,
    allowedTotal,
    usageCount: usage.queryCount || 0,
    billing,
    visitorExists
  };
}

export async function incrementVisitorUsage(visitorId: string, metadata?: {
  country?: string;
  device?: string;
  userAgent?: string;
}) {
  try {
    if (!visitorId) return;

    const db = await getDatabase();
    const collection = db.collection<VisitorUsage>('visitors');
    
    const now = new Date();
    
    await collection.updateOne(
      { visitorId },
      {
        $inc: { queryCount: 1 },
        $set: {
          lastSeen: now,
          ...(metadata?.country && { country: metadata.country }),
          ...(metadata?.device && { device: metadata.device }),
          ...(metadata?.userAgent && { userAgent: metadata.userAgent }),
        },
        $setOnInsert: {
          firstSeen: now,
        }
      },
      { upsert: true }
    );
    
    console.log(`✅ Incremented usage for ${visitorId}`);
  } catch (e) {
    console.error('incrementVisitorUsage failed', e);
  }
}

export async function updateBillingData(
  visitorId: string,
  plan: string,
  extraQueries: number,
  activeUntil?: Date,
  unlimited?: boolean
) {
  try {
    if (!visitorId) return;

    const db = await getDatabase();
    const collection = db.collection<BillingData>('billing');
    
    const now = new Date();
    
    await collection.updateOne(
      { visitorId },
      {
        $set: {
          plan,
          extraQueries,
          activeUntil: activeUntil || null,
          unlimited: unlimited || false,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        }
      },
      { upsert: true }
    );
    
    console.log(`✅ Updated billing for ${visitorId}: plan=${plan}, extraQueries=${extraQueries}`);
  } catch (e) {
    console.error('updateBillingData failed', e);
  }
}

export async function sendBillingEmail(toEmail: string, visitorId: string, planId: string, amountLabel = '') {
  try {
    if (!toEmail) return false;
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    if (!host) return false;

    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
    const from = process.env.FROM_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER || `no-reply@${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost'}`;

    const imported = await import('nodemailer').catch(() => null);
    if (!imported) return false;
    const mailer: any = (imported && (imported.default || imported)) as any;
    const transporter = mailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    } as any);

    const mailOptions = {
      from,
      to: toEmail,
      subject: `RepoInfo - Thank you for your purchase!`,
      text: `Thank you for subscribing to ${planId}${amountLabel ? ` (${amountLabel})` : ''}.\n\nYour visitor ID: ${visitorId}\n\nEnjoy unlimited queries!`,
      html: `<p>Thank you for subscribing to <strong>${planId}</strong>${amountLabel ? ` (${amountLabel})` : ''}.</p><p>Your visitor ID: <code>${visitorId}</code></p><p>Enjoy unlimited queries!</p>`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error('sendBillingEmail failed:', e);
    return false;
  }
}

export async function getStripeClient() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(stripeKey, { apiVersion: '2022-11-15' as any });
}

// Export non-async version for compatibility
export function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(stripeKey, { apiVersion: '2022-11-15' as any });
}

// Initialize a new visitor in the database
export async function initVisitor(visitorId: string) {
  try {
    const db = await getDatabase();
    const visitorsCollection = db.collection<VisitorUsage>('visitors');
    const billingCollection = db.collection<BillingData>('billing');
    
    // Initialize visitor usage record
    await visitorsCollection.updateOne(
      { visitorId },
      { 
        $setOnInsert: {
          visitorId,
          queryCount: 0,
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      },
      { upsert: true }
    );
    
    // Initialize billing record
    await billingCollection.updateOne(
      { visitorId },
      { 
        $setOnInsert: {
          visitorId,
          plan: null,
          extraQueries: 0,
          activeUntil: null,
          unlimited: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('📊 initVisitor [MongoDB]: Created visitor', visitorId);
    return true;
  } catch (e) {
    console.error('❌ initVisitor failed:', e);
    return false;
  }
}

// Reset a visitor's usage (for testing only)
export async function resetVisitor(visitorId: string) {
  try {
    const db = await getDatabase();
    const visitorsCollection = db.collection<VisitorUsage>('visitors');
    const billingCollection = db.collection<BillingData>('billing');
    
    // Reset visitor usage to 0
    await visitorsCollection.updateOne(
      { visitorId },
      { 
        $set: {
          queryCount: 0,
          lastSeen: new Date()
        }
      }
    );
    
    // Reset billing to default
    await billingCollection.updateOne(
      { visitorId },
      { 
        $set: {
          plan: null,
          extraQueries: 0,
          activeUntil: null,
          unlimited: false,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('📊 resetVisitor [MongoDB]: Reset visitor', visitorId);
    return true;
  } catch (e) {
    console.error('❌ resetVisitor failed:', e);
    return false;
  }
}

// Grant extra queries to a visitor
export async function grantExtraQueries(visitorId: string, amount: number, setUnlimited = false) {
  try {
    const db = await getDatabase();
    const billingCollection = db.collection<BillingData>('billing');
    
    // Check if document exists
    const existing = await billingCollection.findOne({ visitorId });
    
    if (existing) {
      // Document exists - simple update
      const updateDoc: any = {
        $inc: {
          extraQueries: amount
        },
        $set: {
          updatedAt: new Date()
        }
      };
      
      // Only set unlimited if explicitly requested
      if (setUnlimited) {
        updateDoc.$set.unlimited = true;
      }
      
      await billingCollection.updateOne(
        { visitorId },
        updateDoc
      );
    } else {
      // Document doesn't exist - create with defaults
      await billingCollection.insertOne({
        visitorId,
        plan: null,
        extraQueries: amount,
        activeUntil: null,
        unlimited: setUnlimited,
        blocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('📊 grantExtraQueries [MongoDB]: Granted', amount, 'queries to', visitorId, 'unlimited:', setUnlimited);
    return true;
  } catch (e) {
    console.error('❌ grantExtraQueries failed:', e);
    return false;
  }
}
