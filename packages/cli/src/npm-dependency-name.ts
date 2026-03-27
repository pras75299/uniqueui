/**
 * Validates dependency strings before passing them to the package manager CLI.
 * Rejects shell metacharacters and pathological shapes to reduce command-injection risk.
 */
const MAX_NAME_LEN = 214;

const UNSAFE = /[\s;|&$`'"<>\\!*?[\]{}()]/;

/** Unscoped: npm rules — no leading . or _, URL-safe characters. */
const UNSCOPED_BODY = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

/** Scoped: @scope/pkg — single slash, both segments alphanumeric-ish. */
const SCOPED = /^@([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/;

export function isValidNpmDependencyName(name: string): boolean {
    if (typeof name !== "string" || name.length === 0 || name.length > MAX_NAME_LEN) {
        return false;
    }
    if (UNSAFE.test(name)) {
        return false;
    }
    if (name.startsWith("@")) {
        const m = name.match(SCOPED);
        if (!m) {
            return false;
        }
        const [, scope, pkg] = m;
        if (!scope || !pkg || scope.startsWith(".") || pkg.startsWith(".")) {
            return false;
        }
        return true;
    }
    if (name.startsWith(".") || name.startsWith("_")) {
        return false;
    }
    return UNSCOPED_BODY.test(name);
}

export function assertSafeNpmDependencies(deps: string[]): { ok: true } | { ok: false; invalid: string[] } {
    const invalid = deps.filter((d) => !isValidNpmDependencyName(d));
    if (invalid.length > 0) {
        return { ok: false, invalid };
    }
    return { ok: true };
}
