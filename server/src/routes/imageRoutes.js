const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const {
  uploadImages,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getImageStats,
} = require("../controllers/imageController");

const router = express.Router();

// Configure multer for memory storage (supports multiple files)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 20, // Max 20 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed."));
    }
  },
});

// Image routes
router.post("/images/upload", authenticateToken, upload.array("files", 20), uploadImages);
router.get("/images", authenticateToken, getImages);
router.get("/images/:id", authenticateToken, getImageById);
router.put("/images/:id", authenticateToken, updateImage);
router.delete("/images/:id", authenticateToken, deleteImage);

// Category routes
router.get("/categories", authenticateToken, getCategories);
router.post("/categories", authenticateToken, createCategory);
router.put("/categories/:id", authenticateToken, updateCategory);
router.delete("/categories/:id", authenticateToken, deleteCategory);

// Stats route
router.get("/stats", authenticateToken, getImageStats);

module.exports = router;
