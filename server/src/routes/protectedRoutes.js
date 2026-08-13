const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
