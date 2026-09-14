require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function initDatabase() {
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

    // Select the database for subsequent queries
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Check if core tables exist (from schema.sql)
    const [coreTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'citizens', 'staff', 'complaints', 'projects')",
      [process.env.DB_NAME]
    );
    const existingCoreTables = coreTables.map((t) => t.TABLE_NAME);

    if (existingCoreTables.length === 0) {
      console.log("Core tables not found. Creating from schema.sql...");
      const schemaSql = fs.readFileSync(
        path.join(__dirname, "database/schema.sql"),
        "utf8"
      );
      await connection.query(schemaSql);
      console.log("Database initialized successfully.");
    } else {
      console.log("Core tables already exist.");
    }

    // Run settings migration
    const [settingsTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('system_settings', 'system_activities')",
      [process.env.DB_NAME]
    );
    const existingSettingsTables = settingsTables.map((t) => t.TABLE_NAME);
    if (!existingSettingsTables.includes("system_settings") || !existingSettingsTables.includes("system_activities")) {
      console.log("Running settings migration...");
      const settingsSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_settings.sql"),
        "utf8"
      );
      await connection.query(settingsSql);
      console.log("Settings migration completed.");
    } else {
      console.log("Settings tables already exist.");
    }

    // Run notifications migration
    const [notificationsTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('notifications')",
      [process.env.DB_NAME]
    );
    const existingNotificationsTables = notificationsTables.map((t) => t.TABLE_NAME);
    if (!existingNotificationsTables.includes("notifications")) {
      console.log("Running notifications migration...");
      const notificationsSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_notifications.sql"),
        "utf8"
      );
      await connection.query(notificationsSql);
      console.log("Notifications migration completed.");
    } else {
      console.log("Notifications table already exists.");
    }

    // Run bursary migration
    const [programTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_programs')",
      [process.env.DB_NAME]
    );
    if (programTables.length === 0) {
      console.log("Running bursary programs migration...");
      const programsSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_bursary_enhancements.sql"),
        "utf8"
      );
      await connection.query(programsSql);
      console.log("Bursary programs migration completed.");
    } else {
      console.log("Bursary programs table already exists.");
    }

    const [bursaryTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_applications', 'bursary_application_documents', 'bursary_application_history')",
      [process.env.DB_NAME]
    );
    const existingBursaryTables = bursaryTables.map((t) => t.TABLE_NAME);
    if (!existingBursaryTables.includes("bursary_applications")) {
      console.log("Running bursary migration...");
      const bursarySql = fs.readFileSync(
        path.join(__dirname, "database/migrate_bursary.sql"),
        "utf8"
      );
      await connection.query(bursarySql);
      console.log("Bursary migration completed.");
    } else {
      console.log("Bursary tables already exist.");
    }

    const [enhancementTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('bursary_beneficiaries', 'bursary_payments', 'audit_logs')",
      [process.env.DB_NAME]
    );
    const existingEnhancementTables = enhancementTables.map((t) => t.TABLE_NAME);
    if (!existingEnhancementTables.includes("bursary_beneficiaries")) {
      console.log("Running bursary enhancements migration...");
      const enhancementSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_bursary_full.sql"),
        "utf8"
      );
      await connection.query(enhancementSql);
      console.log("Bursary enhancements migration completed.");
    } else {
      console.log("Bursary enhancement tables already exist.");
    }

    // Run images migration
    const [imageTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('ward_images', 'image_categories')",
      [process.env.DB_NAME]
    );
    const existingImageTables = imageTables.map((t) => t.TABLE_NAME);
    if (!existingImageTables.includes("ward_images") || !existingImageTables.includes("image_categories")) {
      console.log("Running images migration...");
      const imagesSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_images.sql"),
        "utf8"
      );
      await connection.query(imagesSql);
      console.log("Images migration completed.");
    } else {
      console.log("Images tables already exist.");
    }

    // Run payments migration
    const [paymentTables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('payments')",
      [process.env.DB_NAME]
    );
    const existingPaymentTables = paymentTables.map((t) => t.TABLE_NAME);
    if (!existingPaymentTables.includes("payments")) {
      console.log("Running payments migration...");
      const paymentsSql = fs.readFileSync(
        path.join(__dirname, "database/migrate_payments.sql"),
        "utf8"
      );
      await connection.query(paymentsSql);
      console.log("Payments migration completed.");
    } else {
      console.log("Payments table already exists.");
    }

    await connection.end();
    console.log("\nDatabase initialization complete!");
    return true;
  } catch (err) {
    if (connection) {
      try {
        await connection.end();
      } catch (e) { /* ignore */ }
    }
    console.error("Database initialization error:", err.message);
    return false;
  }
}

initDatabase();