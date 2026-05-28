import { describe, it, expect } from "vitest";
import { scoreEntry, rankEntries } from "./search";

describe("scoreEntry", () => {
    it("scores exact name match highest", () => {
        const a = scoreEntry({ name: "moving-border" }, "moving-border");
        const b = scoreEntry({ name: "moving-border" }, "moving");
        expect(a).toBeGreaterThan(b);
    });

    it("scores name prefix above name substring", () => {
        const prefix = scoreEntry({ name: "moving-border" }, "moving");
        const substring = scoreEntry({ name: "moving-border" }, "border");
        expect(prefix).toBeGreaterThan(substring);
    });

    it("scores name match above title match", () => {
        const nameMatch = scoreEntry({ name: "card-x" }, "card");
        const titleMatch = scoreEntry({ name: "z-component", title: "Card Wrapper" }, "card");
        expect(nameMatch).toBeGreaterThan(titleMatch);
    });

    it("scores title above description", () => {
        const titleMatch = scoreEntry({ name: "x", title: "Hero" }, "hero");
        const descMatch = scoreEntry({ name: "y", description: "uses a hero block" }, "hero");
        expect(titleMatch).toBeGreaterThan(descMatch);
    });

    it("is case insensitive", () => {
        expect(scoreEntry({ name: "Moving-Border" }, "MOVING")).toBeGreaterThan(0);
    });

    it("returns 0 for no match", () => {
        expect(scoreEntry({ name: "moving-border", description: "spin" }, "xyz")).toBe(0);
    });

    it("returns 0 for empty query (defensive — rankEntries also guards)", () => {
        expect(scoreEntry({ name: "moving-border" }, "")).toBe(0);
    });

    it("scores exact tag match above title — tags are curated taxonomy, titles are sentences", () => {
        const tagHit = scoreEntry({ name: "ambient-glow-card", tags: ["card", "glow"] }, "card");
        const titleHit = scoreEntry({ name: "z-thing", title: "A card-like surface" }, "card");
        expect(tagHit).toBeGreaterThan(titleHit);
    });

    it("scores substring tag match above description — substring-tag is still a curated signal", () => {
        const tagSub = scoreEntry({ name: "z-thing", tags: ["animation"] }, "anim");
        const descHit = scoreEntry({ name: "y-thing", description: "uses anim under the hood" }, "anim");
        expect(tagSub).toBeGreaterThan(descHit);
    });

    it("scores exact tag match below name substring — slug match remains the strongest signal", () => {
        const nameSub = scoreEntry({ name: "moving-border" }, "border");
        const tagExact = scoreEntry({ name: "z-thing", tags: ["border"] }, "border");
        expect(nameSub).toBeGreaterThan(tagExact);
    });
});

describe("rankEntries", () => {
    const entries = [
        { name: "moving-border", description: "Animated SVG border." },
        { name: "aurora-background", description: "Conic gradient aurora." },
        { name: "border-beam", description: "Sweeping border light." },
        { name: "spotlight-card", description: "Cursor-following spotlight." },
    ];

    it("ranks exact name first, then prefix, then substring", () => {
        const out = rankEntries(entries, "border");
        expect(out.map((e) => e.name)).toEqual(["border-beam", "moving-border"]);
    });

    it("includes description matches when name does not match", () => {
        const out = rankEntries(entries, "cursor");
        expect(out.map((e) => e.name)).toEqual(["spotlight-card"]);
    });

    it("returns empty for whitespace-only query", () => {
        expect(rankEntries(entries, "   ")).toEqual([]);
    });

    it("returns empty for no matches", () => {
        expect(rankEntries(entries, "zzz")).toEqual([]);
    });

    it("sorts equal scores deterministically by name", () => {
        const sameScore = [
            { name: "z-bar", description: "match" },
            { name: "a-bar", description: "match" },
        ];
        const out = rankEntries(sameScore, "match");
        expect(out.map((e) => e.name)).toEqual(["a-bar", "z-bar"]);
    });
});
