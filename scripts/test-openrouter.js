#!/usr/bin/env node

// Test OpenRouter API connection
const OpenAI = require('openai');

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: OPENROUTER_API_KEY environment variable not set');
  process.exit(1);
}

console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...`);

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "RepoInfo Test",
  },
});

const models = [
  'kwaipilot/kat-coder-pro:free',
  'openai/gpt-3.5-turbo',
];

async function testModel(modelName) {
  console.log(`\n🧪 Testing model: ${modelName}`);
  try {
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user",
          content: "Say 'Hello' in one word.",
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log(`   ✓ Response: ${response}`);
    console.log(`   ✅ SUCCESS! Use this model name: ${modelName}`);
    return true;
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  for (const model of models) {
    const success = await testModel(model);
    if (success) break;
  }
}

main();
