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
  // Login
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

  console.log('=== Step 1: Create Application ===');
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
  
  console.log('Create application:', appRes.status, appRes.data);
  const applicationId = appRes.data.applicationId;

  console.log('\n=== Step 2: Approve Application ===');
  const approveRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: `/api/bursary/applications/${applicationId}/status`,
    method: 'PUT',
    headers
  }, {
    status: "Approved",
    approvedAmount: 20000,
    reviewComments: "Approved for bursary"
  });
  
  console.log('Approve application:', approveRes.status, approveRes.data);

  console.log('\n=== Step 3: Check Beneficiaries ===');
  const benRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/bursary/beneficiaries?page=1&limit=10',
    method: 'GET',
    headers
  });
  
  console.log('Beneficiaries:', benRes.status);
  console.log('Total beneficiaries:', benRes.data.pagination?.total);
  if (benRes.data.beneficiaries?.length > 0) {
    console.log('First beneficiary:', JSON.stringify(benRes.data.beneficiaries[0], null, 2));
  }

  console.log('\n=== Step 4: Create Payment ===');
  if (benRes.data.beneficiaries?.length > 0) {
    const beneficiary = benRes.data.beneficiaries[0];
    const payRes = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: '/api/bursary/payments',
      method: 'POST',
      headers
    }, {
      beneficiaryId: beneficiary.id,
      applicationId: applicationId,
      paymentAmount: 15000,
      paymentMethod: "M-Pesa",
      mpesaNumber: "0712345678",
      mpesaTransactionId: "TEST123",
      transactionReference: "REF123",
      notes: "First disbursement"
    });
    
    console.log('Create payment:', payRes.status, payRes.data);
  }

  console.log('\n=== Step 5: Check Stats ===');
  const statsRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/bursary/stats',
    method: 'GET',
    headers
  });
  
  console.log('Stats:', JSON.stringify(statsRes.data, null, 2));

  console.log('\n=== Step 6: Check Audit Logs ===');
  const auditRes = await makeRequest({
    hostname: 'localhost', port: 5000,
    path: '/api/bursary/audit-logs?page=1&limit=10',
    method: 'GET',
    headers
  });
  
  console.log('Audit logs:', auditRes.status);
  console.log('Total logs:', auditRes.data.pagination?.total);
  if (auditRes.data.logs?.length > 0) {
    console.log('First log:', JSON.stringify(auditRes.data.logs[0], null, 2));
  }
}

test().catch(e => console.error('Test error:', e.message));
