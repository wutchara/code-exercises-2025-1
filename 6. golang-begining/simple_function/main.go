package main

import "fmt"

func main() {
	myName := "Ham..."
	greet(myName)
}

func greet(name string) {
	fmt.Printf("Greetings, [%s]!\n", name)

}
