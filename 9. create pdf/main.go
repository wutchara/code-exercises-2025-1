package main

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"

	"github.com/jung-kurt/gofpdf"
)

// generateRandomPassword creates a cryptographically secure 6-digit random number as a string.
func generateRandomPassword() (string, error) {
	// We want a number between 100000 and 999999.
	// The range is 900000 (999999 - 100000 + 1).
	const min = 100000
	const max = 999999
	n, err := rand.Int(rand.Reader, big.NewInt(max-min+1))
	if err != nil {
		return "", fmt.Errorf("failed to generate random number: %w", err)
	}
	// Add the minimum value to the random number to get it in the desired range.
	passwordInt := n.Int64() + min
	return fmt.Sprintf("%d", passwordInt), nil
}

func main() {
	// 1. Generate a random 6-digit password.
	password, err := generateRandomPassword()
	if err != nil {
		log.Fatalf("Error generating password: %v", err)
	}

	// 2. Create a new PDF instance.
	pdf := gofpdf.New("P", "mm", "A4", "")

	// 3. Set the protection for the PDF file.
	// This encrypts the PDF and requires the password to open it.
	// We are protecting against printing, modifying, copying, and form annotations.
	pdf.SetProtection(gofpdf.CnProtectPrint|gofpdf.CnProtectModify|gofpdf.CnProtectCopy|gofpdf.CnProtectAnnotForms, password, "")

	// 4. Add content to the PDF.
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Hello, this is a protected PDF!")
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "You needed a password to open this file.")

	// 5. Define the output filename.
	outputFile := "protected.pdf"

	// 6. Save the PDF to a file.
	err = pdf.OutputFileAndClose(outputFile)
	if err != nil {
		log.Fatalf("Error creating PDF file: %v", err)
	}

	// 7. Print the success message and the generated password.
	fmt.Printf("Successfully created %s\n", outputFile)
	fmt.Printf("Password: %s\n", password)
}
