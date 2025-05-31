const dayOfWeekMap = Object.freeze({
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
});

function getEffectiveDate(dateInput, findMin) {
  if (!dateInput) return null;

  const dates = (Array.isArray(dateInput) ? dateInput : [dateInput])
    .map((dStr) => new Date(dStr))
    .filter((d) => d instanceof Date && !isNaN(d.getTime()));

  if (dates.length === 0) {
    const wasProvided = Array.isArray(dateInput)
      ? dateInput.length > 0
      : !!dateInput;
    if (wasProvided) return "invalid_date_format";
    return null;
  }

  return findMin
    ? new Date(Math.min(...dates.map((d) => d.getTime())))
    : new Date(Math.max(...dates.map((d) => d.getTime())));
}

function addMonthsSafe(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== originalDay) {
    d.setDate(0);
  }
  return d;
}

function moveToDayOfWeek(date, targetDayOfWeekJs) {
  const d = new Date(date);
  const currentDayJs = d.getDay();
  d.setDate(d.getDate() + ((targetDayOfWeekJs - currentDayJs + 7) % 7));
  return d;
}

module.exports = {
  dayOfWeekMap,
  getEffectiveDate,
  addMonthsSafe,
  moveToDayOfWeek,
};
