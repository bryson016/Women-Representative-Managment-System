const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const multer = require("multer");
const {
  getAllApplications,
  getApplicationById,
  getMyApplications,
  getMyApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  deleteDraftApplication,
  withdrawApplication,
  exportApplications,
  uploadDocument,
  deleteDocument,
  getBursaryStats,
  getBursaryReports,
  getBeneficiaries,
  getPayments,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/bursaryController");

const router = express.Router();

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP, DOC, DOCX."));
    }
  },
});

// Admin/Staff routes
router.get("/applications", authenticateToken, requireRole(["admin", "officer", "staff"]), getAllApplications);
router.get("/export", authenticateToken, requireRole(["admin", "officer", "staff"]), exportApplications);
router.get("/applications/:id", authenticateToken, requireRole(["admin", "officer", "staff"]), getApplicationById);
router.put("/applications/:id", authenticateToken, requireRole(["admin", "officer", "staff"]), updateApplication);
router.put("/applications/:id/status", authenticateToken, requireRole(["admin", "officer", "staff"]), updateApplicationStatus);
router.delete("/applications/:id", authenticateToken, requireRole(["admin"]), deleteApplication);
router.post("/applications/:id/documents", authenticateToken, upload.single("file"), uploadDocument);
router.delete("/applications/:id/documents/:documentId", authenticateToken, deleteDocument);
router.get("/stats", authenticateToken, requireRole(["admin", "officer", "staff"]), getBursaryStats);
router.get("/reports", authenticateToken, requireRole(["admin", "officer", "staff"]), getBursaryReports);

// Beneficiaries
router.get("/beneficiaries", authenticateToken, requireRole(["admin", "officer", "staff"]), getBeneficiaries);

// Payments
router.get("/payments", authenticateToken, requireRole(["admin", "officer", "staff"]), getPayments);

// Programs
router.get("/programs", authenticateToken, requireRole(["admin", "officer", "staff"]), getPrograms);
router.post("/programs", authenticateToken, requireRole(["admin", "officer"]), createProgram);
router.put("/programs/:id", authenticateToken, requireRole(["admin", "officer"]), updateProgram);
router.delete("/programs/:id", authenticateToken, requireRole(["admin"]), deleteProgram);

// Notifications
router.get("/notifications", authenticateToken, getNotifications);
router.put("/notifications/:id/read", authenticateToken, markNotificationAsRead);

// Citizen routes
router.get("/my-applications", authenticateToken, requireRole(["citizen"]), getMyApplications);
router.get("/my-applications/:id", authenticateToken, requireRole(["citizen"]), getMyApplicationById);
router.post("/applications", authenticateToken, requireRole(["citizen"]), createApplication);
router.put("/my-applications/:id", authenticateToken, requireRole(["citizen"]), updateApplication);
router.put("/my-applications/:id/withdraw", authenticateToken, requireRole(["citizen"]), withdrawApplication);
router.delete("/my-applications/:id", authenticateToken, requireRole(["citizen"]), deleteDraftApplication);

module.exports = router;
