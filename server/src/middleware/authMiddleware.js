const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function isUserActive(userId) {
  try {
    const sql = `SELECT is_active FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [userId]);
    return rows.length > 0 ? rows[0].is_active : false;
  } catch (err) {
    console.error("Error checking user active status:", err.message);
    return false;
  }
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is still active
    const active = await isUserActive(decoded.id);
    if (!active) {
      return res.status(403).json({ message: "Account is inactive. Contact administrator." });
    }
    
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized." });
  }
}

module.exports = {
  authenticateToken,
  isUserActive,
};
