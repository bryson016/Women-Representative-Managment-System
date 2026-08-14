const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const multer = require("multer");
const {
  getAllApplications,
  getApplicationById,
  getMyApplications,
  createApplication,
  updateApplicationStatus,
  uploadDocument,
  deleteDocument,
  getBursaryStats,
  getBursaryReports,
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
router.get("/applications/:id", authenticateToken, requireRole(["admin", "officer", "staff"]), getApplicationById);
router.put("/applications/:id/status", authenticateToken, requireRole(["admin", "officer", "staff"]), updateApplicationStatus);
router.post("/applications/:id/documents", authenticateToken, upload.single("file"), uploadDocument);
router.delete("/applications/:id/documents/:documentId", authenticateToken, deleteDocument);
router.get("/stats", authenticateToken, requireRole(["admin", "officer", "staff"]), getBursaryStats);
router.get("/reports", authenticateToken, requireRole(["admin", "officer", "staff"]), getBursaryReports);

// Citizen routes
router.get("/my-applications", authenticateToken, requireRole(["citizen"]), getMyApplications);
router.post("/applications", authenticateToken, requireRole(["citizen"]), createApplication);

module.exports = router;
