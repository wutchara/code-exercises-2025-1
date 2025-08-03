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
