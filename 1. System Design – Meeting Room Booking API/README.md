## 🔧 1. System Design – Meeting Room Booking API

### Problem

Design and implement an API for a meeting room reservation system.

### Requirements

- Multiple rooms with different names/sizes
- Prevent overlapping reservations
- Support recurring meetings (e.g., every Monday at 9:00)
- Query available rooms for a specific time range

<br />

## 📖 Overview

This project is a RESTful API for a meeting room reservation system. It allows users to:

- View available meeting rooms.
- Check room details and capacity.
- Book rooms for specific time slots.
- Create recurring bookings (e.g., daily, weekly, monthly).
- View existing reservations for a room.
- Delete reservations.

The system is built using Node.js and Express.js, with a MySQL database for data persistence.

<br />

## 🛠️ Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Node.js (v14 or later recommended)
- npm (Node Package Manager)

### 1. Database Setup (MySQL with Docker)

This project uses MySQL as its database. You can easily set it up locally using Docker:

```bash
# 1. Start the MySQL database container
docker run --name=mysql_db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=building_db -p 3306:3306 -d mysql

# 2. (Optional) Start phpMyAdmin for database management
# This links to the MySQL container started above.
docker run --name myadmin -d --link mysql_db:db -p 8081:80 phpmyadmin/phpmyadmin
```

After running these commands:

- Your MySQL database will be accessible on `localhost:3306`.
- The root password is `root`.
- A database named `building_db` will be created.
- If you started phpMyAdmin, it will be accessible at `http://localhost:8081`. You can log in with server `db`, username `root`, and password `root`.

### 2. Initialize Database Schema

The database schema (tables for rooms and bookings) needs to be created. The SQL script for this is typically located in `database/init_db/01-schema.sql`. You can run this script against your `building_db` using a MySQL client or phpMyAdmin.

_(Self-note: The prompt implies the schema script is present and used, but its execution method isn't detailed in the provided files. For a complete README, one would typically include instructions on how to run this schema script, e.g., by connecting via a MySQL client or using Docker to execute it.)_

### 3. Application Setup

Navigate to the application directory:

```bash
cd app
```

Create a `.env` file in the `app` directory with your database credentials and other configurations:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=building_db
DB_PORT=3306
PORT=3000
```

Install the project dependencies:

```bash
npm install
```

### 4. Running the Application

Start the Node.js server:

```bash
npm start
```

If you don't have a `start` script in your `package.json`, you can run:

```bash
node app.js
```

The API server will typically start on `http://localhost:3000` (or the port specified in your `.env` file).

### 5. Running the phpMyAdmin

Start php ui for explor database

```
http://localhost:8081/
```

<br />

## 📊 Database Schema

The system uses two main tables:

### `rooms` Table

| Column       | Type           | Constraints                  | Description                     |
| ------------ | -------------- | ---------------------------- | ------------------------------- |
| `id`         | `INT`          | `AUTO_INCREMENT PRIMARY KEY` | Unique identifier for the room. |
| `name`       | `VARCHAR(255)` | `NOT NULL UNIQUE`            | Name of the meeting room.       |
| `capacity`   | `INT`          | `NOT NULL`                   | Maximum capacity of the room.   |
| `created_at` | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`  | Timestamp of room creation.     |

### `bookings` Table

| Column       | Type           | Constraints                                                              | Description                          |
| ------------ | -------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| `id`         | `INT`          | `AUTO_INCREMENT PRIMARY KEY`                                             | Unique identifier for the booking.   |
| `room_id`    | `INT`          | `NOT NULL, FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE` | ID of the booked room.               |
| `user_id`    | `INT`          | `NOT NULL`                                                               | ID of the user making the booking.   |
| `start_time` | `DATETIME`     | `NOT NULL`                                                               | Start date and time of the booking.  |
| `end_time`   | `DATETIME`     | `NOT NULL`                                                               | End date and time of the booking.    |
| `title`      | `VARCHAR(255)` |                                                                          | Optional title for the booking.      |
|              |                | `UNIQUE (room_id, start_time, end_time)`                                 | Prevents exact overlapping bookings. |

<br />

## 🚀 API Endpoints

### Health Check

- **`GET /health`**
  - Checks the health of the application and its database connection.
  - **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Application is healthy",
      "database": "connected",
      "timestamp": "2023-10-27T10:00:00.000Z"
    }
    ```

### Rooms

- **`GET /rooms`**
  - Retrieves a list of all available room IDs.
- **`GET /rooms?id=<room_id>`**
  - Retrieves details for a specific room.
- **`GET /rooms?id=<room_id>&showReservation=true`**
  - Retrieves details for a specific room, including an array of its existing reservations.

### Reservations

- **`POST /reserve`**
  - Creates a new reservation for a room. Can be a single booking or a recurring series.
  - **Request Body:** See "Example Input" section below.
  - **Success Response (201 Created):** See "Example Output" section below.
- **`DELETE /reserve/:id`**
  - Deletes a specific reservation by its ID.
  - **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Reservation with ID <id> deleted successfully."
    }
    ```
  - **Error Response (404 Not Found):** If reservation ID does not exist.

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
  "message": "Booking(s) created successfully.",
  "reservation_ids": [7, 8, 9, 10, 11]
}
```

<br />

### Skills Practiced

- REST API design
- Time conflict resolution
- Data modeling
- Timezone and edge case handling
