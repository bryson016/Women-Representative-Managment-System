const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { initSettings } = require("./initSettings");

async function runSettingsMigration(connection) {
  try {
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('system_settings', 'system_activities')",
      [process.env.DB_NAME]
    );
    const existingTables = tables.map((t) => t.TABLE_NAME);

    if (!existingTables.includes("system_settings") || !existingTables.includes("system_activities")) {
      console.log("Running settings migration...");
      const migrationSql = fs.readFileSync(
        path.join(__dirname, "../../database/migrate_settings.sql"),
        "utf8"
      );
      await connection.query(migrationSql);
      console.log("Settings migration completed.");
    } else {
      console.log("Settings tables already exist.");
    }
  } catch (err) {
    console.error("Settings migration error:", err.message);
  }
}

async function runBursaryMigration(connection) {
  try {
    // Select the database first
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Run bursary programs migration first (needed for foreign keys)
    const [programTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_programs')",
      [process.env.DB_NAME]
    );
    if (programTables.length === 0) {
      console.log("Running bursary programs migration...");
      const programsSql = fs.readFileSync(
        path.join(__dirname, "../../database/migrate_bursary_enhancements.sql"),
        "utf8"
      );
      await connection.query(programsSql);
      console.log("Bursary programs migration completed.");
    } else {
      console.log("Bursary programs table already exists.");
    }

    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_applications', 'bursary_application_documents', 'bursary_application_history')",
      [process.env.DB_NAME]
    );
    const existingTables = tables.map((t) => t.TABLE_NAME);

    if (!existingTables.includes("bursary_applications")) {
      console.log("Running bursary migration...");
      const migrationSql = fs.readFileSync(
        path.join(__dirname, "../../database/migrate_bursary.sql"),
        "utf8"
      );
      await connection.query(migrationSql);
      console.log("Bursary migration completed.");
    } else {
      console.log("Bursary tables already exist.");
    }

    // Run full bursary enhancements (beneficiaries, payments, audit logs)
    const [enhancementTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_beneficiaries', 'bursary_payments', 'audit_logs')",
      [process.env.DB_NAME]
    );
    const existingEnhancementTables = enhancementTables.map((t) => t.TABLE_NAME);

    if (!existingEnhancementTables.includes("bursary_beneficiaries")) {
      console.log("Running bursary enhancements migration...");
      const enhancementSql = fs.readFileSync(
        path.join(__dirname, "../../database/migrate_bursary_full.sql"),
        "utf8"
      );
      await connection.query(enhancementSql);
      console.log("Bursary enhancements migration completed.");
    } else {
      console.log("Bursary enhancement tables already exist.");
    }
  } catch (err) {
    console.error("Bursary migration error:", err.message);
  }
}

/**
 * Ensures the target database exists and is populated with the schema.
 * Retries connecting to MySQL so the server can be started before XAMPP
 * MySQL is fully ready (or even slightly after).
 */
async function initDatabase() {
  const maxRetries = 10;
  const retryDelayMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let connection;
    try {
      // Connect without selecting a database so we can create it if needed
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
        connectTimeout: 10000,
      });

      // Check if the database already exists
      const [rows] = await connection.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [process.env.DB_NAME]
      );

      if (rows.length === 0) {
        console.log(`Database '${process.env.DB_NAME}' not found. Creating from schema.sql...`);
        const schemaSql = fs.readFileSync(
          path.join(__dirname, "../../database/schema.sql"),
          "utf8"
        );
        await connection.query(schemaSql);
        console.log("Database initialized successfully.");
      } else {
        console.log(`Database '${process.env.DB_NAME}' already exists.`);
      }

      // Run settings migration
      await runSettingsMigration(connection);

      // Run bursary migration
      await runBursaryMigration(connection);

      await connection.end();

      // Initialize default settings
      await initSettings();

      return true;
    } catch (err) {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          /* ignore */
        }
      }
      const reason = err.code || err.message;
      console.log(`Database init attempt ${attempt}/${maxRetries} failed: ${reason}`);
      if (attempt === maxRetries) {
        console.error(
          "Could not initialize the database. Make sure MySQL (XAMPP) is running, then restart the server."
        );
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return false;
}

module.exports = initDatabase;
