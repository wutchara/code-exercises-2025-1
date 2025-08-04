package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
}

type Rectangle struct {
	Width  float64
	Height float64
}

type Circle struct {
	Radius float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func printShapeArea(s Shape) {
	area := s.Area()

	switch s.(type) {
	case Rectangle:
		fmt.Printf("Rectangle Area: %.2f\n", area)
	case Circle:
		fmt.Printf("Circle Area: %.2f\n", area)
	default:
		fmt.Println("Unknown shape")
	}
}

func main() {
	r := Rectangle{Width: 5, Height: 3}
	c := Circle{Radius: 2}

	fmt.Println("Rectangle Area():", r.Area())
	printShapeArea(r)

	fmt.Println("===================")

	fmt.Println("Circle Area():", c.Area())
	printShapeArea(c)
}
