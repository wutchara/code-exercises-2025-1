const dbPool = require("../db");

async function getRoomById(id) {
  try {
    const [rows] = await dbPool.execute(
      "SELECT id, name, capacity, created_at FROM rooms WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching room by id ${id}:`, error);
    throw error; // Re-throw for the route handler to catch
  }
}

module.exports = {
  getRoomById,
};
