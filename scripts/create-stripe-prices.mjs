import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found in project root');
  process.exit(1);
}

const envRaw = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(envRaw.split(/\r?\n/).filter(Boolean).map(line => {
  const i = line.indexOf('=');
  if (i === -1) return [line, ''];
  const key = line.slice(0, i).trim();
  let val = line.slice(i+1).trim();
  // strip optional quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return [key, val];
}));

const secret = env.STRIPE_SECRET_KEY;
if (!secret || secret.startsWith('sk_test_...') || secret === 'sk_test_...') {
  console.error('STRIPE_SECRET_KEY missing or placeholder in .env.local');
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: '2022-11-15' });

(async () => {
  try {
    console.log('Creating products and prices in Stripe...');

    // create monthly product
    const prodMonthly = await stripe.products.create({ name: 'Pro Monthly (from local setup)' });
    const priceMonthly = await stripe.prices.create({
      product: prodMonthly.id,
      unit_amount: 900,
      currency: 'usd',
      recurring: { interval: 'month' }
    });

    // create yearly product
    const prodYearly = await stripe.products.create({ name: 'Pro Yearly (from local setup)' });
    const priceYearly = await stripe.prices.create({
      product: prodYearly.id,
      unit_amount: 9000,
      currency: 'usd',
      recurring: { interval: 'year' }
    });

    console.log('Created prices:');
    console.log('MONTHLY:', priceMonthly.id);
    console.log('YEARLY: ', priceYearly.id);

    // Update .env.local replacing placeholders
    let newEnv = envRaw.replace(/STRIPE_PRICE_PRO_MONTHLY=.*(?:\r?\n|$)/, `STRIPE_PRICE_PRO_MONTHLY=${priceMonthly.id}\n`);
    newEnv = newEnv.replace(/STRIPE_PRICE_PRO_YEARLY=.*(?:\r?\n|$)/, `STRIPE_PRICE_PRO_YEARLY=${priceYearly.id}\n`);

    // If keys not present, append
    if (!/STRIPE_PRICE_PRO_MONTHLY=/.test(envRaw)) newEnv += `STRIPE_PRICE_PRO_MONTHLY=${priceMonthly.id}\n`;
    if (!/STRIPE_PRICE_PRO_YEARLY=/.test(envRaw)) newEnv += `STRIPE_PRICE_PRO_YEARLY=${priceYearly.id}\n`;

    fs.writeFileSync(envPath, newEnv, 'utf8');
    console.log('.env.local updated with new price IDs. Please restart your dev server.');
  } catch (err) {
    console.error('Failed to create prices:', err);
    process.exit(1);
  }
})();
