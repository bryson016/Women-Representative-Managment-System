require("dotenv").config();
const app = require("./app");
const initDatabase = require("./config/initDb");

const DEFAULT_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = 10;

async function startServer(port = DEFAULT_PORT, attempt = 1) {
  // Try to ensure the database exists (creates it from schema.sql if missing).
  // This retries so the server can be started right after XAMPP MySQL.
  // If the DB is unreachable, we still start the API server so login can
  // fall back to the built-in admin account instead of failing completely.
  const dbReady = await initDatabase();

  if (!dbReady) {
    console.warn(
      "WARNING: Could not connect to MySQL. Starting server with fallback authentication (admin/Admin@123)."
    );
  } else {
    console.log("Database connected successfully.");
  }

  const server = app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (attempt >= MAX_PORT_ATTEMPTS) {
        console.error(
          `ERROR: Ports ${DEFAULT_PORT}-${port} are all in use. Could not start server.`
        );
        process.exit(1);
      }
      console.warn(
        `WARNING: Port ${port} is already in use. Trying port ${port + 1}...`
      );
      startServer(port + 1, attempt + 1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer();

