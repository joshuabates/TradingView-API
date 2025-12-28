#!/bin/bash
echo "Starting local server for examples..."
echo "Open http://localhost:8080/browser-test.html to test"
echo "Open http://localhost:8080/browser-example.html for the demo"
cd examples && python3 -m http.server 8080