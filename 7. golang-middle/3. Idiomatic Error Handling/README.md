Of course! It's great that you've mastered the fundamentals. The next level in Go involves moving from simple scripts to building more structured and concurrent applications. These exercises will introduce you to structs, methods, interfaces, error handling, and Go's famous concurrency features.

Here are your next-level Go exercises.

## 1. Structs and Methods 🧱

Concept: Go isn't a traditional object-oriented language, but it uses structs and methods to achieve similar goals. A struct is a collection of fields (a custom data type), and a method is a function with a special receiver argument.

Goal: Learn to define your own data types and attach behavior to them.

Task:

Define a Rectangle struct with two fields: width (float64) and height (float64).

Create a method for Rectangle called area() that calculates and returns its area.

Create another method called perimeter() that calculates and returns its perimeter.

In your main function, create an instance of a Rectangle, call its methods, and print the results.

Challenge: Create a scale(factor float64) method that modifies the rectangle's width and height. Notice you'll need to use a pointer receiver (func (r \*Rectangle) scale(...)) to modify the original struct.

## 2. Interfaces 🧩

Concept: Interfaces are types that define a set of methods. If a type (like a struct) implements all methods of an interface, it is said to "satisfy" that interface. This allows for powerful, flexible, and decoupled code.

Goal: Understand how to write functions that can operate on different types that share common behavior.

Task:

Define an interface called Shape with one method: area() float64.

You already have a Rectangle struct that satisfies this interface. Now, create a Circle struct with a radius (float64) field.

Implement the area() method for the Circle struct.

Create a function printShapeArea(s Shape) that takes any Shape and prints its area.

In main, create a Rectangle and a Circle. Pass both of them to the printShapeArea function to show it works with different types.

## 3. Idiomatic Error Handling ⚠️

Concept: In Go, errors are returned as the last value from a function. You handle them with an if err != nil check immediately after the function call.

Goal: Practice the standard Go way of handling operations that can fail.

Task:

Create a function divide(a, b float64) (float64, error).

Inside this function, if b is 0, return 0 and an error (use errors.New("cannot divide by zero")). You'll need to import the errors package.

If b is not 0, return the result of the division and nil for the error.

In main, call divide twice: once with valid numbers and once with 0 as the denominator.

For each call, check if the returned error is nil. If it's not, print the error message. Otherwise, print the result.
