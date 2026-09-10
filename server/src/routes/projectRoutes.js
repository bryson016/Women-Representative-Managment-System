const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireMinRole } = require("../middleware/roleMiddleware");
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// All project routes require authentication
router.use(authenticateToken);

// Public read access for all authenticated users (citizens can view projects)
router.get("/", getAllProjects);
router.get("/:id", getProjectById);

// Write operations require staff or higher
router.post("/", requireMinRole("staff"), createProject);
router.put("/:id", requireMinRole("staff"), updateProject);
router.delete("/:id", requireMinRole("admin"), deleteProject);

module.exports = router;
