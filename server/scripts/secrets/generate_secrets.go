package main

import (
	"encoding/base64"
	"fmt"

	"github.com/gorilla/securecookie"
)

func main() {
	encoder := base64.StdEncoding

	fmt.Println("Generating 64 bytes secret:")
	fmt.Println(encoder.EncodeToString(securecookie.GenerateRandomKey(64)))
	fmt.Println("Generating 32 bytes secret:")
	fmt.Println(encoder.EncodeToString(securecookie.GenerateRandomKey(32)))
	fmt.Println(encoder.EncodeToString(securecookie.GenerateRandomKey(32)))
}
