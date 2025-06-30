#!/bin/bash
set -e

export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

echo "Building Netlify Go functions..."

# Build each function (only if the directory contains a Go file with the same name)
for dir in netlify-functions/functions/*; do
    if [ -d "$dir" ]; then
        fname=$(basename "$dir")
        gofile="$dir/$fname.go"
        echo "DEBUG: dir=$dir, fname=$fname, gofile=$gofile"
        if [ -f "$gofile" ]; then
            echo "Building $fname function..."
            (cd "$dir" && go build -ldflags="-s -w" -o "$fname" "$fname.go" && chmod +x "$fname")
            echo "✓ Built $fname function"
        fi
    fi
done

echo "All functions built successfully!" 