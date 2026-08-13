const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function findUserByUsername(username) {
  const sql = `
    SELECT id, full_name, username, password_hash, role, ward, email, phone_number
    FROM users
    WHERE username = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [username]);
  return rows[0] || null;
}

async function authenticateUser(username, password) {
  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return null;
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
    return null;
  }
}

async function userExists(username) {
  const sql = `SELECT id FROM users WHERE username = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [username]);
  return rows.length > 0;
}

async function createUser({ username, fullName, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (username, full_name, password_hash, role, ward)
    VALUES (?, ?, ?, ?, ?)
  `;

  await pool.execute(sql, [username, fullName, passwordHash, "citizen", null]);
}

async function registerUser({ username, fullName, password }) {
  const exists = await userExists(username);
  if (exists) return null;

  await createUser({ username, fullName, password });
  return true;
}

module.exports = {
  authenticateUser,
  registerUser,
};
