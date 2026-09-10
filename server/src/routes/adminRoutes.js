const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole, isAdmin } = require("../middleware/roleMiddleware");
const {
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllCitizens,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDashboardStats,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRole(["admin", "super_admin"]));

// Dashboard Stats
router.get("/dashboard/stats", getDashboardStats);

// Complaints
router.get("/complaints", getAllComplaints);
router.get("/complaints/:id", getComplaintById);
router.put("/complaints/:id/status", updateComplaintStatus);

// Citizens
router.get("/citizens", getAllCitizens);

// Notifications
router.get("/notifications", getAllNotifications);
router.put("/notifications/:id/read", markNotificationAsRead);
router.put("/notifications/read-all", markAllNotificationsAsRead);

module.exports = router;
