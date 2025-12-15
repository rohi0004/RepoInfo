#!/usr/bin/env node

// Test script to verify Gemini API key and find working models
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not set in environment');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try a simple test with the simplest possible model instantiation
  const modelNames = [
    'gemini-2.5-flash',
    'models/gemini-2.5-flash',
    'gemini-2.5-pro',
    'models/gemini-2.5-pro',
  ];
  
  for (const modelName of modelNames) {
    console.log(`\n🧪 Testing model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log('   ✓ Model instantiated');
      
      const result = await model.generateContent('Say hello in one word');
      const text = result.response.text();
      console.log(`   ✓ Response: ${text}`);
      console.log(`   ✅ SUCCESS! Use this model name: ${modelName}`);
      return modelName;
    } catch (e) {
      console.log(`   ✗ Failed: ${e.message}`);
    }
  }
  
  console.log('\n❌ No working model found. Please check your API key at https://aistudio.google.com/apikey');
  console.log('   Make sure the Generative Language API is enabled for your project.');
  process.exit(1);
}

testGeminiAPI().catch(console.error);
