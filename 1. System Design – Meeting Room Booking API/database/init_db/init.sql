-- init_db/01-schema.sql

-- Drop tables if they exist to ensure a clean slate on recreation (useful during development)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;

-- init_db/01-schema.sql
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL, -- Assuming you'll have a users table
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    title VARCHAR(255),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE (room_id, start_time, end_time) -- Prevent overlapping bookings for the same room
);

-- Insert some initial data
INSERT INTO rooms (name, capacity) VALUES
('Conference Room A', 10),
('Huddle Room 1', 4),
('Large Auditorium', 50),
('Meeting Pod 1', 2),
('Boardroom Executive', 12),
('Focus Room 3', 3),
('Collaboration Space B', 8),
('Training Room Alpha', 20),
('Quiet Zone C', 6),
('Innovation Lab', 15);
