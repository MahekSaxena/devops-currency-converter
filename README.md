# 🏷️ DevOps Pipeline: Currency Converter Node.js App

**Containerized with Docker and Local CI/CD using GitHub Actions**

## 📖 Project Overview

This mini project demonstrates a **local DevOps CI/CD pipeline** using Docker and GitHub Actions. The app is a lightweight **Currency Converter** built in Node.js that showcases containerization, automated build/test workflows, and local deployment via Docker.

## ✨ Features

- 💱 **Currency Conversion**: Converts between USD, INR, EUR, GBP, JPY, and AED
- 🌐 **Live Exchange Rates**: Integrates with Open Exchange Rates API for real-time data
- 🔄 **Offline Fallback**: Uses static rates when API is unavailable
- 🕒 **Smart Caching**: Caches live rates for 10 minutes to reduce API calls
- 🚀 **CI/CD Pipeline**: Automated workflow builds and tests the container
- 🎨 **Clean UI**: Simple and visually appealing web interface with rate status
- 🏥 **Health Checks**: Built-in health monitoring endpoint
- 🐳 **Dockerized**: Fully containerized application
- 🧪 **Automated Testing**: Node.js test script validates functionality

## 🚀 Quick Start

### Run Locally with Docker

```bash
# Clone and enter repository
git clone <your-repo-url>
cd <repo-name>

# Build Docker image
docker build -t currency-ci-cd .

# Run container
docker run -d -p 3000:3000 --name currency_app currency-ci-cd

# Open in browser
http://localhost:3000
```

### Manual Node.js Run

```bash
# Navigate to app directory
cd app

# Start the application
npm start

# Open in browser
http://localhost:3000
```

## 🌐 API Endpoints

### 1. **Home Page** - `/`
Interactive web UI with currency conversion form

### 2. **Currency Conversion** - `/convert`
```bash
# Example API call
curl "http://localhost:3000/convert?from=USD&to=INR&amount=100"

# Response
{"from":"USD","to":"INR","amount":100,"result":8800}
```

### 3. **Health Check** - `/health`
```bash
# Health check
curl http://localhost:3000/health

# Response
{"status":"ok"}
```

### 4. **Rate Information** - `/rates-info`
```bash
# Get rate source information
curl http://localhost:3000/rates-info

# Response
{
  "isLive": true,
  "lastUpdate": "10:30:15 AM",
  "source": "Open Exchange Rates API",
  "supportedCurrencies": ["USD", "INR", "EUR", "GBP", "JPY", "AED"]
}
```

## 📊 Example Output

### Browser UI (`http://localhost:3000`)
```
Currency Converter
From: USD  To: INR
Amount: 100
[Convert Currency]

Converted Result: 8800.00
```

### API Response (`/convert`)
```json
{
  "from": "USD",
  "to": "INR", 
  "amount": 100,
  "result": 8800
}
```

### Health Check Response
```json
{
  "status": "ok"
}
```

## 🔄 CI/CD Pipeline

### Triggers
- 📤 **Push** to `main` branch
- 🔀 **Pull Request** to `main` branch  
- 🖱️ **Manual** workflow dispatch

### Pipeline Stages
1. **🔍 Checkout**: Retrieve source code
2. **🏗️ Build**: Create Docker image
3. **▶️ Deploy**: Start container locally
4. **🏥 Health Check**: Verify `/health` endpoint
5. **🧪 Test**: Run automated tests
6. **🧹 Cleanup**: Stop and remove container

### Example GitHub Actions Logs
```
✅ Build completed successfully
✅ App is up!
✅ Running tests...
✅ TESTS PASSED
✅ Container stopped and removed
```

## 🏗️ Project Structure

```
/
├── .github/
│   └── workflows/
│       └── docker-ci-local.yml    # GitHub Actions workflow
├── app/
│   ├── index.js                   # Main Node.js application
│   ├── package.json               # Dependencies and scripts
│   └── test.js                    # Automated test suite
├── Dockerfile                     # Container configuration
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## � Configuration

### Environment Variables

Create a `.env` file for configuration:

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

**Available Configuration:**
- `OPEN_EXCHANGE_API_KEY`: Your Open Exchange Rates API key (optional)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### API Key Setup (Optional)

1. **Get Free API Key**: Sign up at [openexchangerates.org](https://openexchangerates.org/signup/free)
2. **Add to Environment**: Set `OPEN_EXCHANGE_API_KEY=your_key_here`
3. **Restart Application**: The app will automatically use live rates

**Without API Key**: App uses reliable fallback rates and works offline.

## 💰 Exchange Rates

### Live Rates vs Fallback

**🌐 Live Rates (with API key):**
- Real-time data from Open Exchange Rates
- Updated every 10 minutes (cached)
- Accurate market rates

**📊 Fallback Rates (without API key):**

| Currency | Rate  | Symbol |
|----------|-------|--------|
| USD      | 1.0   | $      |
| INR      | 88.00 | ₹      |  
| EUR      | 0.92  | €      |
| GBP      | 0.78  | £      |
| JPY      | 156.3 | ¥      |
| AED      | 3.67  | د.إ    |

## 🧪 Testing

### Automated Tests
```bash
# Run tests (requires app to be running)
npm test

# Or run directly
node app/test.js
```

### Manual Testing
```bash
# Test currency conversion
curl "http://localhost:3000/convert?from=USD&to=EUR&amount=50"

# Test health endpoint  
curl http://localhost:3000/health

# Test invalid currency
curl "http://localhost:3000/convert?from=INVALID&to=USD&amount=100"
```

## 🐳 Docker Commands

### Build & Run
```bash
# Build image
docker build -t currency-ci-cd .

# Run container
docker run -d -p 3000:3000 --name currency_app currency-ci-cd

# View logs
docker logs currency_app

# Stop container
docker stop currency_app

# Remove container
docker rm currency_app
```

### Health Check
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' currency_app
```

## 🔧 Development

### Requirements
- **Node.js** >= 18
- **Docker** (for containerization)
- **Git** (for version control)

### Local Development
```bash
# Install dependencies (none required)
cd app && npm install

# Start development server
npm start

# Run tests
npm test
```

## 🚦 Troubleshooting

### Common Issues

**1. Port 3000 already in use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process or use different port
docker run -d -p 3001:3000 --name currency_app currency-ci-cd
```

**2. Docker build fails**
```bash
# Check Docker is running
docker --version

# Clean Docker cache
docker system prune -f
```

**3. Tests fail**
```bash
# Ensure app is running
curl http://localhost:3000/health

# Check app logs
docker logs currency_app
```

## 🌟 DevOps Best Practices Demonstrated

- **🔄 Continuous Integration**: Automated build and test on code changes
- **🐳 Containerization**: Consistent deployment across environments  
- **🏥 Health Monitoring**: Built-in health checks for reliability
- **🧪 Automated Testing**: Comprehensive test coverage
- **🔒 Security**: Non-root user in Docker container
- **📋 Documentation**: Complete setup and usage instructions
- **🎯 Single Responsibility**: Each component has a clear purpose

---

## ✅ Demo Checklist

1. **🌐 Local Testing**: Run the app locally and test on `http://localhost:3000`
2. **🔌 API Testing**: Use `/convert` and `/health` endpoints manually  
3. **🚀 CI/CD Trigger**: Push to GitHub to trigger workflow
4. **📊 Monitor Logs**: Show CI logs (build → test → cleanup)
5. **📚 DevOps Flow**: Explain DevOps flow (code → container → CI test)

---

**🎯 This project demonstrates a complete local DevOps pipeline without requiring any external services or cloud resources!**