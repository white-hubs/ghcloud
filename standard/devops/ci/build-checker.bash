#!/bin/bash
BUILD_SH_FILE="$(dirname "$0")/../../build.sh"

echo "[${BUILD_SH_FILE}] build-checker running..."

# 构建
chmod +x "$BUILD_SH_FILE"
bash "$BUILD_SH_FILE" -e test