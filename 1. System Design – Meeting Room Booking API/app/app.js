require("dotenv").config();

// Import the Express module
const express = require("express");

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const dbPool = require("./db"); // Import the database connection pool

// Define a port for the server to listen on
const port = 3000; // You can use any port that's not in use

const RoomStatus = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  UNAVAILABLE: "unavailable",
};

const Status = {
  SUCCESS: "success",
  ERROR: "error",
};

// Define a simple route for the homepage
app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});
// --- Health Check Endpoint ---
app.get("/health", async (req, res) => {
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

// Define a simple route for the homepage
// ... (rest of your app.js code)

async function getRoomById(id) {
  try {
    // Use pool.execute() for prepared statements (recommended for security)
    // or pool.query() for simple queries (less secure if not careful with user input)
    const [rows] = await dbPool.execute("SELECT * FROM rooms WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: Status.ERROR,
        message: "Room not found",
      });
    }

    return rows[0];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

// return all aviable rooms
app.get("/rooms", async (req, res) => {
  const id = req.query.id;
  const showReservation = req.query.showReservation == "true";
  let result;

  if (!id) {
    try {
      // Use pool.execute() for prepared statements (recommended for security)
      // or pool.query() for simple queries (less secure if not careful with user input)
      const [rows] = await dbPool.execute("SELECT * FROM rooms");
      const roomIds = rows.map((row) => row.id);

      // res.json(rows);
      result = {
        status: Status.SUCCESS,
        roomIds,
      };
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({
        status: Status.ERROR,
        message: "Error fetching rooms",
        error: error.message,
      });
    }
  } else {
    // show only the room with the given id
    try {
      let showReservationData = [];
      if (showReservation) {
        const [bookings] = await dbPool.execute(
          "SELECT * FROM bookings WHERE room_id = ? ORDER BY start_time ASC",
          [id]
        );
        showReservationData = bookings;
      }

      result = {
        status: Status.SUCCESS,
        data: await getRoomById(id),
        reservation: showReservationData,
      };
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({
        status: Status.ERROR,
        message: "Error fetching rooms",
        error: error.message,
      });
    }
  }

  res.json(result);
});

// Define the enum using a plain object
const RecurringType = Object.freeze({
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
});

// Helper function to determine effective start/end date from single string or array of strings
function getEffectiveDate(dateInput, findMin) {
  if (!dateInput) return null;

  const dates = (Array.isArray(dateInput) ? dateInput : [dateInput])
    .map((dStr) => new Date(dStr))
    .filter((d) => d instanceof Date && !isNaN(d.getTime())); // Filter out invalid dates

  if (dates.length === 0) {
    // This means input was provided, but all were invalid or the array was empty after filtering
    const wasProvided = Array.isArray(dateInput)
      ? dateInput.length > 0
      : !!dateInput;
    if (wasProvided) return "invalid_date_format"; // Special marker for invalid format
    return null; // No valid dates found from input
  }

  if (findMin) {
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  } else {
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }
}

const dayOfWeekMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Helper to safely add months to a date, handling day overflow
function addMonthsSafe(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // If the day changed, it means we overflowed (e.g., Jan 31 + 1 month became Mar 3 instead of Feb 28/29)
  // In such a case, set to the last day of the target month.
  if (d.getDate() !== originalDay) {
    d.setDate(0); // Sets to the last day of the previous month (which is the correct target month)
  }
  return d;
}

function moveToDayOfWeek(date, targetDayOfWeekJs) {
  // targetDayOfWeekJs is 0-6 (Sun-Sat)
  const d = new Date(date);
  const currentDayJs = d.getDay();
  let diff = (targetDayOfWeekJs - currentDayJs + 7) % 7; // Ensure positive difference for moving forward
  d.setDate(d.getDate() + diff);
  return d;
}

app.post("/reserve", async (req, res) => {
  const {
    room_id,
    user_id,
    start_time: raw_start_time,
    end_time: raw_end_time,
    recurring,
    title,
  } = req.body;

  if (!room_id || !user_id) {
    return res.status(400).json({
      status: Status.ERROR,
      message: "Missing required fields: room_id and user_id are required.",
    });
  }

  let bookingsToCreate = [];
  const isRecurringRequest =
    recurring &&
    recurring.type &&
    Object.values(RecurringType).includes(recurring.type);
  const isExplicitTimeRequest = raw_start_time && raw_end_time;

  try {
    if (isRecurringRequest) {
      // Example request
      //       {
      //     "room_id": "1",
      //     "user_id": 1,
      //     "start_time": "2025-05-31T10:00:00Z",
      //     "end_time": "2025-06-31T11:00:00Z",
      //     "recurring": {
      //         "type": "weekly",
      //         "day_of_week": "Monday",
      //         "count": 5
      //     }
      // }
      // --- Path 1: Recurring Booking ---
      console.log(
        "Processing recurring booking (logic not fully implemented):",
        recurring
      );
      // --- Path 1: Recurring Booking ---
      if (Array.isArray(raw_start_time) || Array.isArray(raw_end_time)) {
        return res.status(400).json({
          status: Status.ERROR,
          message:
            "For recurring bookings, start_time and end_time must be single date strings.",
        });
      }

      const templateStartTime = new Date(raw_start_time);
      const templateEndTime = new Date(raw_end_time);

      if (
        isNaN(templateStartTime.getTime()) ||
        isNaN(templateEndTime.getTime())
      ) {
        return res.status(400).json({
          status: Status.ERROR,
          message: "Invalid date format for recurring booking template.",
        });
      }

      if (templateStartTime >= templateEndTime) {
        return res.status(400).json({
          status: Status.ERROR,
          message:
            "Template start_time must be before template end_time for recurring bookings.",
        });
      }

      if (
        !recurring.count ||
        typeof recurring.count !== "number" ||
        recurring.count <= 0
      ) {
        return res.status(400).json({
          status: Status.ERROR,
          message: "Recurring bookings must have a valid positive 'count'.",
        });
      }

      const durationMilliseconds =
        templateEndTime.getTime() - templateStartTime.getTime();
      let currentEventStartTime = new Date(templateStartTime);

      for (let i = 0; i < recurring.count; i++) {
        let eventSpecificStartTime = new Date(currentEventStartTime);

        if (
          i === 0 &&
          recurring.type === RecurringType.WEEKLY &&
          recurring.day_of_week
        ) {
          const targetDayJs = dayOfWeekMap[recurring.day_of_week.toLowerCase()];
          if (typeof targetDayJs === "number") {
            eventSpecificStartTime = moveToDayOfWeek(
              eventSpecificStartTime,
              targetDayJs
            );
          } else {
            return res.status(400).json({
              status: Status.ERROR,
              message: `Invalid day_of_week: ${recurring.day_of_week}`,
            });
          }
        }

        const eventSpecificEndTime = new Date(
          eventSpecificStartTime.getTime() + durationMilliseconds
        );
        bookingsToCreate.push({
          room_id,
          user_id,
          start_time: eventSpecificStartTime,
          end_time: eventSpecificEndTime,
          title: title || null,
        });

        // Prepare start time for the *next* iteration
        if (i < recurring.count - 1) {
          // No need to calculate for the one after the last
          let nextIterationSeedTime = new Date(eventSpecificStartTime); // Use the (potentially adjusted) start time of the current event
          switch (recurring.type) {
            case RecurringType.DAILY:
              nextIterationSeedTime.setDate(
                nextIterationSeedTime.getDate() + 1
              );
              break;
            case RecurringType.WEEKLY:
              nextIterationSeedTime.setDate(
                nextIterationSeedTime.getDate() + 7
              );
              break;
            case RecurringType.MONTHLY:
              nextIterationSeedTime = addMonthsSafe(nextIterationSeedTime, 1);
              break;
            case RecurringType.YEARLY:
              nextIterationSeedTime.setFullYear(
                nextIterationSeedTime.getFullYear() + 1
              );
              break;
            default:
              // Should not happen due to earlier validation of recurring.type
              return res.status(500).json({
                status: Status.ERROR,
                message: "Invalid recurring type encountered.",
              });
          }
          currentEventStartTime = nextIterationSeedTime;
        }
      }
    } else if (isExplicitTimeRequest) {
      // --- Path 2: Explicit Time Booking (single slot from single dates or arrays) ---
      const effectiveStartTime = getEffectiveDate(raw_start_time, true);
      const effectiveEndTime = getEffectiveDate(raw_end_time, false);

      if (
        effectiveStartTime === "invalid_date_format" ||
        effectiveEndTime === "invalid_date_format"
      ) {
        return res.status(400).json({
          status: Status.ERROR,
          message: "Invalid date format in start_time or end_time.",
        });
      }
      if (!effectiveStartTime || !effectiveEndTime) {
        return res.status(400).json({
          status: Status.ERROR,
          message: "Valid start_time and end_time are required.",
        });
      }
      if (effectiveStartTime >= effectiveEndTime) {
        return res.status(400).json({
          status: Status.ERROR,
          message: "Effective start_time must be before effective end_time.",
        });
      }
      bookingsToCreate.push({
        room_id,
        user_id,
        start_time: effectiveStartTime,
        end_time: effectiveEndTime,
        title: title || null,
      });
    } else {
      // --- Path 3: Invalid parameters ---
      return res.status(400).json({
        status: Status.ERROR,
        message:
          "Invalid request: Provide either (start_time and end_time) or valid recurring details.",
      });
    }

    if (bookingsToCreate.length === 0) {
      // Should be caught by earlier logic, but as a safeguard
      return res.status(400).json({
        status: Status.ERROR,
        message: "No valid booking slots could be determined.",
      });
    }

    // Validate room existence
    const room = await getRoomById(room_id);
    if (!room) {
      return res.status(404).json({
        status: Status.ERROR,
        message: `Room with ID ${room_id} not found.`,
      });
    }

    // Insert bookings
    const reservationIds = [];
    // In a real app, for multiple bookings (from recurring), this loop should be wrapped in a transaction.
    for (const booking of bookingsToCreate) {
      const [dbResult] = await dbPool.execute(
        "INSERT INTO bookings (room_id, user_id, start_time, end_time, title) VALUES (?, ?, ?, ?, ?)",
        [
          booking.room_id,
          booking.user_id,
          booking.start_time,
          booking.end_time,
          booking.title,
        ]
      );
      reservationIds.push(dbResult.insertId);
    }

    res.status(201).json({
      // 201 Created
      status: Status.SUCCESS,
      message: "Booking(s) created successfully.",
      reservation_ids: reservationIds,
    });
  } catch (error) {
    console.error("Error processing reservation:", error);
    if (error.code === "ER_DUP_ENTRY") {
      // MySQL specific error for unique constraint
      return res.status(409).json({
        // 409 Conflict
        status: Status.ERROR,
        message:
          "Booking conflict: The room is already booked for the requested time or another constraint was violated.",
        error: error.message,
      });
    }
    res.status(500).json({
      status: Status.ERROR,
      message: "Failed to create reservation.",
      error: error.message,
    });
  }
});

app.delete("/reserve/:id", async (req, res) => {
  const reservationId = req.params.id;

  // Validate if reservationId is a number
  if (isNaN(parseInt(reservationId, 10))) {
    return res.status(400).json({
      status: Status.ERROR,
      message: "Invalid reservation ID format. ID must be a number.",
    });
  }

  try {
    const [result] = await dbPool.execute("DELETE FROM bookings WHERE id = ?", [
      reservationId,
    ]);

    if (result.affectedRows === 0) {
      // No booking found with that ID
      return res.status(404).json({
        status: Status.ERROR,
        message: `Reservation with ID ${reservationId} not found.`,
      });
    }

    // Successfully deleted
    res.status(200).json({
      // Or 204 No Content if you prefer not to send a body
      status: Status.SUCCESS,
      message: `Reservation with ID ${reservationId} deleted successfully.`,
    });
  } catch (error) {
    console.error(
      `Error deleting reservation with ID ${reservationId}:`,
      error
    );
    res.status(500).json({
      status: Status.ERROR,
      message: "Failed to delete reservation.",
      error: error.message,
    });
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
