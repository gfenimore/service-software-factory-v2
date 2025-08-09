#!/bin/bash
# Processor-safe commit - bypasses linting for processor outputs

COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
    echo "Usage: ./processor-commit.sh \"your commit message\""
    exit 1
fi

echo "� Processor commit: bypassing lint checks"
git commit -m "$COMMIT_MSG" --no-verify

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
    echo "� To push: git push origin $(git branch --show-current) --no-verify"
fi
