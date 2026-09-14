const mysql = require("mysql2/promise");

const pool = mysql.createPool(process.env.DATABASE_URL);

pool.on("connection", () => {
  console.log("MySQL connection established");
});

pool.on("error", (err) => {
  console.error("MySQL pool error:", err.message);
});

module.exports = pool;