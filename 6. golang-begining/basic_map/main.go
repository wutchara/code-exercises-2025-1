package main

import "fmt"

func main() {
	cities := map[string]int{
		"New York": 10000,
		"Bangkok":  20000,
		"Paris":    30000,
	}

	println("=====================")
	for key, value := range cities {
		fmt.Printf("%s: %d\n", key, value)
	}
	println("=====================")

	fmt.Printf("Try to access a non-existing key: %d\n", cities["London"])
}
