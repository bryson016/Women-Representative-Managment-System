const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function setupUsers() {
  const password = 'Admin@123'; // Change this to your desired password
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      fullName: 'System Administrator',
      username: 'admin',
      role: 'admin',
      ward: 'Westlands',
      email: 'admin@ward.gov.ke',
      phoneNumber: '+254 700 000 000',
    },
    {
      fullName: 'Staff User',
      username: 'staff',
      role: 'staff',
      ward: 'Westlands',
      email: 'staff@ward.gov.ke',
      phoneNumber: '+254 700 000 001',
    },
    {
      fullName: 'John Citizen',
      username: 'citizen',
      role: 'citizen',
      ward: 'Westlands',
      email: 'citizen@ward.gov.ke',
      phoneNumber: '+254 700 000 002',
    },
  ];

  for (const user of users) {
    try {
      await pool.execute(
        `INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE role = VALUES(role), password_hash = VALUES(password_hash)`,
        [user.fullName, user.username, passwordHash, user.role, user.ward, user.email, user.phoneNumber]
      );
      console.log(`✓ Created/updated user: ${user.username} (${user.role})`);
    } catch (error) {
      console.error(`✗ Error creating user ${user.username}:`, error.message);
    }
  }

  // Verify
  const [rows] = await pool.execute('SELECT id, full_name, username, role, ward, email, is_active FROM users');
  console.log('\n--- Users in database ---');
  console.table(rows);

  console.log(`\nPassword for all users: ${password}`);
  console.log('\nSetup complete!');
  process.exit(0);
}

setupUsers().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
