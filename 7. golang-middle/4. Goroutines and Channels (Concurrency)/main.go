package main

import (
	"fmt"
	"time"
)

func fetchURL(url string, ch chan<- string) {
	time.Sleep(time.Second * 2)
	ch <- "Fetched data from " + url
}

func main() {
	fmt.Println("===================")
	fmt.Println("Starting.....")

	chanel := make(chan string)
	urls := []string{
		"https://www.google.com",
		"https://www.facebook.com",
		"https://www.youtube.com",
	}

	start := time.Now()

	for _, url := range urls {
		go fetchURL(url, chanel)
	}

	// loop all 'chanel'
	for i := 0; i < len(urls); i++ {
		receivedData := <-chanel
		fmt.Println(receivedData)
	}

	// fmt.Println("===================")

	// receivedData := <-chanel
	// fmt.Println(receivedData)

	fmt.Println("===================", time.Since(start), "s")

}
