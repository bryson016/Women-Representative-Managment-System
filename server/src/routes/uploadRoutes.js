const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
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

router.post("/upload", authenticateToken, upload.single("file"), uploadImage);
router.delete("/upload/:publicId", authenticateToken, deleteImage);
router.get("/media", authenticateToken, getMedia);

module.exports = router;
