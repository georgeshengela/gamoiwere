// Keep-alive script to prevent Replit from sleeping
const http = require('http');
const https = require('https');

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (more frequent than Replit's 5-minute timeout)
const APP_URL = process.env.REPL_URL || 'http://localhost:5000';
const HEALTH_ENDPOINT = `${APP_URL}/health`;

let consecutiveErrors = 0;
const MAX_ERRORS = 3;

function pingApp() {
  const client = HEALTH_ENDPOINT.startsWith('https') ? https : http;
  
  const req = client.get(HEALTH_ENDPOINT, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        consecutiveErrors = 0;
        try {
          const healthData = JSON.parse(data);
          console.log(`✅ Keep-alive: ${res.statusCode} - Uptime: ${Math.floor(healthData.uptime)}s at ${new Date().toISOString()}`);
        } catch (e) {
          console.log(`✅ Keep-alive: ${res.statusCode} at ${new Date().toISOString()}`);
        }
      } else {
        consecutiveErrors++;
        console.log(`⚠️ Keep-alive warning: ${res.statusCode} at ${new Date().toISOString()}`);
      }
    });
  });

  req.on('error', (err) => {
    consecutiveErrors++;
    console.log(`❌ Keep-alive error (${consecutiveErrors}/${MAX_ERRORS}): ${err.message} at ${new Date().toISOString()}`);
    
    if (consecutiveErrors >= MAX_ERRORS) {
      console.log(`🚨 Too many consecutive errors. Service may be down.`);
      // Reset counter to continue trying
      consecutiveErrors = 0;
    }
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.log(`⏰ Keep-alive timeout at ${new Date().toISOString()}`);
  });
}

// Start pinging immediately and then every 4 minutes
console.log(`🚀 Keep-alive service started. Pinging ${HEALTH_ENDPOINT} every ${PING_INTERVAL/1000/60} minutes.`);
pingApp();
setInterval(pingApp, PING_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Keep-alive service stopping...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Keep-alive service terminated...');
  process.exit(0);
});