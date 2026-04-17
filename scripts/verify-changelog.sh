#!/usr/bin/env bash
# verify-changelog.sh
# Checks that CHANGELOG.md contains a section header for the current CLI version.
# Exits 0 if found, exits 1 with a helpful error message if not.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHANGELOG="$REPO_ROOT/CHANGELOG.md"
CLI_PACKAGE="$REPO_ROOT/packages/cli/package.json"

# ---------------------------------------------------------------------------
# 1. Read the current CLI version from packages/cli/package.json
# ---------------------------------------------------------------------------
if [ ! -f "$CLI_PACKAGE" ]; then
  echo "ERROR: Could not find packages/cli/package.json at $CLI_PACKAGE" >&2
  exit 1
fi

VERSION="$(node -e "process.stdout.write(require('$CLI_PACKAGE').version)")"

if [ -z "$VERSION" ]; then
  echo "ERROR: Could not read version from packages/cli/package.json" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Check CHANGELOG.md exists
# ---------------------------------------------------------------------------
if [ ! -f "$CHANGELOG" ]; then
  echo "ERROR: CHANGELOG.md not found at $CHANGELOG" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 3. Look for a matching section header (any of the three common formats):
#      ## [x.y.z]
#      ## x.y.z
#      ## vx.y.z
# ---------------------------------------------------------------------------
ESCAPED_VERSION="$(printf '%s' "$VERSION" | sed 's/\./\\./g')"

if grep -qE "^##[[:space:]]+(\[v?${ESCAPED_VERSION}\]|v?${ESCAPED_VERSION})([[:space:]]|$)" "$CHANGELOG"; then
  echo "✓ CHANGELOG.md contains an entry for version $VERSION"
  exit 0
fi

# ---------------------------------------------------------------------------
# 4. Not found — print a helpful error message
# ---------------------------------------------------------------------------
cat >&2 <<EOF

ERROR: CHANGELOG.md is missing an entry for version $VERSION.

Before publishing, add a section header (and release notes) to CHANGELOG.md.
Accepted formats:

  ## [$VERSION] - $(date +%Y-%m-%d)

  ## $VERSION - $(date +%Y-%m-%d)

  ## v$VERSION - $(date +%Y-%m-%d)

Example entry to add (edit as appropriate):

  ## [$VERSION] - $(date +%Y-%m-%d)

  ### Added
  - ...

  ### Fixed
  - ...

Then re-run:  pnpm changelog:verify

EOF
exit 1
