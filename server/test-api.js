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
  // Test login
  console.log('1. Testing login...');
  const loginRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });
  
  console.log('Login status:', loginRes.status);
  console.log('Login response:', JSON.stringify(loginRes.data, null, 2));
  
  if (loginRes.status === 200 && loginRes.data.token) {
    const token = loginRes.data.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Test get bursary stats
    console.log('\n2. Testing get bursary stats...');
    const statsRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/stats',
      method: 'GET',
      headers
    });
    console.log('Stats status:', statsRes.status);
    console.log('Stats response:', JSON.stringify(statsRes.data, null, 2));

    // Test get beneficiaries
    console.log('\n3. Testing get beneficiaries...');
    const benRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/beneficiaries?page=1&limit=5',
      method: 'GET',
      headers
    });
    console.log('Beneficiaries status:', benRes.status);
    console.log('Beneficiaries count:', benRes.data.beneficiaries?.length || 0);
    console.log('Beneficiaries total:', benRes.data.pagination?.total || 0);

    // Test get applications
    console.log('\n4. Testing get applications...');
    const appRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/applications?page=1&limit=5',
      method: 'GET',
      headers
    });
    console.log('Applications status:', appRes.status);
    console.log('Applications count:', appRes.data.applications?.length || 0);
    console.log('Applications total:', appRes.data.pagination?.total || 0);

    // Test get payments
    console.log('\n5. Testing get payments...');
    const payRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/payments?page=1&limit=5',
      method: 'GET',
      headers
    });
    console.log('Payments status:', payRes.status);
    console.log('Payments count:', payRes.data.payments?.length || 0);
    console.log('Payments total:', payRes.data.pagination?.total || 0);

    // Test get audit logs
    console.log('\n6. Testing get audit logs...');
    const auditRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/audit-logs?page=1&limit=5',
      method: 'GET',
      headers
    });
    console.log('Audit logs status:', auditRes.status);
    console.log('Audit logs count:', auditRes.data.logs?.length || 0);
  }
}

test().catch(e => console.error('Test error:', e.message));
