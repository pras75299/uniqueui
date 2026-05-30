import { describe, expect, it } from "vitest";
import {
  parseDemoKeyOrder,
  parseEntryKey,
  splitTopLevelEntries,
} from "./demo-entries-parser";

describe("demo-entries-parser", () => {
  it("does not split on commas inside arrow-function JSX bodies", () => {
    const body = `\n  "border-beam": () => (
    <p>Any gradient, any speed.</p>
  )`;
    const map = splitTopLevelEntries(body);
    expect(map.size).toBe(1);
    expect(map.get("border-beam")).toContain("Any gradient, any speed.");
  });

  it("parses bare object keys", () => {
    expect(parseEntryKey('\n  ripple: ({ theme }) => null')).toBe("ripple");
  });

  it("parses comment-prefixed entries", () => {
    const chunk = `  // section header
  "shiny-text": () => null`;
    expect(parseEntryKey(chunk)).toBe("shiny-text");
  });

  it("rejects duplicate keys in demo-key-order.json", () => {
    expect(() => parseDemoKeyOrder(["a", "b", "a"])).toThrow(/duplicate keys/);
  });

  it("rejects non-string demo-key-order entries", () => {
    expect(() => parseDemoKeyOrder(["ok", 1])).toThrow(/array of strings/);
  });
});
