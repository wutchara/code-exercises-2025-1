## 5. Working with JSON 📄

Concept: JSON is a very common data format, especially for APIs. Go's encoding/json package makes it easy to convert between Go structs and JSON data (marshalling and unmarshalling).

Goal: Learn to serialize Go data to JSON and deserialize JSON back into Go data.

Task:

Define a User struct with fields ID (int), Name (string), and Email (string). Note: To be visible to the json package, field names must be capitalized. Use struct tags to control the JSON key names (e.g., `json:"id"`).

Marshalling: In main, create an instance of User. Use json.Marshal to convert it into a JSON byte slice. Print the resulting JSON string.

Unmarshalling: Take a JSON string (e.g., {"id": 2, "name": "Jane Doe", "email": "jane@example.com"}) and use json.Unmarshal to convert it back into a new User struct. Print the fields of the new struct to verify it worked.
