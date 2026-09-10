const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireMinRole } = require("../middleware/roleMiddleware");
const multer = require("multer");
const {
  uploadImage,
  deleteImage,
  getMedia,
} = require("../controllers/uploadController");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, WebP and SVG are allowed."));
    }
  },
});

// Upload routes - admin and staff only
router.post("/upload", authenticateToken, requireMinRole("staff"), upload.single("file"), uploadImage);
router.delete("/upload/:publicId", authenticateToken, requireMinRole("staff"), deleteImage);
router.get("/media", authenticateToken, requireMinRole("staff"), getMedia);

module.exports = router;
