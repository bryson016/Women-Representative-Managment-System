const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'ward_management'
  });
  await conn.query('ALTER TABLE bursary_applications MODIFY COLUMN citizen_id BIGINT UNSIGNED DEFAULT NULL');
  console.log('ALTER TABLE executed');
  const [cols] = await conn.query('DESCRIBE bursary_applications');
  const citizenCol = cols.find(c => c.Field === 'citizen_id');
  console.log('citizen_id:', citizenCol ? citizenCol.Type + ' ' + citizenCol.Null : 'not found');
  await conn.end();
}
fix().catch(e => console.error(e.message));
