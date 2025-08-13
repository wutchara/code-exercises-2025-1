// main.go
package main

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/unidoc/unipdf/v3/model"
)

// ==========================================================
//
//	SETTINGS
//
// ==========================================================
const (
	fileToUnlock      = "protected.pdf" // << Your PDF filename
	minPasswordLength = 6               // << Start guessing at this length
	maxPasswordLength = 10              // << Guess up to this maximum length
	characterSet      = "0123456789"    // << Character set to use for guessing
)

// ==========================================================

// passwordGenerator creates and sends password candidates to the 'jobs' channel.
func passwordGenerator(ctx context.Context, jobs chan<- string) {
	defer close(jobs) // Close the jobs channel when the generator is done.

	for length := minPasswordLength; length <= maxPasswordLength; length++ {
		buf := make([]byte, length)
		var generate func(int)
		generate = func(k int) {
			if k == length {
				select {
				case <-ctx.Done(): // If a password has been found, stop generating.
					return
				case jobs <- string(buf): // Send the generated password to the jobs channel.
				}
				return
			}

			for i := 0; i < len(characterSet); i++ {
				buf[k] = characterSet[i]
				generate(k + 1)
				// Check again in case a password was just found.
				select {
				case <-ctx.Done():
					return
				default:
				}
			}
		}

		fmt.Printf("\n[INFO] Starting brute-force for length %d...\n", length)
		generate(0)

		// Check before starting the next length.
		select {
		case <-ctx.Done():
			return
		default:
		}
	}
}

// worker is a goroutine that concurrently attempts to decrypt the PDF.
func worker(id int, wg *sync.WaitGroup, jobs <-chan string, found chan<- string, cancel context.CancelFunc, pdfBytes []byte) {
	defer wg.Done()
	for password := range jobs {
		pdfReader, err := model.NewPdfReader(bytes.NewReader(pdfBytes))
		if err != nil {
			// This shouldn't happen if the file is not corrupted.
			continue
		}

		// Core logic: attempt to decrypt.
		isUnlocked, err := pdfReader.Decrypt([]byte(password))
		if err != nil {
			continue // Other errors, likely a wrong password.
		}

		if isUnlocked {
			// Success! Send the found password to the 'found' channel.
			select {
			case found <- password: // Use a non-blocking send in case multiple workers find it simultaneously.
			default:
			}
			cancel() // Signal all other goroutines to stop.
			return
		}
	}
}

func main() {
	cpuNum := (runtime.NumCPU() + 1) / 2
	fmt.Println("[+] Starting PDF Unlocker with Go")
	fmt.Printf("[+] Using %d CPU cores (Concurrency Level)\n", cpuNum)
	fmt.Println("------------------------------------")

	// Read the PDF file into a byte slice once to avoid repeated disk I/O.
	pdfBytes, err := os.ReadFile(fileToUnlock)
	if err != nil {
		fmt.Printf("[ERROR] Could not read file %s: %v\n", fileToUnlock, err)
		return
	}

	// Create channels and a context to control the goroutines.
	jobs := make(chan string, 1000)
	found := make(chan string, 1)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var wg sync.WaitGroup

	// Create a Worker Pool: spawn one goroutine per CPU core.
	numWorkers := cpuNum
	for i := 1; i <= numWorkers; i++ {
		wg.Add(1)
		go worker(i, &wg, jobs, found, cancel, pdfBytes)
	}

	// Start the password generator in a separate goroutine so it doesn't block main.
	go passwordGenerator(ctx, jobs)

	startTime := time.Now()
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// Wait for a result.
	for {
		select {
		case password, ok := <-found:
			if ok {
				duration := time.Since(startTime).Seconds()
				fmt.Printf("\n\n[SUCCESS] 🎉 Password found!\n")
				fmt.Printf("[+] Password is: %s\n", password)
				fmt.Printf("[+] Total time: %.2f seconds\n", duration)
				return
			}
		case <-ticker.C:
			fmt.Printf("\r[INFO] Working... (Elapsed time: %.0f seconds)", time.Since(startTime).Seconds())
		case <-ctx.Done():
			// When the passwordGenerator is done, or a password has been found.
			wg.Wait() // Wait for all workers to finish.
			fmt.Println("\n[INFO] Search finished. Password not found within the given constraints.")
			return
		}
	}
}
