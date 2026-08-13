const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getSettings,
  getSettingByKey,
  updateSettings,
  getSystemStatus,
  getActivities,
  logActivity,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/settings", authenticateToken, getSettings);
router.get("/settings/:key", authenticateToken, getSettingByKey);
router.put("/settings", authenticateToken, updateSettings);
router.get("/system-status", authenticateToken, getSystemStatus);
router.get("/activities", authenticateToken, getActivities);
router.post("/activities", authenticateToken, logActivity);

module.exports = router;
