## 2. Interfaces 🧩

Concept: Interfaces are types that define a set of methods. If a type (like a struct) implements all methods of an interface, it is said to "satisfy" that interface. This allows for powerful, flexible, and decoupled code.

Goal: Understand how to write functions that can operate on different types that share common behavior.

Task:

Define an interface called Shape with one method: area() float64.

You already have a Rectangle struct that satisfies this interface. Now, create a Circle struct with a radius (float64) field.

Implement the area() method for the Circle struct.

Create a function printShapeArea(s Shape) that takes any Shape and prints its area.

In main, create a Rectangle and a Circle. Pass both of them to the printShapeArea function to show it works with different types.
