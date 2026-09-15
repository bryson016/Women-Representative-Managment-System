const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function fixAdminPassword() {
  console.log("=".repeat(60));
  console.log("FIXING ADMIN PASSWORD");
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
    
    // The password hash for "admin123"
    const passwordHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/1iC";
    
    // Update admin password
    console.log("\nUpdating admin password_hash...");
    const [result] = await conn.execute(
      "UPDATE users SET password_hash = ? WHERE username = 'admin'",
      [passwordHash]
    );
    
    if (result.affectedRows > 0) {
      console.log("✓ Password updated successfully!");
      console.log("\nYou can now login with:");
      console.log("  Username: admin");
      console.log("  Password: admin123");
    } else {
      console.log("✗ No admin user found to update!");
    }
    
    await conn.end();
    console.log("\n" + "=".repeat(60));
    console.log("Done!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
  }
}

fixAdminPassword();