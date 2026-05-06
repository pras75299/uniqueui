#!/usr/bin/env sh
set -e

# ─── Markdown guard ──────────────────────────────────────────────────────────
# By policy, .md files are only committed with explicit approval.
# To approve, set ALLOW_MD=1 on the commit, e.g.:
#   ALLOW_MD=1 git commit -m "docs: update README"
staged_md=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.md$' || true)
if [ -n "$staged_md" ] && [ "${ALLOW_MD:-0}" != "1" ]; then
  echo "✖ pre-commit: refusing to commit Markdown files without approval."
  echo ""
  echo "  Staged .md files:"
  echo "$staged_md" | sed 's/^/    /'
  echo ""
  echo "  To approve and commit anyway, re-run with ALLOW_MD=1, e.g.:"
  echo "      ALLOW_MD=1 git commit ..."
  echo ""
  echo "  To exclude them from this commit:"
  echo "      git restore --staged <file.md>"
  exit 1
fi

echo "Running root test suite"
pnpm run test

echo "Running apps/www lint"
pnpm --dir apps/www run lint
