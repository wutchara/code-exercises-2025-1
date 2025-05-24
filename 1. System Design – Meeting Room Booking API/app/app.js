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

      result = {
        status: Status.SUCCESS,
        data: rows[0],
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

app.post("/reserve", (req, res) => {
  const result = {
    status: "success",
    reservation_ids: ["resv_1", "resv_2", "resv_3", "resv_4", "resv_5"],
  };
  res.json(result);
});

app.delete("/reserve", (req, res) => {
  res.send("DELETE request received for /reserve");
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
