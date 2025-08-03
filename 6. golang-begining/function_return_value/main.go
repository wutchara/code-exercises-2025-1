package main

import (
	"fmt"
	"math"
)

func main() {
	a, b := 10, 3
	fmt.Printf("%d + %d = %d\n", a, b, addNumbers(a, b))
	fmt.Printf("%d - %d = %d\n", a, b, subNumbers(a, b))
	fmt.Printf("%d * %d = %d\n", a, b, multNumbers(a, b))
	fmt.Printf("%d / %d = %f\n", a, b, divNumbers(a, b))
	fmt.Printf("%d %% %d = %d\n", a, b, modNumbers(a, b))
	fmt.Printf("%d ^ %d = %f\n", a, b, powNumbers(a, b))
}

func addNumbers(num1 int, num2 int) int {
	return num1 + num2
}

func subNumbers(num1 int, num2 int) int {
	return num1 - num2
}

func multNumbers(num1 int, num2 int) int {
	return num1 * num2
}

// divNumbers converts integers to float64 to perform division and return a float.
func divNumbers(num1 int, num2 int) float64 {
	return float64(num1) / float64(num2)
}

func modNumbers(num1 int, num2 int) int {
	return num1 % num2
}

// powNumbers calculates the power of num1 to num2. Note: ^ is the XOR operator.
func powNumbers(num1 int, num2 int) float64 {
	return math.Pow(float64(num1), float64(num2))
}
