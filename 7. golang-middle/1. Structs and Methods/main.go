package main

import "fmt"

type Rectangle struct {
	Width  float64
	Height float64
}

// Area calculates and returns the area of the rectangle.
func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func perimeter(rectangle Rectangle) float64 {
	return 2 * (rectangle.Width + rectangle.Height)
}

func calculate(rectangle Rectangle) {
	area1 := rectangle.Area()
	perimeter := perimeter(rectangle)
	fmt.Printf("Rectangle (%.2f, %.2f) Area: %.2f -> Perimeter: %.2f\n", rectangle.Width, rectangle.Height, area1, perimeter)
}

func scale(rectangle *Rectangle, factor float64) {
	rectangle.Width *= factor
	rectangle.Height *= factor
}

func main() {
	rectangle1 := Rectangle{10, 20}
	rectangle2 := Rectangle{20, 30}

	fmt.Println("=====================")

	fmt.Println("Rectangle 1:")
	calculate(rectangle1)

	fmt.Println("\nRectangle 2:")
	calculate(rectangle2)

	fmt.Println("=====================")
	fmt.Println("=====================")

	factor1 := 2.0
	factor2 := 0.5

	fmt.Printf("Scaling Rectangle 1 by %.2f\n", factor1)
	scale(&rectangle1, factor1)
	calculate(rectangle1)

	fmt.Println("=====================")

	fmt.Printf("Scaling Rectangle 2 by %.2f\n", factor2)
	scale(&rectangle2, factor2)
	calculate(rectangle2)

}
