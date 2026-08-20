const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'ward_management'
  });
  
  const alters = [
    'ALTER TABLE bursary_applications MODIFY COLUMN date_of_birth DATE DEFAULT NULL',
    'ALTER TABLE bursary_applications MODIFY COLUMN gender ENUM("Male","Female","Other") DEFAULT NULL',
    'ALTER TABLE bursary_applications MODIFY COLUMN email VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE bursary_applications MODIFY COLUMN residential_address VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE bursary_applications MODIFY COLUMN county VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE bursary_applications MODIFY COLUMN constituency VARCHAR(100) DEFAULT NULL',
  ];
  
  for (const sql of alters) {
    await conn.query(sql);
    console.log('Executed:', sql);
  }
  
  console.log('All columns made nullable');
  await conn.end();
}

fix().catch(e => console.error(e.message));
