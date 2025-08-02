package main

import "fmt"

func main() {
	maximum := 10

	println("================================")
	for i := 1; i <= maximum; i++ {
		fmt.Println(i)
	}
	println("================================")

	for i := 2; i <= maximum; i += 2 {
		fmt.Println(i)
	}
}
