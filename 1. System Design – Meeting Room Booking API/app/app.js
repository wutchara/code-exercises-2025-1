require("dotenv").config();

// Import the Express module
const express = require("express");

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// --- Route Imports ---
const healthRoutes = require("./routes/healthRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
// Note: dbPool is now imported directly by services/routes that need it.
// dateUtils are imported by bookingRoutes.js

// Define a port for the server to listen on
const port = process.env.PORT || 3000;
// Constants (RoomStatus, Status, RecurringType) are now in utils/constants.js
// and imported by routes/services that need them.

// --- Routes ---
app.get("/", (req, res) => {
  res.send("Welcome to the Meeting Room Booking API!");
});

app.use("/health", healthRoutes);
app.use("/rooms", roomRoutes);
app.use("/reserve", bookingRoutes);

// Global error handler (optional, but good practice for unhandled errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message || err);
  res.status(500).json({
    status: "error",
    message: "An unexpected internal server error occurred.",
    // error: process.env.NODE_ENV === 'development' ? err.message : undefined // Only show error details in dev
  });
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
