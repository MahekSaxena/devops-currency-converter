const http = require('http');
const https = require('https');
const url = require('url');

// Fallback static exchange rates (base USD) - used when API is unavailable
const fallbackRates = {
  USD: 1.0,
  INR: 88.00,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 156.3,
  AED: 3.67
};

// Cache for exchange rates
let exchangeRates = { ...fallbackRates };
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Open Exchange Rates API configuration
const OPEN_EXCHANGE_API_KEY = process.env.OPEN_EXCHANGE_API_KEY || 'demo'; // Use 'demo' for testing
const OPEN_EXCHANGE_API_URL = `https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_API_KEY}&symbols=USD,INR,EUR,GBP,JPY,AED`;

// Function to fetch live exchange rates
function fetchExchangeRates() {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    
    // Use cached rates if they're still fresh
    if (now - lastFetchTime < CACHE_DURATION) {
      console.log('📊 Using cached exchange rates');
      resolve(exchangeRates);
      return;
    }

    console.log('🌐 Fetching live exchange rates from Open Exchange Rates API...');
    
    const request = https.get(OPEN_EXCHANGE_API_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const apiResponse = JSON.parse(data);
          
          if (apiResponse.rates) {
            // Update exchange rates with live data
            exchangeRates = {
              USD: 1.0, // Base currency
              ...apiResponse.rates
            };
            lastFetchTime = now;
            console.log('✅ Live exchange rates updated:', exchangeRates);
            resolve(exchangeRates);
          } else {
            console.log('⚠️ API response missing rates, using fallback');
            resolve(fallbackRates);
          }
        } catch (error) {
          console.error('❌ Error parsing API response:', error.message);
          console.log('🔄 Using fallback rates');
          resolve(fallbackRates);
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('❌ Error fetching live rates:', error.message);
      console.log('🔄 Using fallback rates');
      resolve(fallbackRates);
    });
    
    // Set timeout for API request
    request.setTimeout(5000, () => {
      request.destroy();
      console.log('⏱️ API request timeout, using fallback rates');
      resolve(fallbackRates);
    });
  });
}

// Convert currency function
async function convertCurrency(from, to, amount) {
  try {
    // Fetch latest rates (will use cache if recent)
    const rates = await fetchExchangeRates();
    
    const fromRate = rates[from];
    const toRate = rates[to];
    
    if (!fromRate || !toRate) {
      return null;
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    const result = usdAmount * toRate;
    
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error in currency conversion:', error);
    return null;
  }
}

// HTML UI for the currency converter
function getHomePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Currency Converter</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 28px;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
        }
        
        input, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .currency-row {
            display: flex;
            gap: 15px;
        }
        
        .currency-row .form-group {
            flex: 1;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 10px;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .loading {
            color: #667eea;
        }
        
        .error {
            color: #e74c3c;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💱 Currency Converter</h1>
        <div id="rateInfo" style="margin-bottom: 20px; padding: 10px; background: #e8f4f8; border-radius: 8px; font-size: 14px; color: #2c5282;">
            <span id="rateStatus">🔄 Loading exchange rates...</span>
        </div>
        
        <form id="converterForm">
            <div class="form-group">
                <label for="amount">Amount:</label>
                <input type="number" id="amount" name="amount" placeholder="Enter amount" required min="0" step="0.01">
            </div>
            
            <div class="currency-row">
                <div class="form-group">
                    <label for="from">From:</label>
                    <select id="from" name="from" required>
                        <option value="USD">USD - US Dollar</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="AED">AED - UAE Dirham</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="to">To:</label>
                    <select id="to" name="to" required>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="AED">AED - UAE Dirham</option>
                    </select>
                </div>
            </div>
            
            <button type="submit">Convert Currency</button>
        </form>
        
        <div id="result" class="result">
            Enter an amount and select currencies to convert
        </div>
    </div>

    <script>
        // Update rate status on page load
        async function updateRateStatus() {
            try {
                const response = await fetch('/rates-info');
                const data = await response.json();
                const statusElement = document.getElementById('rateStatus');
                
                if (data.isLive) {
                    statusElement.innerHTML = '🌐 Live rates (updated ' + data.lastUpdate + ')';
                } else {
                    statusElement.innerHTML = '📊 Using fallback rates (API unavailable)';
                }
            } catch (error) {
                document.getElementById('rateStatus').innerHTML = '⚠️ Rate status unknown';
            }
        }
        
        // Update status on page load
        updateRateStatus();

        document.getElementById('converterForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('amount').value;
            const from = document.getElementById('from').value;
            const to = document.getElementById('to').value;
            const resultDiv = document.getElementById('result');
            
            // Show loading state
            resultDiv.innerHTML = '<span class="loading">Converting...</span>';
            
            try {
                const response = await fetch('/convert?from=' + from + '&to=' + to + '&amount=' + amount);
                const data = await response.json();
                
                if (response.ok && data.result !== undefined) {
                    const rate = (data.result / amount).toFixed(4);
                    resultDiv.innerHTML = '<strong>' + amount + ' ' + from + ' = ' + data.result + ' ' + to + '</strong>' +
                        '<br><small style="color: #666; margin-top: 8px; display: block;">' +
                        'Rate: 1 ' + from + ' = ' + rate + ' ' + to + '</small>';
                    // Update rate status after conversion
                    updateRateStatus();
                } else {
                    resultDiv.innerHTML = '<span class="error">Conversion failed. Please try again.</span>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<span class="error">Network error. Please check your connection.</span>';
            }
        });
    </script>
</body>
</html>
  `;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Home page - serve HTML UI
    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getHomePage());
      return;
    }

    // Health check endpoint
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Rates information endpoint
    if (pathname === '/rates-info') {
      const now = Date.now();
      const isLive = (now - lastFetchTime) < CACHE_DURATION && lastFetchTime > 0;
      const lastUpdate = lastFetchTime > 0 ? new Date(lastFetchTime).toLocaleTimeString() : 'Never';
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        isLive, 
        lastUpdate,
        source: isLive ? 'Open Exchange Rates API' : 'Fallback rates',
        supportedCurrencies: Object.keys(exchangeRates)
      }));
      return;
    }

    // Currency conversion endpoint
    if (pathname === '/convert') {
      const { from, to, amount } = query;

      // Validate inputs
      if (!from || !to || !amount) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required parameters: from, to, amount' }));
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Amount must be a valid positive number' }));
        return;
      }

      const result = await convertCurrency(from.toUpperCase(), to.toUpperCase(), numAmount);
      
      if (result === null) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid currency code' }));
        return;
      }

      const response = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: numAmount,
        result: result,
        source: (Date.now() - lastFetchTime) < CACHE_DURATION && lastFetchTime > 0 ? 'live' : 'fallback'
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Currency Converter Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 API endpoint: http://localhost:${PORT}/convert?from=USD&to=INR&amount=100`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});