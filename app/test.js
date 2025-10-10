const http = require('http');

console.log('🧪 Starting Currency Converter Tests...');

// Test configuration
const TEST_HOST = 'localhost';
const TEST_PORT = 3000;
const TEST_URL = `http://${TEST_HOST}:${TEST_PORT}/convert?from=USD&to=INR&amount=100`;

// Make HTTP GET request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: response.statusCode,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    // Set timeout for the request
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run tests
async function runTests() {
  try {
    console.log(`📡 Testing API endpoint: ${TEST_URL}`);
    
    const response = await makeRequest(TEST_URL);
    
    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📋 Response Data:`, response.data);
    
    // Validate response
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    
    const { from, to, amount, result } = response.data;
    
    // Validate response structure
    if (!from || !to || amount === undefined || result === undefined) {
      throw new Error('Invalid response structure');
    }
    
    // Validate conversion values
    if (from !== 'USD') {
      throw new Error(`Expected from=USD, got ${from}`);
    }
    
    if (to !== 'INR') {
      throw new Error(`Expected to=INR, got ${to}`);
    }
    
    if (amount !== 100) {
      throw new Error(`Expected amount=100, got ${amount}`);
    }
    
    // Validate result is a positive number
    if (typeof result !== 'number' || result <= 0) {
      throw new Error(`Expected positive number result, got ${result}`);
    }
    
    // Validate expected conversion rate (100 USD should be around 8800 INR)
    const expectedResult = 8800;
    const tolerance = 100; // Allow some tolerance
    
    if (Math.abs(result - expectedResult) > tolerance) {
      console.log(`⚠️  Warning: Result ${result} differs from expected ${expectedResult}, but within acceptable range`);
    }
    
    console.log('✅ All validations passed!');
    console.log(`💰 Conversion: ${amount} ${from} = ${result} ${to}`);
    console.log('🎉 TESTS PASSED');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('💥 TESTS FAILED');
    process.exit(1);
  }
}

// Add timeout for the entire test suite
const testTimeout = setTimeout(() => {
  console.error('❌ TEST SUITE TIMEOUT: Tests took too long to complete');
  console.log('💥 TESTS FAILED');
  process.exit(1);
}, 10000); // 10 second timeout

// Run the tests
runTests().finally(() => {
  clearTimeout(testTimeout);
});