#!/usr/bin/env bash
set -e

TOOLS_DIR="$(pwd)/tools"
mkdir -p "$TOOLS_DIR"

OS="$(uname -s)"
case "$OS" in
  Linux*)
    BINARY_URL="https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64"
    ;;
  Darwin*)
    BINARY_URL="https://github.com/stedolan/jq/releases/download/jq-1.6/jq-osx-amd64"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    BINARY_URL="https://github.com/stedolan/jq/releases/download/jq-1.6/jq-win64.exe"
    ;;
  *)
    echo "Unsupported OS: $OS" >&2
    exit 1
    ;;
esac

OUTPUT_FILE="$TOOLS_DIR/jq"
if [[ "$OS" == MINGW* || "$OS" == MSYS* || "$OS" == CYGWIN* ]]; then
  OUTPUT_FILE="$TOOLS_DIR/jq.exe"
fi

echo "Downloading jq from $BINARY_URL..."
curl -L "$BINARY_URL" -o "$OUTPUT_FILE"
chmod +x "$OUTPUT_FILE"

echo "jq installed to $OUTPUT_FILE"
echo "Add $TOOLS_DIR to your PATH or reference it directly."