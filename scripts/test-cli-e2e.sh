#!/bin/bash
set -e

echo "Running E2E CLI test..."
TEST_DIR="e2e-test-app"

# Clean up previous
rm -rf $TEST_DIR

# Create a dummy next app (fast, minimal)
npx create-next-app@latest $TEST_DIR --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

cd $TEST_DIR

# Run the CLI from root recursively
echo "Initializing uniqueui..."
yes "" | npx ts-node ../packages/cli/src/index.ts init

echo "Adding moving-border component..."
npx ts-node ../packages/cli/src/index.ts add moving-border --url ../registry.json

# If we get here, commands didn't crash.
echo "Typechecking the app..."
npm run build 

echo "E2E Test Passed Successfully!"
cd ..
rm -rf $TEST_DIR
