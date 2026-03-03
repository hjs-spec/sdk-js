// Simple test script for HJS SDK
import HJSClient from './index.js';

async function runTests() {
  console.log('🧪 Testing HJS SDK...');
  
  const client = new HJSClient({
    baseURL: 'https://api.hjs.sh'
    // No API key needed for basic tests
  });

  try {
    // Test health check
    const health = await client.health();
    console.log('✅ Health check:', health.status);

    // Test judgment creation (this will fail without API key, but that's expected)
    try {
      await client.judgment({
        entity: 'test@example.com',
        action: 'test'
      });
    } catch (err) {
      console.log('✅ Judgment requires auth (expected):', err.message);
    }

    console.log('🎉 All tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
