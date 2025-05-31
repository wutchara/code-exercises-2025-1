const RoomStatus = Object.freeze({
  AVAILABLE: "available",
  RESERVED: "reserved",
  UNAVAILABLE: "unavailable",
});

const Status = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
});

const RecurringType = Object.freeze({
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
});

module.exports = {
  RoomStatus,
  Status,
  RecurringType,
};
