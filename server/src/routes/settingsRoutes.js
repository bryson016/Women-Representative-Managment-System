const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireMinRole } = require("../middleware/roleMiddleware");
const {
  getSettings,
  getSettingByKey,
  updateSettings,
  getSystemStatus,
  getActivities,
  logActivity,
} = require("../controllers/settingsController");

const router = express.Router();

// Settings routes - admin and staff only
router.get("/settings", authenticateToken, requireMinRole("staff"), getSettings);
router.get("/settings/:key", authenticateToken, requireMinRole("staff"), getSettingByKey);
router.put("/settings", authenticateToken, requireMinRole("staff"), updateSettings);
router.get("/system-status", authenticateToken, requireMinRole("staff"), getSystemStatus);
router.get("/activities", authenticateToken, requireMinRole("staff"), getActivities);
router.post("/activities", authenticateToken, requireMinRole("staff"), logActivity);

module.exports = router;
