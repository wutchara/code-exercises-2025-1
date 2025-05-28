require("dotenv").config();

// Import the Express module
const express = require("express");

// Create an Express application
const app = express();

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
      result = {
        status: Status.SUCCESS,
        data: getRoomById(id),
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

app.post("/reserve", async (req, res) => {
  let result = {
    status: Status.ERROR,
    message: "Invalid request",
  };

  const roomId = req.body.room_id;

  let useDate = false;

  //   {
  //   "room_id": "A101",
  //   "start_time": "2025-06-01T09:00:00Z",
  //   "end_time": "2025-06-01T10:00:00Z",
  //   "recurring": {
  //     "type": "weekly",
  //     "day_of_week": "Monday",
  //     "count": 5
  //   }
  // }
  const body = req.body;
  console.log("body", body);

  let startDate;
  let endDate;

  if (body.startDate && body.endDate) {
    useDate = true;
    startDate = new Date(body.startDate);
    endDate = new Date(body.endDate);
    console.log("startDate", startDate);
    console.log("endDate", endDate);
  } else {
    // TODO:
    useDate = false;

    // find startDate and endDate from body.recurring
    const recurring = body.recurring;
  }

  // validate startDate and endDate
  if (startDate >= endDate) {
    result.message = "Invalid date range";
  } else {
    // validate roomId from request and database
    try {
      const room = getRoomById(roomId);
      if (!room) {
        result.message = "Invalid room id";
      }

      try {
        // insert data into bookings database
        const [rows] = await dbPool.execute(
          "INSERT INTO bookings (room_id, user_id, start_time, end_time) VALUES (?, ?, ?, ?)",
          [roomId, 1, startDate, endDate]
        );
        console.log("rows", rows);

        result = {
          status: Status.SUCCESS,
          reservation_ids: [rows.insertId],
        };
      } catch (error) {
        console.error("Error fetching rooms:", error);
        result.message = error.message;
      }
    } catch (error) {
      result.message = "Invalid room id";
    }
  }

  res.json(result);
  return;
});

app.delete("/reserve", (req, res) => {
  res.send("DELETE request received for /reserve");
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
