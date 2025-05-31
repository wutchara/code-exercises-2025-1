const express = require("express");
const router = express.Router();
const dbPool = require("../db");
const { getRoomById } = require("../services/roomService");
const { Status } = require("../utils/constants");

// Get all rooms or a specific room by ID, optionally with reservations
router.get("/", async (req, res) => {
  const { id, showReservation } = req.query;

  try {
    if (!id) {
      // Get all rooms
      const [rooms] = await dbPool.execute(
        "SELECT id, name, capacity FROM rooms"
      );
      return res.json({
        status: Status.SUCCESS,
        data: rooms,
      });
    } else {
      // Get a specific room by ID
      const room = await getRoomById(id);
      if (!room) {
        return res.status(404).json({
          status: Status.ERROR,
          message: `Room with ID ${id} not found.`,
        });
      }

      let reservationData = [];
      if (showReservation === "true") {
        const [bookings] = await dbPool.execute(
          "SELECT id, user_id, start_time, end_time, title FROM bookings WHERE room_id = ? ORDER BY start_time ASC",
          [id]
        );
        reservationData = bookings;
      }

      return res.json({
        status: Status.SUCCESS,
        data: room,
        reservations: reservationData,
      });
    }
  } catch (error) {
    console.error(`Error in GET /rooms (id: ${id}):`, error);
    return res.status(500).json({
      status: Status.ERROR,
      message: "An error occurred while fetching room data.",
      error: error.message,
    });
  }
});

module.exports = router;
