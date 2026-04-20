"use strict";

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");
const sensitiveBodyLog = require("./middlewares/sensitiveBodyLog");

const authRoutes = require("./routes/auth.routes");
const psychologistRoutes = require("./routes/psychologist.routes");
const availabilityRoutes = require("./routes/availability.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const adminRoutes = require("./routes/admin.routes");
const keyRoutes = require("./routes/key.routes");
const noteRoutes = require("./routes/note.routes");
const blogRoutes = require("./routes/blog.routes");

const app = express();

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'none'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
const {
  authLimiter,
  slotLimiter,
  searchLimiter,
} = require("./middlewares/rateLimiters");

// Logging
app.use(
  process.env.NODE_ENV !== "production" ? morgan("dev") : morgan("combined"),
);

// Body parsing — 64kb: E2E note ciphertext için yeterli, DoS'a karşı koruma
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(sensitiveBodyLog);

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/psychologists", psychologistRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/blog", blogRoutes);

// Static uploads (avatars, documents, blog covers)
app.use(
  "/uploads",
  (req, res, next) => {
    // Resim/PDF'ler public; cross-origin'e izin ver
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"), {
    maxAge: "7d",
    fallthrough: false,
  }),
);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint bulunamadı" });
});

// Error handler (en sona)
app.use(errorHandler);

module.exports = app;
