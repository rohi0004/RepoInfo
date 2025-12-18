<div align="center">

# 🧠 RepoInfo

### Unlock Any Codebase with AI-Powered Insights

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-repoinfo.onrender.com-70ddb5?style=for-the-badge)](https://repoinfo.onrender.com/)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<img src="https://img.shields.io/badge/AI_Powered-Gemini_&_OpenRouter-8A2BE2?style=for-the-badge" alt="AI Powered" />
<img src="https://img.shields.io/badge/PWA-Enabled-FF6F00?style=for-the-badge" alt="PWA" />
<img src="https://img.shields.io/badge/CAG-Context_Augmented_Generation-70ddb5?style=for-the-badge" alt="CAG" />

<br/>
<br/>

**RepoInfo** is an intelligent repository analysis platform that leverages **Context Augmented Generation (CAG)** to help developers understand codebases, analyze dependencies, and get instant insights through AI-powered conversations.

[🚀 Live Demo](https://repoinfo.onrender.com/) • [📖 Documentation](#-documentation) • [🎯 Features](#-features) • [⚡ Quick Start](#-quick-start)

<br/>

![GitHub stars](https://img.shields.io/github/stars/rohi0004/RepoInfo?style=social)
![GitHub forks](https://img.shields.io/github/forks/rohi0004/RepoInfo?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/rohi0004/RepoInfo?style=social)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 What Makes RepoInfo Different](#-what-makes-repoinfo-different)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [💳 Stripe Payment Integration](#-stripe-payment-integration)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [📊 Key Capabilities](#-key-capabilities)
- [🤝 Contributing](#-contributing)
- [👨‍💻 Developer](#-developer)
- [📜 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🔍 **Intelligent Code Analysis**
- 📊 Repository structure visualization
- 🔗 Dependency tree analysis
- 📈 Code quality metrics
- 🏗️ Architecture insights
- 📦 Package and module breakdown
- 🔄 Real-time analysis updates

</td>
<td width="50%" valign="top">

### 🤖 **AI-Powered Chat**
- 💬 Natural language code queries
- 🧠 Context-aware responses
- 📝 Code explanation & documentation
- 🎯 Smart suggestions
- 🔄 Streaming responses
- 💾 Conversation history

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🛡️ **Security Scanning**
- 🔒 Vulnerability detection
- ⚠️ Security risk assessment
- 🚨 Real-time alerts
- 📋 Comprehensive security reports
- 🔐 Best practices recommendations
- 🎯 Automated security audits

</td>
<td width="50%" valign="top">

### 📊 **Visual Analytics**
- 📉 Interactive diagrams (Mermaid)
- 🎨 Syntax-highlighted code blocks
- 🌳 File tree navigation
- 📸 Export & share insights
- 🎭 Dark/Light theme support
- 📱 Responsive design

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ⚡ **Performance & Caching**
- 💾 Redis/MongoDB caching
- 🚀 1M+ token context window
- ⚡ Lightning-fast responses
- 🔄 Smart cache invalidation
- 📊 KV caching for context
- 🎯 Optimized queries

</td>
<td width="50%" valign="top">

### 💳 **Billing & Admin**
- 💰 Stripe integration
- 📊 Usage analytics
- 👥 User management
- 🎫 Subscription plans
- 📈 Admin dashboard
- 📧 Email notifications

</td>
</tr>
</table>

---

## 🎯 What Makes RepoInfo Different

### **Context Augmented Generation (CAG) vs Traditional RAG**

RepoInfo doesn't just retrieve code fragments — it understands the **entire context** of your codebase.

<table>
<tr>
<th width="50%">❌ Traditional RAG</th>
<th width="50%">✅ RepoInfo (CAG)</th>
</tr>
<tr>
<td valign="top">

**Fragmented Context**
- Chops code into small, disconnected vector chunks
- Loses relationships between functions
- Misses the big picture

</td>
<td valign="top">

**Full File Context**
- Loads entire relevant files into 1M+ token window
- Preserves all relationships and dependencies
- Understands the complete architecture

</td>
</tr>
<tr>
<td valign="top">

**Similarity Search**
- Relies on fuzzy vector matching
- Often misses critical logic
- Returns irrelevant results

</td>
<td valign="top">

**Smart Agent Selection**
- AI intelligently picks files based on dependency graphs
- Uses AST parsing for accurate analysis
- Returns precisely what you need

</td>
</tr>
<tr>
<td valign="top">

**Stateless**
- Forgets everything after each query
- No conversation memory
- Repetitive context loading

</td>
<td valign="top">

**KV Caching**
- Remembers context across conversations
- Instant follow-up answers
- Efficient token usage

</td>
</tr>
</table>

### 🎬 How It Works

<div align="center">

```mermaid
graph TB
    A[👤 User enters GitHub URL] --> B[📥 Fetch Repository Data]
    B --> C[🔍 Parse & Analyze Structure]
    C --> D[🧠 Build Dependency Graph]
    D --> E[💾 Cache in MongoDB/Redis]
    E --> F[🤖 AI Processes with CAG]
    F --> G[💬 Interactive Chat Interface]
    G --> H{User Query}
    H --> I[🎯 Smart File Selection]
    I --> J[📊 Full Context Analysis]
    J --> K[✨ Generate Response]
    K --> G
    G --> L[📤 Export Reports]
    
    style A fill:#70ddb5,stroke:#333,stroke-width:3px,color:#000
    style F fill:#8A2BE2,stroke:#333,stroke-width:3px,color:#fff
    style K fill:#3b82f6,stroke:#333,stroke-width:3px,color:#fff
    style L fill:#70ddb5,stroke:#333,stroke-width:3px,color:#000
```

</div>

**Step-by-Step Process:**

1. **📥 Input**: Enter any GitHub repository URL (e.g., `owner/repo` or full URL)
2. **🔍 Analysis**: AI analyzes code structure, dependencies, and architecture patterns
3. **🧠 Processing**: CAG builds comprehensive context with full file contents
4. **💬 Interaction**: Ask questions in natural language about the codebase
5. **✨ Insights**: Receive detailed explanations, diagrams, and recommendations
6. **📤 Export**: Download reports, share insights, or save for later

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **MongoDB** (local installation or cloud instance)
- **Redis** (optional, for enhanced caching)
- **Git** for version control

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/rohi0004/RepoInfo.git
cd RepoInfo

# 2️⃣ Install dependencies
npm install
# or
yarn install

# 3️⃣ Set up environment variables
cp .env.example .env.local

# 4️⃣ Edit .env.local with your API keys
nano .env.local  # or use your favorite editor

# 5️⃣ Run the development server
npm run dev
# or
yarn dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser to see the app! 🎉

### First-Time Setup

After installation, you'll need to:

1. **Get API Keys** (see [Configuration](#-configuration) section)
2. **Set up MongoDB** (local or cloud)
3. **Configure environment variables**
4. **Run database migrations** (if needed)

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with these variables:

```env
# ═══════════════════════════════════════
# 🔑 AI & API KEYS (REQUIRED)
# ═══════════════════════════════════════

# Google Gemini API (CRITICAL - Main AI model)
# Get from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter API (Optional - For alternative models)
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_key_here

# ═══════════════════════════════════════
# 🐙 GITHUB API
# ═══════════════════════════════════════

# GitHub Personal Access Token
# Get from: https://github.com/settings/tokens
# Increases rate limit from 60 to 5000 requests/hour
GITHUB_TOKEN=ghp_your_github_token_here

# ═══════════════════════════════════════
# 🗄️ DATABASE CONFIGURATION
# ═══════════════════════════════════════

# MongoDB Connection URI
# Local: mongodb://localhost:27017/repoinfo
# Cloud: mongodb+srv://user:pass@cluster.mongodb.net/repoinfo
MONGODB_URI=mongodb://localhost:27017/repoinfo
MONGODB_DB_NAME=repoinfo

# ═══════════════════════════════════════
# 💾 CACHE & STORAGE (OPTIONAL)
# ═══════════════════════════════════════

# Redis URL (for enhanced caching)
REDIS_URL=redis://localhost:6379

# Vercel KV (alternative to Redis)
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# ═══════════════════════════════════════
# 💳 STRIPE BILLING (OPTIONAL)
# ═══════════════════════════════════════

# Stripe API Keys - Get from: https://dashboard.stripe.com/
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create products in Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# ═══════════════════════════════════════
# 🌐 APPLICATION SETTINGS
# ═══════════════════════════════════════

# Application URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 🔑 Getting Your API Keys

<table>
<tr>
<th>Service</th>
<th>URL</th>
<th>Purpose</th>
</tr>
<tr>
<td>🧠 <strong>Gemini API</strong></td>
<td><a href="https://aistudio.google.com/apikey">Google AI Studio</a></td>
<td>Main AI model for code analysis</td>
</tr>
<tr>
<td>🐙 <strong>GitHub Token</strong></td>
<td><a href="https://github.com/settings/tokens">GitHub Settings</a></td>
<td>Access repositories & increase rate limits</td>
</tr>
<tr>
<td>🔀 <strong>OpenRouter</strong></td>
<td><a href="https://openrouter.ai/keys">OpenRouter Dashboard</a></td>
<td>Alternative AI models routing</td>
</tr>
<tr>
<td>💳 <strong>Stripe</strong></td>
<td><a href="https://dashboard.stripe.com/">Stripe Dashboard</a></td>
<td>Payment processing for subscriptions</td>
</tr>
</table>

---

## 💳 Stripe Payment Integration

RepoInfo includes a **complete subscription billing system** powered by Stripe, allowing users to upgrade from free tier to Pro plans with unlimited queries.

### 💰 Subscription Plans

<table>
<tr>
<th width="25%">Plan</th>
<th width="25%">Price</th>
<th width="25%">Queries</th>
<th width="25%">Features</th>
</tr>
<tr>
<td><strong>🆓 Free</strong></td>
<td>$0/month</td>
<td>5 queries/visitor</td>
<td>
• Basic code analysis<br/>
• Repository insights<br/>
• Limited AI chat<br/>
• Public repositories
</td>
</tr>
<tr>
<td><strong>⭐ Pro Monthly</strong></td>
<td>$9.99/month</td>
<td>♾️ Unlimited</td>
<td>
• Everything in Free<br/>
• Unlimited queries<br/>
• Priority support<br/>
• Advanced analytics<br/>
• Private repositories
</td>
</tr>
<tr>
<td><strong>🚀 Pro Yearly</strong></td>
<td>$99/year</td>
<td>♾️ Unlimited</td>
<td>
• Everything in Pro<br/>
• <strong>2 months free</strong><br/>
• Best value<br/>
• Early access features
</td>
</tr>
</table>

### 🏗️ Architecture Overview

The billing system uses:

```mermaid
graph LR
    A[User] --> B[Pricing Page]
    B --> C[Stripe Checkout]
    C --> D[Payment Success]
    D --> E[Webhook Handler]
    E --> F[MongoDB]
    F --> G[Update Billing Status]
    G --> H[Unlock Unlimited]
    
    style C fill:#635BFF,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#00D924,stroke:#333,stroke-width:2px,color:#000
    style H fill:#70ddb5,stroke:#333,stroke-width:2px,color:#000
```

### 📁 Billing Implementation

#### **Core Files**

```
src/
├── lib/
│   └── billing-mongodb.ts          # Billing logic & Stripe integration
│       ├── getVisitorUsage()       # Track query counts
│       ├── getBillingData()        # Get subscription status
│       ├── checkAllowance()        # Verify if user can query
│       ├── incrementUsage()        # Track usage
│       └── grantUnlimitedAccess()  # Activate Pro plan
│
├── app/
│   ├── pricing/
│   │   └── page.tsx                # Pricing page with plans
│   │
│   ├── billing/
│   │   └── success/
│   │       └── page.tsx            # Post-checkout success page
│   │
│   └── api/
│       └── billing/
│           ├── create-checkout/
│           │   └── route.ts        # Create Stripe session
│           ├── webhook/
│           │   └── route.ts        # Handle Stripe events
│           └── check/
│               └── route.ts        # Check subscription status
```

#### **Key Components**

**1. Billing Logic (`src/lib/billing-mongodb.ts`)**

```typescript
// Track visitor usage
export async function getVisitorUsage(visitorId: string) {
  const db = await getDatabase();
  const visitor = await db.collection('visitors').findOne({ visitorId });
  return { queryCount: visitor?.queryCount || 0, exists: !!visitor };
}

// Get billing/subscription data
export async function getBillingData(visitorId: string) {
  const db = await getDatabase();
  const billing = await db.collection('billing').findOne({ visitorId });
  return {
    plan: billing?.plan || null,
    unlimited: billing?.unlimited || false,
    blocked: billing?.blocked || false,
    activeUntil: billing?.activeUntil
  };
}

// Check if user can make queries
export async function checkAllowance(visitorId: string) {
  const usage = await getVisitorUsage(visitorId);
  const billing = await getBillingData(visitorId);
  
  // Pro users have unlimited access
  if (billing.unlimited) {
    return { allowed: true, remaining: Infinity };
  }
  
  // Free tier: 5 queries per visitor
  const FREE_QUERIES = 5;
  const remaining = Math.max(0, FREE_QUERIES - usage.queryCount);
  return { allowed: remaining > 0, remaining };
}
```

**2. Stripe Checkout (`src/app/api/billing/create-checkout/route.ts`)**

```typescript
export async function POST(req: Request) {
  const { planId, visitorId } = await req.json();
  
  // Map plan to Stripe price ID
  const PRICE_MAP = {
    'pro_monthly': process.env.STRIPE_PRICE_PRO_MONTHLY,
    'pro_yearly': process.env.STRIPE_PRICE_PRO_YEARLY,
  };
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_MAP[planId], quantity: 1 }],
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing/success?checkout=cancel`,
    metadata: { visitorId, planId }
  });
  
  return NextResponse.json({ url: session.url });
}
```

**3. Webhook Handler (`src/app/api/billing/webhook/route.ts`)**

```typescript
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await grantUnlimitedAccess(session.metadata.visitorId, 'pro');
      break;
      
    case 'customer.subscription.deleted':
      await revokeAccess(visitorId);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

### 🔧 Setup Instructions

#### **1. Create Stripe Account**

1. Sign up at [stripe.com](https://stripe.com)
2. Go to **Developers** → **API keys**
3. Copy **Secret key** and **Publishable key**

#### **2. Create Products & Prices**

```bash
# Using Stripe CLI (recommended)
stripe products create --name="RepoInfo Pro Monthly" --description="Unlimited queries"
stripe prices create --product=prod_xxx --currency=usd --unit-amount=999 --recurring[interval]=month

# Or create via Stripe Dashboard:
# 1. Go to Products → Add Product
# 2. Name: "RepoInfo Pro Monthly"
# 3. Price: $9.99/month recurring
# 4. Copy the Price ID (starts with price_...)
```

#### **3. Configure Environment Variables**

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_51...  # From Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_test_51...  # From Stripe Dashboard

# Price IDs (from Products page)
STRIPE_PRICE_PRO_MONTHLY=price_1...  # Monthly plan price ID
STRIPE_PRICE_PRO_YEARLY=price_1...   # Yearly plan price ID

# Webhook Secret (created in step 4)
STRIPE_WEBHOOK_SECRET=whsec_...  # From Webhooks page
```

#### **4. Configure Webhooks**

**For Local Development:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/billing/webhook

# Copy the webhook signing secret (whsec_...) to .env.local
```

**For Production (Render):**

1. Deploy your app to Render first
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. **Endpoint URL**: `https://your-app.onrender.com/api/billing/webhook`
5. **Select events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_...`)
8. Add to Render Environment: `STRIPE_WEBHOOK_SECRET=whsec_...`

#### **5. Test Payment Flow**

```bash
# Start development server
npm run dev

# Start Stripe webhook forwarding (in another terminal)
stripe listen --forward-to localhost:3000/api/billing/webhook

# Test with Stripe test cards:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# 3D Secure: 4000 0027 6000 3184
```

**Test Flow:**
1. Go to `http://localhost:3000/pricing`
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete checkout
6. Check webhook logs for `checkout.session.completed`
7. Verify unlimited access granted in MongoDB

### 📊 Database Schema

**Visitors Collection:**
```javascript
{
  visitorId: "fp_abc123",  // Browser fingerprint
  queryCount: 3,           // Number of queries made
  firstSeen: ISODate(),
  lastSeen: ISODate(),
  country: "US",
  device: "desktop"
}
```

**Billing Collection:**
```javascript
{
  visitorId: "fp_abc123",
  plan: "pro_monthly",           // Subscription plan
  unlimited: true,               // Has unlimited access
  blocked: false,                // Account blocked?
  activeUntil: ISODate(),        // Subscription end date
  stripeCustomerId: "cus_...",   // Stripe customer ID
  stripeSubscriptionId: "sub_...", // Stripe subscription ID
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

### 🔐 Security Features

- ✅ **Webhook Signature Verification**: All webhooks are verified using Stripe signatures
- ✅ **Environment Variable Protection**: API keys never exposed to client
- ✅ **Visitor ID Tracking**: Uses browser fingerprinting (FingerprintJS)
- ✅ **MongoDB Indexes**: Optimized queries with unique indexes
- ✅ **Rate Limiting**: Prevents abuse of free tier
- ✅ **Idempotency**: Webhook events handled idempotently

### 🧪 Testing Scripts

Test the billing system:

```bash
# Test Stripe connection
node scripts/test-stripe.js

# Grant unlimited access manually
node scripts/grant-unlimited.js <visitorId>

# Check billing status
node scripts/check-billing.js <visitorId>

# Clear test data
node scripts/clear-test-billing.js
```

### 📈 Usage Tracking

Every AI query increments the usage counter:

```typescript
// Before processing query
const allowance = await checkAllowance(visitorId);

if (!allowance.allowed) {
  return NextResponse.json({
    error: 'Query limit reached',
    remaining: 0,
    upgrade_url: '/pricing'
  }, { status: 429 });
}

// Process query...

// Increment usage counter
await incrementUsage(visitorId);
```

### 💡 Key Features

- **Automatic Subscription Management**: Stripe handles recurring billing
- **Instant Activation**: Access granted immediately after payment
- **Grace Period**: Subscriptions remain active until period end
- **Automatic Renewals**: Stripe handles renewal payments
- **Cancellation Support**: Users can cancel anytime (access until period end)
- **Usage Analytics**: Track queries per user in MongoDB
- **Admin Dashboard**: Manage users at `/admin/database`

### 🎯 Revenue Analytics

Track revenue in the admin dashboard:
- Monthly Recurring Revenue (MRR)
- Active subscriptions count
- Churn rate
- Average Revenue Per User (ARPU)

Access at: `https://your-app.onrender.com/admin/stats`

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to run RepoInfo with all dependencies:

```bash
# 1️⃣ Make sure Docker and Docker Compose are installed
docker --version
docker-compose --version

# 2️⃣ Clone and navigate to the repository
git clone https://github.com/rohi0004/RepoInfo.git
cd RepoInfo

# 3️⃣ Create .env file with your API keys
cp .env.example .env
nano .env  # Add your API keys

# 4️⃣ Build and start all services
docker-compose up -d

# 5️⃣ View logs
docker-compose logs -f

# 6️⃣ Stop all services
docker-compose down
```

The `docker-compose.yml` includes:
- ✅ Next.js application
- ✅ MongoDB database
- ✅ Redis cache
- ✅ Automatic networking

### Manual Docker Build

```bash
# Build the Docker image
docker build -t repoinfo:latest .

# Run the container
docker run -d \
  --name repoinfo \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e GITHUB_TOKEN=your_token \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/repoinfo \
  repoinfo:latest

# View logs
docker logs -f repoinfo

# Stop and remove
docker stop repoinfo
docker rm repoinfo
```

---

## ☁️ Cloud Deployment

### Deploy to Render (Recommended & Primary Platform)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**RepoInfo is specifically optimized for Render.com deployment** with a custom `render.yaml` Blueprint and `Dockerfile.render` configuration.

#### 🎯 Why Render?

- ✅ **Complete Blueprint**: Auto-configures web service, MongoDB, and Redis
- ✅ **Docker-based**: Uses optimized multi-stage build (`Dockerfile.render`)
- ✅ **Free Tier**: 1GB MongoDB + 25MB Redis + web service included
- ✅ **Auto-linking**: Services automatically connect via environment variables
- ✅ **Zero Config**: Just connect GitHub and deploy

#### 📋 What `render.yaml` Does

Your `render.yaml` Blueprint automatically provisions:

```yaml
# 1. Web Service (Next.js app)
- Docker build using Dockerfile.render
- Auto-configured PORT and production environment
- Connected to MongoDB and Redis

# 2. MongoDB Database
- Free 1GB storage
- Auto-generated connection string
- Injected as MONGODB_URI environment variable

# 3. Redis Cache
- Free 25MB cache
- Auto-generated connection string
- Injected as REDIS_URL environment variable
```

#### 🚀 Deployment Steps

**1. Fork & Connect Repository**
```bash
# Fork the repository on GitHub
# Then go to render.com
```

**2. Create New Blueprint**
- Go to [render.com](https://render.com) and sign up
- Click **"New +"** → **"Blueprint"**
- Connect your GitHub account
- Select repository: `YOUR_USERNAME/RepoInfo`
- Render detects `render.yaml` automatically

**3. Configure Environment Variables**

Render will create all services but you **MUST** add these secret keys:

| Variable | Required | Get From | Purpose |
|----------|----------|----------|----------|
| `GEMINI_API_KEY` | ✅ **CRITICAL** | [Google AI Studio](https://aistudio.google.com/apikey) | Main AI model - app won't work without this |
| `GITHUB_TOKEN` | ⚠️ Recommended | [GitHub Settings](https://github.com/settings/tokens) | Increases rate limit to 5000/hour |
| `OPENROUTER_API_KEY` | ❌ Optional | [OpenRouter](https://openrouter.ai/keys) | Alternative AI models |
| `STRIPE_SECRET_KEY` | 💳 If using billing | [Stripe Dashboard](https://dashboard.stripe.com/) | Payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE` | 💳 If using billing | Stripe Dashboard | Client-side Stripe |
| `STRIPE_WEBHOOK_SECRET` | 💳 If using billing | Stripe Webhooks | Webhook verification |
| `STRIPE_PRICE_PRO_MONTHLY` | 💳 If using billing | Stripe Products | Monthly subscription |
| `STRIPE_PRICE_PRO_YEARLY` | 💳 If using billing | Stripe Products | Yearly subscription |

**Note**: `MONGODB_URI`, `REDIS_URL`, `NEXT_PUBLIC_APP_URL`, and `PORT` are **auto-configured** by `render.yaml`

**4. Set Environment Variables**
- Go to your Render dashboard
- Select the `repoinfo` web service
- Click **"Environment"** tab
- Add each required variable
- Click **"Save Changes"**
- Render automatically redeploys

**5. Configure Stripe Webhooks** (if using billing)

After deployment:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://YOUR-APP-NAME.onrender.com/api/billing/webhook`
4. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **signing secret** (starts with `whsec_...`)
6. Add to Render: `STRIPE_WEBHOOK_SECRET=whsec_...`

**6. Verify Deployment**
```bash
# Check health endpoint
curl https://YOUR-APP-NAME.onrender.com/api/health

# Should return:
# {"hasGemini": true, "hasGithubToken": true, ...}
```

#### 🏗️ How Dockerfile.render Works

The custom `Dockerfile.render` uses a **multi-stage build** for optimization:

```dockerfile
# Stage 1: Builder
- Installs all dependencies
- Builds Next.js app
- Creates optimized production bundle

# Stage 2: Production
- Uses Alpine Linux (minimal footprint)
- Only production dependencies
- Copies built assets from builder
- Exposes PORT from environment
- Starts with npm start
```

#### ⚡ Performance on Render

| Metric | Free Tier | Paid Tier |
|--------|-----------|------------|
| Cold Start | ~30-45s | ~5-10s |
| Active Response | <500ms | <200ms |
| Sleep After | 15 min idle | Never |
| Monthly Hours | 750h free | Unlimited |
| Bandwidth | 100GB | Unlimited |

#### 🔧 Common Issues & Solutions

**502 Bad Gateway Error**
```
Cause: Missing GEMINI_API_KEY
Solution: Add GEMINI_API_KEY in Render Environment tab
Verify: Check /api/health endpoint
```

**App Sleeps (Slow First Load)**
```
Cause: Free tier sleeps after 15 minutes
Solution: Accept ~30s cold start OR upgrade to paid tier
Workaround: Use uptime monitoring (Uptime Robot)
```

**MongoDB Connection Failed**
```
Cause: Database service not started
Solution: Check Render dashboard → Databases
Verify: All services show "Live" status
```

**Environment Variables Not Working**
```
Cause: Variables set but app not redeployed
Solution: Manual Deploy → Clear build cache → Deploy
```

See `DEPLOYMENT.md` for complete troubleshooting guide.

---

### Alternative: Deploy to Vercel

**Note**: Vercel deployment requires manual MongoDB and Redis setup. Render is recommended for easier deployment.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add GITHUB_TOKEN
vercel env add MONGODB_URI  # Must setup MongoDB Atlas separately
vercel env add REDIS_URL    # Must setup Upstash Redis separately

# Deploy to production
vercel --prod
```

**Additional Setup Required for Vercel**:
- Manual MongoDB Atlas setup and connection string
- Manual Upstash Redis setup and connection string
- Configure build settings in `vercel.json`
- No auto-provisioned database

### Other Platforms

- **Railway**: See `railway.toml` (requires manual setup)
- **Fly.io**: See `fly.toml` (requires manual setup)
- **Netlify**: See `netlify.toml` (limited to static/serverless)

---

## 🛠️ Tech Stack

<div align="center">

### **Frontend Technologies**

![Next.js](https://img.shields.io/badge/-Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

### **Backend & AI**

![Node.js](https://img.shields.io/badge/-Node.js_20-339933?style=flat-square&logo=node.js&logoColor=white)
![Google Gemini](https://img.shields.io/badge/-Google_Gemini-8A2BE2?style=flat-square&logo=google&logoColor=white)
![OpenRouter](https://img.shields.io/badge/-OpenRouter-FF6B6B?style=flat-square&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB_7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/-Redis_5-DC382D?style=flat-square&logo=redis&logoColor=white)
![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat-square&logoColor=white)

### **DevOps & Tools**

![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)
![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Stripe](https://img.shields.io/badge/-Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white)
![PWA](https://img.shields.io/badge/-PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

### **UI & Utilities**

![Lucide Icons](https://img.shields.io/badge/-Lucide_Icons-F56565?style=flat-square&logoColor=white)
![Mermaid](https://img.shields.io/badge/-Mermaid_Diagrams-FF3670?style=flat-square&logo=mermaid&logoColor=white)
![React Markdown](https://img.shields.io/badge/-React_Markdown-000000?style=flat-square&logo=markdown&logoColor=white)
![html2canvas](https://img.shields.io/badge/-html2canvas-E44D26?style=flat-square&logoColor=white)
![Sonner](https://img.shields.io/badge/-Sonner_Toast-FFA500?style=flat-square&logoColor=white)

</div>

---

## 📂 Project Structure

```
RepoInfo/
├── 📱 src/                          # Source code
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout
│   │   ├── actions.ts             # Server actions
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── api/                   # API routes
│   │   │   ├── admin/            # Admin endpoints
│   │   │   ├── billing/          # Stripe webhooks
│   │   │   ├── chat/             # Chat streaming
│   │   │   └── ...               # Other APIs
│   │   │
│   │   ├── chat/                  # Chat interface page
│   │   ├── billing/               # Billing pages
│   │   ├── pricing/               # Pricing page
│   │   └── admin/                 # Admin dashboard
│   │
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx     # Main chat UI
│   │   ├── ChatInput.tsx         # Message input
│   │   ├── RepoLoader.tsx        # Repository loader
│   │   ├── RepoSidebar.tsx       # File explorer
│   │   ├── ModelSelector.tsx     # AI model picker
│   │   ├── Mermaid.tsx           # Diagram renderer
│   │   ├── CodeBlock.tsx         # Code highlighting
│   │   ├── EnhancedMarkdown.tsx  # Markdown renderer
│   │   ├── CAGComparison.tsx     # CAG vs RAG section
│   │   └── ...                   # More components
│   │
│   └── lib/                       # Utilities & helpers
│       ├── gemini.ts             # Gemini AI integration
│       ├── openrouter.ts         # OpenRouter integration
│       ├── github.ts             # GitHub API client
│       ├── mongodb.ts            # MongoDB connection
│       ├── billing-mongodb.ts    # Billing logic
│       ├── cache.ts              # Redis caching
│       └── ...                   # More utilities
│
├── 🖥️ server/                      # Express server (optional)
│   ├── index.js                   # Server entry point
│   └── routes/                    # API endpoints
│
├── 📜 scripts/                     # Utility scripts
│   ├── test-mongodb.js           # DB connection test
│   ├── test-gemini.js            # AI test
│   └── ...                       # More scripts
│
├── 🌐 public/                      # Static assets
│   ├── manifest.json             # PWA manifest
│   └── assets/                   # Images, icons
│
├── 🐳 Docker files
│   ├── Dockerfile                # Production build
│   ├── Dockerfile.render         # Render deployment
│   └── docker-compose.yml        # Multi-container setup
│
├── ☁️ Deployment configs
│   ├── render.yaml               # Render Blueprint
│   ├── railway.toml              # Railway config
│   ├── fly.toml                  # Fly.io config
│   └── netlify.toml              # Netlify config
│
├── 📋 Configuration files
│   ├── next.config.ts            # Next.js config
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.mjs       # Tailwind config
│   ├── eslint.config.mjs         # ESLint rules
│   └── postcss.config.cjs        # PostCSS config
│
└── 📦 Package files
    ├── package.json              # Dependencies
    └── package-lock.json         # Lock file
```

---

## 📊 Key Capabilities

<table>
<thead>
<tr>
<th>Feature</th>
<th>Description</th>
<th>Status</th>
<th>Free Tier</th>
</tr>
</thead>
<tbody>
<tr>
<td>🔍 <strong>Code Analysis</strong></td>
<td>Deep dive into repository structure, dependencies, and architecture</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>🤖 <strong>AI Chat</strong></td>
<td>Conversational code assistant with context awareness</td>
<td>✅ Active</td>
<td>⚠️ Limited</td>
</tr>
<tr>
<td>📈 <strong>Quality Metrics</strong></td>
<td>Code quality assessment with actionable insights</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>🛡️ <strong>Security Scan</strong></td>
<td>Vulnerability detection and security best practices</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>📊 <strong>Diagrams</strong></td>
<td>Visual architecture representation with Mermaid</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>💾 <strong>Caching</strong></td>
<td>Fast repeated queries with Redis/MongoDB caching</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>🌐 <strong>PWA</strong></td>
<td>Installable progressive web app with offline support</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>💳 <strong>Billing</strong></td>
<td>Stripe integration for Pro subscriptions</td>
<td>✅ Active</td>
<td>❌ No</td>
</tr>
<tr>
<td>🎨 <strong>Themes</strong></td>
<td>Beautiful dark and light mode with smooth transitions</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
<tr>
<td>📱 <strong>Mobile</strong></td>
<td>Fully responsive design for all devices</td>
<td>✅ Active</td>
<td>✅ Yes</td>
</tr>
</tbody>
</table>

---

## 🎯 Use Cases

<table>
<tr>
<td width="50%">

### 👨‍💻 For Developers

- 🔍 **Onboarding**: Quickly understand new codebases
- 📚 **Learning**: Explore open-source projects interactively
- 🐛 **Debugging**: Find issues with AI-powered analysis
- 📝 **Documentation**: Auto-generate code documentation
- 🔄 **Refactoring**: Get refactoring suggestions

</td>
<td width="50%">

### 👔 For Teams

- 🤝 **Code Reviews**: Automated review assistance
- 📊 **Quality Metrics**: Track code quality over time
- 🛡️ **Security**: Continuous vulnerability scanning
- 📈 **Analytics**: Team productivity insights
- 🎯 **Best Practices**: Enforce coding standards

</td>
</tr>
<tr>
<td width="50%">

### 🎓 For Students

- 📖 **Learn**: Understand complex projects
- 💡 **Assignments**: Get help with coursework
- 🔬 **Research**: Analyze software patterns
- 🏆 **Projects**: Build better applications
- 👥 **Collaboration**: Team project analysis

</td>
<td width="50%">

### 🏢 For Enterprises

- 🔐 **Compliance**: Security audit automation
- 📊 **Reporting**: Detailed analysis reports
- 🎯 **Migration**: Legacy code understanding
- ⚡ **Optimization**: Performance improvements
- 🔄 **Integration**: API access for workflows

</td>
</tr>
</table>

---

## 💡 Example Queries

Here are some example questions you can ask RepoInfo:

```markdown
# Architecture Questions
"What is the overall architecture of this project?"
"How are the components organized?"
"Show me the dependency graph"

# Code Understanding
"Explain how authentication works in this app"
"What does the ChatInterface component do?"
"How is the database connection established?"

# Security
"Are there any security vulnerabilities?"
"Check for exposed API keys"
"Audit the authentication system"

# Quality
"What are the code quality metrics?"
"Find duplicate code"
"Suggest performance improvements"

# Specific Files
"Explain the gemini.ts file"
"What endpoints are in the API folder?"
"Show me all database models"
```

---

## 🔒 Security

RepoInfo takes security seriously:

- 🔐 **API Key Protection**: Environment variables are never exposed
- 🛡️ **Input Validation**: All user inputs are sanitized
- 🚫 **Rate Limiting**: Prevents API abuse
- 🔒 **Secure Storage**: MongoDB with encryption at rest
- 🌐 **HTTPS Only**: All production traffic is encrypted
- 🔍 **Security Scanning**: Automated vulnerability detection

---

## 🚀 Performance

RepoInfo is optimized for speed and efficiency:

| Metric | Performance | Notes |
|--------|-------------|-------|
| ⚡ **First Load** | < 2s | With caching |
| 🔄 **Streaming** | Real-time | Sub-second latency |
| 💾 **Cache Hit Rate** | > 80% | For repeated queries |
| 🧠 **Token Usage** | 1M+ context | Gemini 2.0 Flash |
| 📊 **API Response** | < 500ms | Average response time |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: [Open an issue](https://github.com/rohi0004/RepoInfo/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/rohi0004/RepoInfo/discussions)
- 📝 **Documentation**: Improve docs and examples
- 🔧 **Code**: Fix bugs or add features
- 🎨 **Design**: Improve UI/UX

### Development Workflow

```bash
# 1️⃣ Fork the repository on GitHub
# 2️⃣ Clone your fork
git clone https://github.com/YOUR_USERNAME/RepoInfo.git
cd RepoInfo

# 3️⃣ Create a feature branch
git checkout -b feature/amazing-feature

# 4️⃣ Make your changes and commit
git add .
git commit -m "✨ Add amazing feature"

# 5️⃣ Push to your fork
git push origin feature/amazing-feature

# 6️⃣ Open a Pull Request on GitHub
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
✨ feat: Add new feature
🐛 fix: Fix a bug
📝 docs: Update documentation
💄 style: UI/styling changes
♻️ refactor: Code refactoring
⚡ perf: Performance improvements
✅ test: Add tests
🔧 chore: Maintenance tasks
```

---

## 📜 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License

Copyright (c) 2025 Rohit Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Developer

<div align="center">

<img src="https://github.com/rohi0004.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #70ddb5;" alt="Rohit Kumar" />

### **Rohit Kumar**

_Full-stack developer passionate about building intelligent tools that help developers write better code._

<br/>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rohi0004/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rohi0004)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sahrohitkumar10@gmail.com)

<br/>

**Skills & Expertise:**

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![AI/ML](https://img.shields.io/badge/-AI%2FML-8A2BE2?style=flat-square)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 🙏 Acknowledgments

Special thanks to:

- 🧠 **[Google Gemini](https://ai.google.dev/)** - For powerful AI capabilities
- 🔀 **[OpenRouter](https://openrouter.ai/)** - For AI model routing
- 📊 **[Mermaid.js](https://mermaid.js.org/)** - For beautiful diagrams
- ⚡ **[Next.js Team](https://nextjs.org/)** - For the amazing framework
- 🎨 **[Tailwind CSS](https://tailwindcss.com/)** - For utility-first styling
- 🐙 **[GitHub](https://github.com/)** - For hosting and API access
- 🗄️ **[MongoDB](https://www.mongodb.com/)** - For flexible database
- 💾 **[Redis](https://redis.io/)** - For fast caching
- 💳 **[Stripe](https://stripe.com/)** - For payment processing

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/rohi0004/RepoInfo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/rohi0004/RepoInfo/discussions)
- 📧 **Email**: [sahrohitkumar10@gmail.com](mailto:sahrohitkumar10@gmail.com)

---

## ⭐ Show Your Support

If you find **RepoInfo** helpful, please consider:

- ⭐ **Starring** the repository on GitHub
- 🔀 **Forking** it to contribute
- 📢 **Sharing** it with other developers
- 💬 **Giving feedback** via issues or discussions

<div align="center">

### Made with ❤️ and ☕ by [Rohit Kumar](https://github.com/rohi0004)

**RepoInfo** © 2025 | All Rights Reserved

---

**🌟 Star us on GitHub — it motivates us to keep improving! 🌟**

</div>
