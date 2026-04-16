# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: singh.prashantking@gmail.com

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

**Response time:** We aim to respond within 48 hours and resolve critical issues within 7 days.

## Security Model

The UniqueUI CLI (`uniqueui add <component>`) runs with user privileges and performs these operations:
- Downloads component source files from the registry
- Installs npm packages into your project
- Modifies your `tailwind.config.ts`

### Trust Boundaries

| Action | Protection |
|--------|-----------|
| Registry URL | Allowlist: only `uniqueui-platform.vercel.app` and `raw.githubusercontent.com/pras75299/uniqueui` trusted by default |
| npm package names | Validated against an allowlist before install — blocks homograph attacks |
| File writes | Only `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` extensions allowed |
| Shell commands | Uses `spawnSync` with `shell: false` — no shell injection possible |

### Using Custom Registry URLs

If you use `--url` with an untrusted host, the CLI will print a warning. Only use `--url` with registries you own and control.

To suppress the warning for a known-safe custom registry:

```bash
UNIQUEUI_SKIP_REGISTRY_WARN=1 uniqueui add <component> --url https://your-registry.com
```
