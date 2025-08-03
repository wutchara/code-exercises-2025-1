package main

import "fmt"

func main() {
	var age int

	println("=============== Enter your age =================")
	fmt.Printf("age: ")
	fmt.Scanf("%d", &age)
	fmt.Printf("You are %d years old.\n", age)
}
