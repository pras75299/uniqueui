// Public API for @uniqueui/cli-core. Re-exports every command's entry
// function so the uniqueui-cli bin (and any future third-party embedder) can
// invoke commands programmatically without spawning a process.
//
// Workspace-only today: uniqueui-cli bundles this via tsup at build time, so
// these symbols ship inside `uniqueui-cli/dist/index.js` rather than as a
// separate npm dependency.

export { init } from "./commands/init";
export { add } from "./commands/add";
export { addAll } from "./commands/add-all";
export { list } from "./commands/list";
export { info } from "./commands/info";
export { doctor } from "./commands/doctor";
export { search } from "./commands/search";
export { validateRegistry } from "./commands/registry";
export { registryBuild } from "./commands/registry-build";
export { theme } from "./commands/theme";
export { diff } from "./commands/diff";
export { update } from "./commands/update";
export { remove } from "./commands/remove";
