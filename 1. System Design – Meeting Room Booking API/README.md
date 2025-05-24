## 🔧 1. System Design – Meeting Room Booking API

### Problem
Design and implement an API for a meeting room reservation system.

### Requirements
- Multiple rooms with different names/sizes
- Prevent overlapping reservations
- Support recurring meetings (e.g., every Monday at 9:00)
- Query available rooms for a specific time range

<br />

### Example Input
```json
POST /reserve
{
  "room_id": "A101",
  "start_time": "2025-06-01T09:00:00Z",
  "end_time": "2025-06-01T10:00:00Z",
  "recurring": {
    "type": "weekly",
    "day_of_week": "Monday",
    "count": 5
  }
}
```

<br />

### Example Output
```json
{
  "status": "success",
  "reservation_ids": ["resv_1", "resv_2", "resv_3", "resv_4", "resv_5"]
}
```

<br />

### Skills Practiced
- REST API design
- Time conflict resolution
- Data modeling
- Timezone and edge case handling