#!/usr/bin/env sh
set -e

echo "Running root test suite"
pnpm run test

echo "Running apps/www lint"
pnpm --dir apps/www run lint
