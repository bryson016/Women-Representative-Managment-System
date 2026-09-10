const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireMinRole } = require("../middleware/roleMiddleware");
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

// Image routes - read accessible to all authenticated users, write requires staff+
router.get("/images", authenticateToken, getImages);
router.get("/images/:id", authenticateToken, getImageById);
router.post("/images/upload", authenticateToken, requireMinRole("staff"), upload.array("files", 20), uploadImages);
router.put("/images/:id", authenticateToken, requireMinRole("staff"), updateImage);
router.delete("/images/:id", authenticateToken, requireMinRole("staff"), deleteImage);

// Category routes - read accessible to all, write requires staff+
router.get("/categories", authenticateToken, getCategories);
router.post("/categories", authenticateToken, requireMinRole("staff"), createCategory);
router.put("/categories/:id", authenticateToken, requireMinRole("staff"), updateCategory);
router.delete("/categories/:id", authenticateToken, requireMinRole("staff"), deleteCategory);

// Stats route - accessible to all authenticated users
router.get("/stats", authenticateToken, getImageStats);

module.exports = router;
