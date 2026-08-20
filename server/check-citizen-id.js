const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'ward_management'
  });
  const [cols] = await conn.query('DESCRIBE bursary_applications');
  const citizenCol = cols.find(c => c.Field === 'citizen_id');
  console.log('citizen_id:', citizenCol ? citizenCol.Type + ' ' + citizenCol.Null : 'not found');
  await conn.end();
}
check().catch(e => console.error(e.message));
