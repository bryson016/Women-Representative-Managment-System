const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testMigration() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ward_management',
    multipleStatements: true
  });

  try {
    // Check if bursary_programs exists
    const [programTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ward_management' AND TABLE_NAME = 'bursary_programs'"
    );
    console.log('bursary_programs exists:', programTables.length > 0);

    if (programTables.length > 0) {
      const [programs] = await connection.query('DESCRIBE bursary_programs');
      console.log('bursary_programs structure:', programs.map(c => `${c.Field} (${c.Type})`).join(', '));
    }

    // Check if citizens exists
    const [citizenTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ward_management' AND TABLE_NAME = 'citizens'"
    );
    console.log('citizens exists:', citizenTables.length > 0);

    if (citizenTables.length > 0) {
      const [citizens] = await connection.query('DESCRIBE citizens');
      console.log('citizens structure:', citizens.map(c => `${c.Field} (${c.Type})`).join(', '));
    }

    // Try to create the beneficiaries table
    console.log('\nTrying to create bursary_beneficiaries...');
    const sql = fs.readFileSync(path.join(__dirname, 'database/migrate_bursary_full.sql'), 'utf8');
    await connection.query(sql);
    console.log('SUCCESS: bursary_beneficiaries created!');
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('SQL State:', err.sqlState);
    console.error('Error Code:', err.errno);
  } finally {
    await connection.end();
  }
}

testMigration();
