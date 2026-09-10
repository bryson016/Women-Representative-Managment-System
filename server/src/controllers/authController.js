const { authenticateUser, registerUser, fallbackAuthenticate } = require("../services/authService");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    let authResult = await authenticateUser(username, password);

    // Fallback for when database is unavailable
    if (!authResult.success && authResult.reason === "database_error") {
      console.warn("Database unavailable, attempting fallback authentication.");
      authResult = await fallbackAuthenticate(username, password);
    }

    if (!authResult.success) {
      if (authResult.reason === "not_found") {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      if (authResult.reason === "no_password") {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      if (authResult.reason === "invalid_password") {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      return res.status(401).json({ message: "Invalid username or password." });
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
    const { username, fullName, password } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({ message: "Username, full name, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const result = await registerUser({ username, fullName, password, role: "citizen" });

    if (!result) {
      return res.status(409).json({ message: "Username already exists." });
    }

    return res.status(201).json({ message: "Account created successfully." });
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
