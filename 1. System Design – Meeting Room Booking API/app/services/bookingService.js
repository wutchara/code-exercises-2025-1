const dbPool = require("../db");

async function checkBookingConflict(
  roomId,
  startTime,
  endTime,
  existingBookingId = null
) {
  // Ensure startTime and endTime are Date objects
  const start = new Date(startTime);
  const end = new Date(endTime);

  let query = `
    SELECT id
    FROM bookings
    WHERE room_id = ?
      AND NOT (end_time <= ? OR start_time >= ?) 
  `; // This logic correctly finds overlaps
  const params = [roomId, start, end];

  if (existingBookingId) {
    query += " AND id != ?";
    params.push(existingBookingId);
  }

  const [conflictingBookings] = await dbPool.execute(query, params);
  return conflictingBookings.length > 0;
}

module.exports = { checkBookingConflict };