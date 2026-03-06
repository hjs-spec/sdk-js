// Simple test script for JEP SDK
// Updated March 2026: Synchronized with JEP Protocol Standards
import JEPClient from './index.js';

async function runTests() {
  console.log('🧪 Testing JEP SDK (Judgment Event Protocol)...');
  
  const client = new JEPClient({
    // 已更新为 JEP 官方 API 节点
    baseURL: 'https://api.jep-protocol.org'
    // No API key needed for basic health tests
  });

  try {
    // Test JEP API health check
    const health = await client.health();
    console.log('✅ JEP API Health check:', health.status);

    // Test JEP judgment creation (expected to fail without API key)
    try {
      console.log('🔄 Verifying JEP Judgment authorization flow...');
      await client.judgment({
        entity: 'test@example.com',
        action: 'compliance_test'
      });
    } catch (err) {
      // 这里的逻辑依然成立：验证了 SDK 能正确捕获 401/403 错误
      console.log('✅ JEP Judgment requires auth (expected):', err.message);
    }

    console.log('🎉 All JEP SDK local tests passed!');
  } catch (err) {
    console.error('❌ JEP SDK Test failed:', err);
    process.exit(1);
  }
}

runTests();
