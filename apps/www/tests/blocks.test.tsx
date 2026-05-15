// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import React from "react";

// ── jsdom shims (motion + the heroes touch these) ──────────────────────────
beforeAll(() => {
    class MockIntersectionObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = "";
        thresholds: number[] = [];
    }
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        configurable: true,
        value: MockIntersectionObserver,
    });
    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        configurable: true,
        value: class {
            observe = vi.fn();
            disconnect = vi.fn();
            unobserve = vi.fn();
        },
    });
    if (!window.matchMedia) {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: (q: string) => ({
                matches: false,
                media: q,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }),
        });
    }
    // noise-dot-field uses <canvas>. jsdom returns null from getContext; pass a
    // benign stub so the early-return-if-null branch runs cleanly.
    if (!HTMLCanvasElement.prototype.getContext) {
        // @ts-expect-error — minimal stub, callers only need .getContext to not throw
        HTMLCanvasElement.prototype.getContext = () => null;
    }
});

afterEach(() => cleanup());

import { ReferencePulseHero } from "@/components/ui/hero-reference-pulse";
import { IridescentSweepHero } from "@/components/ui/hero-iridescent-sweep";
import { LiquidAuroraMeshHero } from "@/components/ui/hero-liquid-aurora-mesh";
import { NoiseDotFieldHero } from "@/components/ui/hero-noise-dot-field";

describe("Hero blocks — render smoke", () => {
    it("ReferencePulseHero renders its default copy", () => {
        const { container } = render(<ReferencePulseHero />);
        expect(container.textContent).toContain("Build with light, not boxes.");
    });

    it("IridescentSweepHero renders its default copy", () => {
        const { container } = render(<IridescentSweepHero />);
        // Default headline is split per char inside FoilHeadline; check substrings.
        expect(container.textContent).toContain("Pressed in light.");
        expect(container.textContent).toContain("Edition · MMXXVI");
    });

    it("LiquidAuroraMeshHero renders its default copy", () => {
        const { container } = render(<LiquidAuroraMeshHero />);
        // Headline is split per word; check both halves.
        expect(container.textContent).toContain("Light");
        expect(container.textContent).toContain("fluid");
        expect(container.textContent).toContain("Liquid · Aurora · Mesh");
    });

    it("NoiseDotFieldHero renders its default copy", () => {
        const { container } = render(<NoiseDotFieldHero />);
        expect(container.textContent).toContain("Engineered, down to the pixel.");
    });

    it("renders custom children when provided (override path)", () => {
        const { getByText } = render(
            <ReferencePulseHero>
                <div>Custom hero content</div>
            </ReferencePulseHero>,
        );
        expect(getByText("Custom hero content")).toBeInTheDocument();
    });
});

describe("Hero blocks — pointer listeners do not throw", () => {
    it("LiquidAuroraMeshHero survives a window pointermove", () => {
        const { container } = render(<LiquidAuroraMeshHero />);
        expect(() => {
            window.dispatchEvent(
                new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
            );
        }).not.toThrow();
        expect(container).toBeTruthy();
    });

    it("NoiseDotFieldHero survives a window pointermove", () => {
        const { container } = render(<NoiseDotFieldHero />);
        expect(() => {
            window.dispatchEvent(
                new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
            );
        }).not.toThrow();
        expect(container).toBeTruthy();
    });
});
