<!-- 
Please ensure your PR title follows conventional commits format:
<type>(<scope>): <subject>
Example: feat(components): add magnetic button
-->

## Type of Change

- [ ] 🚀 New Component
- [ ] 🐛 Bug Fix
- [ ] 📝 Documentation Update
- [ ] 💄 Styling or Animation adjustment
- [ ] 🔧 CLI Tooling
- [ ] 🧹 Refactoring / Chore

## Description

<!-- Please include a summary of the changes and the related issue. Please also include relevant motivation and context. -->

## Testing

<!-- Please describe the tests that you ran to verify your changes. If you added a new component, please confirm you tested it in a fresh project. -->

## Checklist (for New Components)

If adding a new component, please ensure you've completed the following:

- [ ] Created `registry/{component-name}.tsx` with the source code.
- [ ] Added entry to `registry/config.ts` specifying dependencies and Tailwind configuration.
- [ ] Ran `pnpm build:registry` to regenerate `registry.json`.
- [ ] Added a showcase demo in `apps/www/app/page.tsx`.
- [ ] Formatted the code using Prettier / project standards.
- [ ] Verified animations use `motion` (Motion.dev).
- [ ] Verified the component supports standard Tailwind classes via `className` prop (`cn` utility).

## Related Issues

<!-- Mention any related issues here, e.g., "Fixes #123" -->
