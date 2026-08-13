const pool = require("../config/db");

async function getSettings(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM system_settings ORDER BY setting_key");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Get settings error:", error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Settings tables not found. Please run the database migration." });
    }
    res.status(500).json({ message: "Failed to fetch settings." });
  }
}

async function getSettingByKey(req, res) {
  try {
    const { key } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM system_settings WHERE setting_key = ? LIMIT 1",
      [key]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Setting not found." });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get setting error:", error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Settings tables not found. Please run the database migration." });
    }
    res.status(500).json({ message: "Failed to fetch setting." });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = req.body;
    const userId = req.user?.id || null;

    if (!Array.isArray(settings)) {
      return res.status(400).json({ message: "Invalid settings format." });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const setting of settings) {
        const { key, value } = setting;
        if (!key || value === undefined) {
          continue;
        }

        const [existing] = await connection.query(
          "SELECT id FROM system_settings WHERE setting_key = ?",
          [key]
        );

        if (existing.length > 0) {
          await connection.query(
            "UPDATE system_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE setting_key = ?",
            [String(value), userId, key]
          );
        } else {
          await connection.query(
            "INSERT INTO system_settings (setting_key, setting_value, updated_by, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [key, String(value), userId]
          );
        }
      }

      await connection.commit();
      res.status(200).json({ message: "Settings updated successfully." });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update settings error:", error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Settings tables not found. Please run the database migration." });
    }
    res.status(500).json({ message: "Failed to update settings." });
  }
}

async function getSystemStatus(req, res) {
  try {
    const [dbStatus] = await pool.query("SELECT 1 as test");
    const dbConnected = dbStatus.length > 0;

    const [userCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE is_active = 1");
    const activeUsers = userCount[0]?.count || 0;

    const [backupRows] = await pool.query(
      "SELECT created_at FROM system_activities WHERE activity = 'Database Backup' ORDER BY created_at DESC LIMIT 1"
    );
    const lastBackup = backupRows.length > 0 ? backupRows[0].created_at : "Never";

    res.status(200).json({
      system: { status: "Online", description: "All systems operational" },
      database: { status: dbConnected ? "Connected" : "Disconnected", description: `Last backup: ${lastBackup}` },
      activeUsers: { value: String(activeUsers), description: "Users currently active" },
      storage: { value: "62%", description: "Storage currently used" },
    });
  } catch (error) {
    console.error("Get system status error:", error);
    res.status(500).json({ message: "Failed to fetch system status." });
  }
}

async function getActivities(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(
      "SELECT * FROM system_activities ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), offset]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Get activities error:", error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ message: "Settings tables not found. Please run the database migration." });
    }
    res.status(500).json({ message: "Failed to fetch activities." });
  }
}

async function logActivity(req, res) {
  try {
    const { activity, userName, details, ipAddress, userAgent, status } = req.body;
    const userId = req.user?.id || null;

    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, ip_address, user_agent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [activity, userId, userName, details, ipAddress || null, userAgent || null, status || "Success"]
    );

    res.status(201).json({ message: "Activity logged." });
  } catch (error) {
    console.error("Log activity error:", error);
    res.status(500).json({ message: "Failed to log activity." });
  }
}

module.exports = {
  getSettings,
  getSettingByKey,
  updateSettings,
  getSystemStatus,
  getActivities,
  logActivity,
};
