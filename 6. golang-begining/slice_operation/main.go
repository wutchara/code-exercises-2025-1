package main

import "fmt"

func main() {
	numbers := []int{1, 2, 3, 4, 5}

	fmt.Println("========== Original numbers =========")
	showsNumber(numbers)

	fmt.Println("========== Modified numbers =========")
	numbers = append(numbers, 6, 7, 8)
	showsNumber(numbers)
}

func showsNumber(numbers []int) {
	for _, num := range numbers {
		fmt.Println(num)
	}
}
