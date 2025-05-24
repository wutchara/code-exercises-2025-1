const mysql = require("mysql2/promise"); // Import the promise-based API

// --- Database Connection Configuration ---
// It's highly recommended to use environment variables for credentials.
// For Docker Compose, these will come from your .env file and Dockerfile/docker-compose.yml
const dbConfig = {
  host: process.env.DB_HOST || "localhost", // Hostname for the database (e.g., 'db' for Docker Compose)
  user: process.env.DB_USER || "root", // Database username
  password: process.env.DB_PASSWORD || "password", // Database password
  database: process.env.DB_NAME || "testdb", // Database name
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Database port
  waitForConnections: true, // Whether to wait for connections to become available
  connectionLimit: 10, // Max number of connections in the pool
  queueLimit: 0, // Max number of requests the pool will queue
};

// Create a connection pool
// A pool is more efficient for Express apps as it reuses connections
const pool = mysql.createPool(dbConfig);

// Optional: Test the connection when the application starts
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL database!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error.message);
    // In a real application, you might want to exit here or implement
    // a more robust retry mechanism, especially during startup.
    // process.exit(1);
  }
}

testDbConnection(); // Call the test function

module.exports = pool; // Export the pool for use in other parts of your app
