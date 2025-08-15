package main

import (
	"fmt"
	"time"
)

// --- Main function with demo runs ---

func main() {
	fmt.Println("========= DEMO 1: Basic TTL ========")
	runDemo1()
	fmt.Println("\n========= DEMO 2: Custom TTL ========")
	runDemo2()
	fmt.Println("\n========= DEMO 3: Update Key TTL ========")
	runDemo3()
	fmt.Println("\n========= DEMO 4: Get Non-existent Key ========")
	runDemo4()
	fmt.Println("\n========= DEMO 5: Multiple Keys & TTLs ========")
	runDemo5()
}

// runDemo1: Basic TTL functionality.
func runDemo1() {
	fmt.Println("Starting...")
	cache, _ := NewTTLCache(200 * time.Millisecond)
	defer cache.StopJanitor()

	cache.Set("USD/THB", 36.5)

	time.Sleep(100 * time.Millisecond)
	if val, ok := cache.Get("USD/THB"); ok {
		fmt.Printf("Value after 100ms: %.2f (OK)\n", val)
	}

	time.Sleep(150 * time.Millisecond) // Total time is 250ms, expired
	if _, ok := cache.Get("USD/THB"); !ok {
		fmt.Println("Value after 250ms: Not found (Expired as expected)")
	}
	fmt.Println("Finished.")
}

// runDemo2: Custom TTL functionality.
func runDemo2() {
	fmt.Println("Starting...")
	cache, _ := NewTTLCache(500 * time.Millisecond)
	defer cache.StopJanitor()

	cache.Set("EUR/USD", 1.08, 100*time.Millisecond) // Custom 100ms TTL

	if val, ok := cache.Get("EUR/USD"); ok {
		fmt.Printf("Value immediately: %.2f (OK)\n", val)
	}

	time.Sleep(120 * time.Millisecond) // Expired
	if _, ok := cache.Get("EUR/USD"); !ok {
		fmt.Println("Value after 120ms: Not found (Expired as expected)")
	}
	fmt.Println("Finished.")
}

// runDemo3: Updating a key's value and TTL.
func runDemo3() {
	fmt.Println("Starting...")
	cache, _ := NewTTLCache(300 * time.Millisecond)
	defer cache.StopJanitor()

	cache.Set("JPY/THB", 0.23) // Expires in 300ms

	time.Sleep(100 * time.Millisecond)
	fmt.Println("Updating key JPY/THB...")
	cache.Set("JPY/THB", 0.24) // TTL is reset for another 300ms

	time.Sleep(250 * time.Millisecond) // Total time: 100+250=350ms. Still valid.
	if val, ok := cache.Get("JPY/THB"); ok {
		fmt.Printf("Value after 350ms: %.2f (OK)\n", val)
	}

	time.Sleep(100 * time.Millisecond) // Total time: 350+100=450ms. Expired.
	if _, ok := cache.Get("JPY/THB"); !ok {
		fmt.Println("Value after 450ms: Not found (Expired as expected)")
	}
	fmt.Println("Finished.")
}

// runDemo4: Getting a non-existent key.
func runDemo4() {
	fmt.Println("Starting...")
	cache, _ := NewTTLCache(1 * time.Second)
	defer cache.StopJanitor()

	if _, ok := cache.Get("GBP/USD"); !ok {
		fmt.Println("Value before setting: Not found (OK)")
	}
	cache.Set("GBP/USD", 1.25)
	if val, ok := cache.Get("GBP/USD"); ok {
		fmt.Printf("Value after setting: %.2f (OK)\n", val)
	}
	fmt.Println("Finished.")
}

// runDemo5: Caching multiple keys with different TTLs.
func runDemo5() {
	fmt.Println("Starting...")
	cache, _ := NewTTLCache(1 * time.Second)
	defer cache.StopJanitor()

	cache.Set("AUD/USD", 0.66, 50*time.Millisecond)
	cache.Set("NZD/USD", 0.61, 200*time.Millisecond)

	time.Sleep(60 * time.Millisecond)
	if _, ok := cache.Get("AUD/USD"); !ok {
		fmt.Println("AUD/USD after 60ms: Not found (Expired as expected)")
	}
	if val, ok := cache.Get("NZD/USD"); ok {
		fmt.Printf("NZD/USD after 60ms: %.2f (Still valid)\n", val)
	}
	fmt.Println("Finished.")
}
