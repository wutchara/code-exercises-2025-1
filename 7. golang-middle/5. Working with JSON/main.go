package main

import (
	"encoding/json"
	"fmt"
	"time"
)

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func main() {
	user1 := User{
		ID:        1,
		Name:      "Ham",
		Email:     "Ham1@email.com",
		CreatedAt: time.Now(),
	}

	// --- Marshalling ---
	// Convert the User struct to a JSON byte slice
	user1JSON, err := json.Marshal(user1)
	if err != nil {
		fmt.Println("Error marshalling to JSON:", err)
		return
	}

	// Print the resulting JSON string
	fmt.Println("--- Marshalling ---")
	fmt.Println("Original struct:", user1)
	fmt.Println("JSON output:", string(user1JSON))

	fmt.Println("\n--- Unmarshalling ---")

	// --- Unmarshalling ---
	// Take a JSON string and convert it back into a new User struct
	jsonInput := `{"id": 2, "name": "Jane Doe", "email": "jane@example.com", "created_at": "2023-10-27T10:00:00Z"}`
	var user2 User
	err = json.Unmarshal([]byte(jsonInput), &user2)
	if err != nil {
		fmt.Println("Error unmarshalling from JSON:", err)
		return
	}

	// Print the fields of the new struct to verify it worked
	fmt.Printf("Unmarshalled struct: %+v\n", user2)
}
