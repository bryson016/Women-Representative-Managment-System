require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
  const attempts = [
    { label: "localhost (env)", host: process.env.DB_HOST, password: process.env.DB_PASSWORD },
    { label: "127.0.0.1 no password", host: "127.0.0.1", password: "" },
  ];

  for (const a of attempts) {
    try {
      const conn = await mysql.createConnection({
        host: a.host,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: a.password,
        database: process.env.DB_NAME,
        connectTimeout: 5000,
      });
      console.log(`SUCCESS: ${a.label}`);
      await conn.end();
      return;
    } catch (e) {
      console.log(`FAILED: ${a.label} -> ${e.code || e.message}`);
    }
  }
}

test();
