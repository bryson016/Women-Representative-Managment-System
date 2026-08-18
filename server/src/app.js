const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const bursaryRoutes = require("./routes/bursaryRoutes");
const imageRoutes = require("./routes/imageRoutes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/protected", settingsRoutes);
app.use("/api/protected", uploadRoutes);
app.use("/api/protected", imageRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/bursary", bursaryRoutes);

app.use((err, req, res, next) => {
  return res.status(500).json({ message: "Internal server error." });
});

module.exports = app;
