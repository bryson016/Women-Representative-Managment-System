const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'ward_management'
  });
  const [users] = await conn.query('DESCRIBE users');
  console.log('users:', users.map(c => c.Field + ' (' + c.Type + ')').join(', '));
  await conn.end();
}
check().catch(e => console.error(e.message));
