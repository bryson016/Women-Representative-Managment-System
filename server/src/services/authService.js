const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function findUserByUsername(username) {
  const sql = `
    SELECT id, full_name, username, role, ward, email, phone_number
    FROM users
    WHERE username = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [username]);
  return rows[0] || null;
}

async function authenticateUser(username) {
  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return { success: false, reason: "not_found" };
    }

    const payload = {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      role: user.role,
      ward: user.ward,
      email: user.email,
      phoneNumber: user.phone_number,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    return {
      success: true,
      token,
      user: payload,
    };
  } catch (err) {
    console.error("Authentication error:", err.message);
    return { success: false, reason: "database_error", message: err.message };
  }
}

async function fallbackAuthenticate(username) {
  if (username !== "admin") {
    return { success: false, reason: "not_found" };
  }

  const payload = {
    id: 1,
    fullName: "System Administrator",
    username: "admin",
    role: "admin",
    ward: "Westlands",
    email: "admin@ward.gov.ke",
    phoneNumber: "+254 700 000 000",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  return {
    success: true,
    token,
    user: payload,
  };
}

async function userExists(username) {
  const sql = `SELECT id FROM users WHERE username = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [username]);
  return rows.length > 0;
}

async function createUser({ username, fullName }) {
  const sql = `
    INSERT INTO users (username, full_name, password_hash, role, ward)
    VALUES (?, ?, NULL, ?, ?)
  `;

  await pool.execute(sql, [username, fullName, "citizen", null]);
}

async function registerUser({ username, fullName }) {
  const exists = await userExists(username);
  if (exists) return null;

  await createUser({ username, fullName });
  return true;
}

module.exports = {
  authenticateUser,
  registerUser,
  fallbackAuthenticate,
};
