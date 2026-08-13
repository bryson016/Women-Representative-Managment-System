const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getCitizenProfile,
  updateCitizenProfile,
  getCitizenComplaints,
  getCitizenComplaintDetails,
  submitComplaint,
  getWardProjects,
  getWardMeetings,
  getAnnouncements,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/citizenController");

const router = express.Router();

// Citizen Profile - citizens only
router.get("/profile", authenticateToken, requireRole(["citizen"]), getCitizenProfile);
router.put("/profile", authenticateToken, requireRole(["citizen"]), updateCitizenProfile);

// Citizen Complaints - citizens only
router.get("/complaints", authenticateToken, requireRole(["citizen"]), getCitizenComplaints);
router.get("/complaints/:id", authenticateToken, requireRole(["citizen"]), getCitizenComplaintDetails);
router.post("/complaints", authenticateToken, requireRole(["citizen"]), submitComplaint);

// Ward Projects (public view for citizens and staff/admin)
router.get("/projects", authenticateToken, getWardProjects);

// Ward Meetings (public view for citizens and staff/admin)
router.get("/meetings", authenticateToken, getWardMeetings);

// Announcements (public view for citizens and staff/admin)
router.get("/announcements", authenticateToken, getAnnouncements);

// Notifications - citizens only
router.get("/notifications", authenticateToken, requireRole(["citizen"]), getNotifications);
router.put("/notifications/:id/read", authenticateToken, requireRole(["citizen"]), markNotificationAsRead);
router.put("/notifications/read-all", authenticateToken, requireRole(["citizen"]), markAllNotificationsAsRead);

module.exports = router;
