const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  // Login first
  const loginRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });
  
  const token = loginRes.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Create application
  console.log('Creating application...');
  const appRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/bursary/applications',
    method: 'POST',
    headers
  }, {
    fullName: "Test User",
    nationalId: "12345678",
    phoneNumber: "0712345678",
    ward: "Westlands",
    institutionName: "Test University",
    institutionType: "University",
    courseOrForm: "Computer Science",
    academicYear: "2024",
    totalFees: 50000,
    amountPaid: 10000,
    amountRequested: 20000,
    reasonForApplication: "Need financial assistance"
  });
  
  console.log('Status:', appRes.status);
  console.log('Response:', JSON.stringify(appRes.data, null, 2));
}

test().catch(e => console.error('Test error:', e.message));
