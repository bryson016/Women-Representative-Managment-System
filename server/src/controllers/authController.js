const { authenticateUser, registerUser, fallbackAuthenticate } = require("../services/authService");

async function login(req, res) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    let authResult = await authenticateUser(username);

    // Fallback for when database is unavailable
    if (!authResult.success && authResult.reason === "database_error") {
      console.warn("Database unavailable, attempting fallback authentication.");
      authResult = await fallbackAuthenticate(username);
    }

    if (!authResult.success) {
      return res.status(401).json({ message: "Invalid username." });
    }

    return res.status(200).json(authResult);
  } catch (error) {
    console.error("Login error:", {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });
    return res.status(500).json({ message: "Authentication failed." });
  }
}

async function register(req, res) {
  try {
    const { username, fullName } = req.body;

    if (!username || !fullName) {
      return res.status(400).json({ message: "Username and full name are required." });
    }

    const result = await registerUser({ username, fullName });

    if (!result) {
      return res.status(409).json({ message: "Username already exists." });
    }

    return res.status(201).json({ message: "Account created." });
  } catch (error) {
    // Helps diagnose issues like schema/column mismatches (server-side only; never expose internals to client)
    console.error("Registration error:", {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });

    // MySQL duplicate key
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exists." });
    }

    return res.status(500).json({ message: "Registration failed." });
  }
}

module.exports = {
  login,
  register,
};
