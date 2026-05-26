import { describe, it, expect } from "vitest";
import { isValidNpmDependencyName, assertSafeNpmDependencies } from "./npm-dependency-name";

describe("isValidNpmDependencyName", () => {
    it("accepts common unscoped names", () => {
        expect(isValidNpmDependencyName("motion")).toBe(true);
        expect(isValidNpmDependencyName("clsx")).toBe(true);
        expect(isValidNpmDependencyName("tailwind-merge")).toBe(true);
        expect(isValidNpmDependencyName("lucide-react")).toBe(true);
    });

    it("accepts scoped packages", () => {
        expect(isValidNpmDependencyName("@types/node")).toBe(true);
        expect(isValidNpmDependencyName("@radix-ui/react-dialog")).toBe(true);
    });

    it("rejects shell injection patterns", () => {
        expect(isValidNpmDependencyName("foo; rm -rf /")).toBe(false);
        expect(isValidNpmDependencyName("foo|bar")).toBe(false);
        expect(isValidNpmDependencyName("foo$(whoami)")).toBe(false);
        expect(isValidNpmDependencyName("foo `id`")).toBe(false);
    });

    it("rejects spaces and odd slashes", () => {
        expect(isValidNpmDependencyName("foo bar")).toBe(false);
        expect(isValidNpmDependencyName("@scope/pkg/extra")).toBe(false);
        expect(isValidNpmDependencyName("scope/pkg")).toBe(false);
    });

    it("rejects leading dot or underscore (unscoped)", () => {
        expect(isValidNpmDependencyName(".hidden")).toBe(false);
        expect(isValidNpmDependencyName("_private")).toBe(false);
    });

    it("assertSafeNpmDependencies aggregates invalid", () => {
        expect(assertSafeNpmDependencies(["motion", "clsx"])).toEqual({ ok: true });
        expect(assertSafeNpmDependencies(["ok", "bad;cmd"])).toEqual({
            ok: false,
            invalid: ["bad;cmd"],
        });
    });
});
