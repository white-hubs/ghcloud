#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building Docker image..."
docker build -f "$SCRIPT_DIR/Dockerfile" -t ghcloud/ssg-generator-service "$ROOT_DIR"

echo "Build completed!"