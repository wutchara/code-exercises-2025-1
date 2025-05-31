const express = require("express");
const router = express.Router();
const dbPool = require("../db");
const { Status } = require("../utils/constants");

router.get("/", async (req, res) => {
  try {
    // Check database connectivity
    const connection = await dbPool.getConnection();
    await connection.ping(); // Simple command to check if connection is alive
    connection.release(); // Release the connection back to the pool

    res.status(200).json({
      status: Status.SUCCESS,
      message: "Application is healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({
      status: Status.ERROR,
      message: "Application is unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;