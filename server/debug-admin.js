const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2/promise");

async function checkAdminUser() {
  console.log("=".repeat(60));
  console.log("DEBUG: Checking Admin User in Database");
  console.log("=".repeat(60));
  
  try {
    // Connect to database
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
    });
    
    console.log("\n✓ Connected to database:", process.env.DB_NAME);
    
    // Check users table
    console.log("\n--- Checking users table ---");
    const [tables] = await conn.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
      [process.env.DB_NAME]
    );
    
    if (tables.length === 0) {
      console.log("✗ Users table does NOT exist!");
      await conn.end();
      return;
    }
    console.log("✓ Users table exists");
    
    // Get all users
    console.log("\n--- All Users in Database ---");
    const [users] = await conn.query(
      "SELECT id, full_name, username, role, password_hash, is_active, ward, email FROM users"
    );
    
    if (users.length === 0) {
      console.log("✗ No users found in database!");
    } else {
      console.table(users);
    }
    
    // Check specifically for admin user
    console.log("\n--- Admin User Check ---");
    const [adminUsers] = await conn.query(
      "SELECT id, full_name, username, role, password_hash, is_active FROM users WHERE username = 'admin'"
    );
    
    if (adminUsers.length === 0) {
      console.log("✗ Admin user 'admin' does NOT exist!");
      console.log("\nTo create admin user, run this SQL:");
      console.log(`
        INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
        VALUES (
          'System Administrator',
          'admin',
          '$2b\\$12\\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/1iC',
          'admin',
          'Westlands',
          'admin@ward.gov.ke',
          '+254 700 000 000',
          TRUE
        );
      `);
    } else {
      const admin = adminUsers[0];
      console.log("✓ Admin user found:");
      console.log("  ID:", admin.id);
      console.log("  Username:", admin.username);
      console.log("  Role:", admin.role);
      console.log("  Full Name:", admin.full_name);
      console.log("  Password Hash:", admin.password_hash ? "[SET]" : "[NULL - PROBLEM!]");
      console.log("  Is Active:", admin.is_active);
      
      if (!admin.password_hash) {
        console.log("\n⚠️  PROBLEM: Admin user has NULL password_hash!");
        console.log("Login will FAIL because authService.js rejects NULL passwords.");
        console.log("\nTo fix, run this SQL:");
        console.log("  UPDATE users SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/1iC' WHERE username = 'admin';");
        console.log("\nThen login with:");
        console.log("  Username: admin");
        console.log("  Password: admin123");
      }
      
      if (admin.role !== 'admin') {
        console.log("\n⚠️  PROBLEM: Admin user role is '" + admin.role + "' but should be 'admin'!");
        console.log("\nTo fix, run this SQL:");
        console.log("  UPDATE users SET role = 'admin' WHERE username = 'admin';");
      }
      
      if (!admin.is_active) {
        console.log("\n⚠️  PROBLEM: Admin account is INACTIVE!");
        console.log("\nTo fix, run this SQL:");
        console.log("  UPDATE users SET is_active = TRUE WHERE username = 'admin';");
      }
    }
    
    await conn.end();
    console.log("\n" + "=".repeat(60));
    console.log("Debug complete!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n✗ Error connecting to database:");
    console.error("  Error:", error.message);
    console.error("\nCheck your .env file:");
    console.error("  DB_HOST:", process.env.DB_HOST || "[NOT SET]");
    console.error("  DB_USER:", process.env.DB_USER || "[NOT SET]");
    console.error("  DB_NAME:", process.env.DB_NAME || "[NOT SET]");
  }
}

checkAdminUser();