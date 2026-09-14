require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
  console.log("Testing connection to Hostinger database...");
  console.log("URL:", process.env.DATABASE_URL);
  
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    console.log("SUCCESS: Connected to database!");
    
    const [rows] = await conn.query("SHOW TABLES");
    console.log("Tables found:", rows.length);
    rows.forEach(r => console.log(" -", Object.values(r)[0]));
    
    await conn.end();
  } catch (e) {
    console.log("FAILED:", e.code || e.message);
    console.log("Error details:", e.message);
  }
}

test();