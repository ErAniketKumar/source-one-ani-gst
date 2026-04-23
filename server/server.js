require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDataBase = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const gstRoutes = require("./routes/gstRoutes");
const filingRoutes = require("./routes/filingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/gst", gstRoutes);
app.use("/api/filing", filingRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "GST API is running.", timestamp: new Date() });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDataBase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${process.env.HOST}:${PORT}`);
  });
});