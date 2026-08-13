const pool = require("./db");

const DEFAULT_SETTINGS = [
  { key: "ward_name", value: "Kiambu Ward", type: "text", description: "Name of the ward" },
  { key: "ward_code", value: "KBW-001", type: "text", description: "Unique ward code" },
  { key: "county", value: "Kiambu County", type: "text", description: "County name" },
  { key: "system_name", value: "Ward Management System", type: "text", description: "System display name" },
  { key: "financial_year", value: "2026/2027", type: "text", description: "Current financial year" },
  { key: "time_zone", value: "Africa/Nairobi (EAT)", type: "text", description: "System time zone" },
  { key: "email", value: "info@kiambuward.go.ke", type: "email", description: "Ward office email" },
  { key: "phone", value: "+254 712 345 678", type: "tel", description: "Ward office phone" },
  { key: "office_address", value: "Kiambu, Kenya", type: "text", description: "Ward office address" },
];

async function initSettings() {
  try {
    const [existing] = await pool.query(
      "SELECT COUNT(*) as count FROM system_settings"
    );
    if (existing[0].count > 0) {
      console.log("Settings already initialized.");
      return;
    }

    for (const setting of DEFAULT_SETTINGS) {
      await pool.query(
        "INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_editable, created_at, updated_at) VALUES (?, ?, ?, ?, true, NOW(), NOW())",
        [setting.key, setting.value, setting.type, setting.description]
      );
    }

    console.log("Default settings initialized successfully.");
  } catch (error) {
    console.error("Error initializing settings:", error.message);
  }
}

module.exports = { initSettings };
