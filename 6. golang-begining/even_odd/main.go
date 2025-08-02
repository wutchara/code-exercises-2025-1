package main

import "fmt"

func main() {
	var number int = 6

	if (number % 2) == 0 {
		fmt.Println("[MOD]: Even")
	} else {
		fmt.Println("[MOD]: Odd")
	}

	// Check if the last bit is 0. If so, the number is even.
	if number&1 == 0 {
		fmt.Printf("[AND]: %d is even\n", number)
	} else {
		fmt.Printf("[AND]:%d is odd\n", number)
	}

}
