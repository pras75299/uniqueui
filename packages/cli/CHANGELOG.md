# Changelog

## 1.1.5

### Patch Changes

- Ship the `animated-tooltip` component in the registry; the tooltip now preserves the trigger's existing `aria-describedby` when linking its bubble.

## 1.1.2

### Patch Changes

- Show the underlying install error when `uniqueui add` cannot install dependencies automatically.

## 1.1.0

### Minor Changes

- Added `macbook-mock` and `mini-mac-keyboard` to the registry and docs catalog.
- Improved `macbook-mock` behavior for reduced-motion users so open/close state is preserved while animations are minimized.
- Added keyboard and touch interaction support for `macbook-mock` to avoid hover-only reveal behavior.
- Expanded `MacbookMockProps` to support pass-through HTML attributes while keeping internal hover handlers controlled.
