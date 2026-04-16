## Description

<!-- Describe your changes and why you made them -->

## Type of change

- [ ] Bug fix
- [ ] New component
- [ ] Enhancement to existing component
- [ ] CLI change
- [ ] Docs / config
- [ ] Infrastructure / CI

## Checklist

- [ ] Tests pass locally (`pnpm test`)
- [ ] Lint passes (`pnpm --dir apps/www lint`)
- [ ] Run `pnpm build:registry` if any `registry/` source files changed
- [ ] `registry.json` committed if rebuilt
- [ ] Added a changeset if this affects `packages/cli` (`pnpm changeset`)
- [ ] New component: added entry in `registry/config.ts`, `apps/www/config/components.ts`, and `apps/www/config/demos.tsx`
