const express = require("express");
const router = express.Router();
const dbPool = require("../db");
const { getRoomById } = require("../services/roomService");
const { checkBookingConflict } = require("../services/bookingService");
const { Status, RecurringType } = require("../utils/constants");
const {
  dayOfWeekMap,
  getEffectiveDate,
  addMonthsSafe,
  moveToDayOfWeek,
} = require("../utils/dateUtils");

router.post("/", async (req, res) => {
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
  let connection; // For transaction management

  try {
    const room = await getRoomById(room_id);
    if (!room) {
      return res.status(404).json({
        status: Status.ERROR,
        message: `Room with ID ${room_id} not found.`,
      });
    }

    if (isRecurringRequest) {
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
        return res
          .status(400)
          .json({
            status: Status.ERROR,
            message: "Invalid date format for recurring booking template.",
          });
      }
      if (templateStartTime >= templateEndTime) {
        return res
          .status(400)
          .json({
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
        return res
          .status(400)
          .json({
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
            return res
              .status(400)
              .json({
                status: Status.ERROR,
                message: `Invalid day_of_week: ${recurring.day_of_week}`,
              });
          }
        }
        const eventSpecificEndTime = new Date(
          eventSpecificStartTime.getTime() + durationMilliseconds
        );

        const conflict = await checkBookingConflict(
          room_id,
          eventSpecificStartTime,
          eventSpecificEndTime
        );
        if (conflict) {
          return res.status(409).json({
            // 409 Conflict
            status: Status.ERROR,
            message: `Booking conflict detected for recurring slot starting at ${eventSpecificStartTime.toISOString()} in room ${room_id}.`,
          });
        }
        bookingsToCreate.push({
          room_id,
          user_id,
          start_time: eventSpecificStartTime,
          end_time: eventSpecificEndTime,
          title: title || null,
        });

        if (i < recurring.count - 1) {
          let nextIterationSeedTime = new Date(eventSpecificStartTime);
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
              return res
                .status(500)
                .json({
                  status: Status.ERROR,
                  message: "Invalid recurring type encountered.",
                });
          }
          currentEventStartTime = nextIterationSeedTime;
        }
      }
    } else if (isExplicitTimeRequest) {
      const effectiveStartTime = getEffectiveDate(raw_start_time, true);
      const effectiveEndTime = getEffectiveDate(raw_end_time, false);
      if (
        effectiveStartTime === "invalid_date_format" ||
        effectiveEndTime === "invalid_date_format"
      ) {
        return res
          .status(400)
          .json({
            status: Status.ERROR,
            message: "Invalid date format in start_time or end_time.",
          });
      }
      if (!effectiveStartTime || !effectiveEndTime) {
        return res
          .status(400)
          .json({
            status: Status.ERROR,
            message: "Valid start_time and end_time are required.",
          });
      }
      if (effectiveStartTime >= effectiveEndTime) {
        return res
          .status(400)
          .json({
            status: Status.ERROR,
            message: "Effective start_time must be before effective end_time.",
          });
      }
      const conflict = await checkBookingConflict(
        room_id,
        effectiveStartTime,
        effectiveEndTime
      );
      if (conflict) {
        return res.status(409).json({
          // 409 Conflict
          status: Status.ERROR,
          message: `Booking conflict: Room ${room_id} is already booked from ${effectiveStartTime.toISOString()} to ${effectiveEndTime.toISOString()}.`,
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
      return res
        .status(400)
        .json({
          status: Status.ERROR,
          message:
            "Invalid request: Provide either (start_time and end_time) or valid recurring details.",
        });
    }

    if (bookingsToCreate.length === 0) {
      return res
        .status(400)
        .json({
          status: Status.ERROR,
          message: "No valid booking slots could be determined.",
        });
    }

    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const reservationIds = [];
    for (const booking of bookingsToCreate) {
      const [dbResult] = await connection.execute(
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

    await connection.commit();

    return res.status(201).json({
      status: Status.SUCCESS,
      message: "Booking(s) created successfully.",
      reservation_ids: reservationIds,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error processing reservation:", error);
    if (
      error.code === "ER_DUP_ENTRY" ||
      error.message.includes("Booking conflict")
    ) {
      return res.status(409).json({
        status: Status.ERROR,
        message: error.message.includes("Booking conflict")
          ? error.message
          : "Booking conflict: The room is already booked for the requested time or another constraint was violated.",
        error: error.message,
      });
    }
    return res.status(500).json({
      status: Status.ERROR,
      message: "Failed to create reservation.",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

router.delete("/:id", async (req, res) => {
  const reservationId = req.params.id;
  if (isNaN(parseInt(reservationId, 10))) {
    return res
      .status(400)
      .json({
        status: Status.ERROR,
        message: "Invalid reservation ID format. ID must be a number.",
      });
  }
  try {
    const [result] = await dbPool.execute("DELETE FROM bookings WHERE id = ?", [
      reservationId,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          status: Status.ERROR,
          message: `Reservation with ID ${reservationId} not found.`,
        });
    }
    return res
      .status(200)
      .json({
        status: Status.SUCCESS,
        message: `Reservation with ID ${reservationId} deleted successfully.`,
      });
  } catch (error) {
    console.error(
      `Error deleting reservation with ID ${reservationId}:`,
      error
    );
    return res
      .status(500)
      .json({
        status: Status.ERROR,
        message: "Failed to delete reservation.",
        error: error.message,
      });
  }
});

module.exports = router;
