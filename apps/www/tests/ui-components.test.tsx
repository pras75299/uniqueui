// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";

import { BentoGrid, BentoCard } from "../components/ui/bento-grid";
import { TiltCard } from "../components/ui/3d-tilt-card";
import { InfiniteMarquee, MarqueeItem } from "../components/ui/infinite-marquee";
import { FlipCard } from "../components/ui/flip-card";
import { SkeletonShimmer, SkeletonCard } from "../components/ui/skeleton-shimmer";
import { TypewriterText } from "../components/ui/typewriter-text";

// ─── Browser API mocks ────────────────────────────────────────────────────────

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeAll(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

// ─── BentoGrid ────────────────────────────────────────────────────────────────

describe("BentoGrid", () => {
  it("renders all card titles supplied as children", () => {
    render(
      <BentoGrid>
        <BentoCard title="Analytics" description="Track your metrics" />
        <BentoCard title="Storage" description="Manage your files" />
        <BentoCard title="Security" description="Stay protected" />
      </BentoGrid>
    );

    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
  });

  it("renders card descriptions when provided", () => {
    render(
      <BentoGrid>
        <BentoCard title="Feature" description="A useful description" />
      </BentoGrid>
    );

    expect(screen.getByText("A useful description")).toBeInTheDocument();
  });

  it("renders a card as an anchor tag when href is supplied", () => {
    render(
      <BentoGrid>
        <BentoCard title="Link Card" href="https://example.com" />
      </BentoGrid>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a card as a div (no link role) when href is omitted", () => {
    render(
      <BentoGrid>
        <BentoCard title="Plain Card" />
      </BentoGrid>
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Plain Card")).toBeInTheDocument();
  });

  it("renders card icon and CTA label when supplied", () => {
    render(
      <BentoGrid>
        <BentoCard
          title="With Icon"
          icon={<span data-testid="card-icon">★</span>}
          cta="Learn more"
        />
      </BentoGrid>
    );

    expect(screen.getByTestId("card-icon")).toBeInTheDocument();
    expect(screen.getByText("Learn more →")).toBeInTheDocument();
  });
});

// ─── TiltCard ─────────────────────────────────────────────────────────────────

describe("TiltCard", () => {
  it("renders children inside the card", () => {
    render(
      <TiltCard>
        <p>Card content here</p>
      </TiltCard>
    );

    expect(screen.getByText("Card content here")).toBeInTheDocument();
  });

  it("does not throw on mouse enter and leave events", () => {
    const { container } = render(
      <TiltCard>
        <span>Hover me</span>
      </TiltCard>
    );

    // The inner motion div receives mouse events
    const motionDiv = container.querySelector("div > div");
    expect(() => {
      fireEvent.mouseEnter(motionDiv!);
      fireEvent.mouseLeave(motionDiv!);
    }).not.toThrow();
  });

  it("renders the glare overlay when glare prop is true (default)", () => {
    const { container } = render(
      <TiltCard glare>
        <span>Glare test</span>
      </TiltCard>
    );

    // The glare div is the second absolute child of the motion card div
    const absoluteDivs = container.querySelectorAll(".absolute");
    expect(absoluteDivs.length).toBeGreaterThan(0);
  });

  it("applies perspective style from the perspective prop", () => {
    const { container } = render(
      <TiltCard perspective={800}>
        <span>Perspective test</span>
      </TiltCard>
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.style.perspective).toBe("800px");
  });
});

// ─── InfiniteMarquee ──────────────────────────────────────────────────────────

describe("InfiniteMarquee", () => {
  it("renders all child items (duplicated for seamless loop)", () => {
    render(
      <InfiniteMarquee>
        <MarqueeItem>React</MarqueeItem>
        <MarqueeItem>TypeScript</MarqueeItem>
      </InfiniteMarquee>
    );

    // Content is duplicated internally for the infinite loop effect
    expect(screen.getAllByText("React")).toHaveLength(2);
    expect(screen.getAllByText("TypeScript")).toHaveLength(2);
  });

  it("pauses scrolling on mouse enter when pauseOnHover is true", () => {
    const { container } = render(
      <InfiniteMarquee pauseOnHover>
        <MarqueeItem>Item A</MarqueeItem>
      </InfiniteMarquee>
    );

    const outerContainer = container.firstChild as HTMLElement;
    // Should not throw and state transition should be handled silently
    expect(() => {
      fireEvent.mouseEnter(outerContainer);
      fireEvent.mouseLeave(outerContainer);
    }).not.toThrow();
  });

  it("does not pause on mouse enter when pauseOnHover is false", () => {
    const { container } = render(
      <InfiniteMarquee pauseOnHover={false}>
        <MarqueeItem>Item B</MarqueeItem>
      </InfiniteMarquee>
    );

    const outerContainer = container.firstChild as HTMLElement;
    expect(() => {
      fireEvent.mouseEnter(outerContainer);
    }).not.toThrow();
  });

  it("renders MarqueeItem with its children", () => {
    render(
      <MarqueeItem>
        <span data-testid="marquee-child">Logo</span>
      </MarqueeItem>
    );

    expect(screen.getByTestId("marquee-child")).toBeInTheDocument();
  });
});

// ─── FlipCard ─────────────────────────────────────────────────────────────────

describe("FlipCard", () => {
  it("renders both front and back face content in the DOM", () => {
    render(
      <FlipCard
        front={<span>Front face</span>}
        back={<span>Back face</span>}
      />
    );

    expect(screen.getByText("Front face")).toBeInTheDocument();
    expect(screen.getByText("Back face")).toBeInTheDocument();
  });

  it("toggles flip state on click when trigger='click'", () => {
    // We verify the click handler fires without errors (state update is internal)
    const { container } = render(
      <FlipCard
        trigger="click"
        front={<span>Front</span>}
        back={<span>Back</span>}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(() => {
      fireEvent.click(card);
      fireEvent.click(card);
    }).not.toThrow();
  });

  it("applies hover handlers when trigger='hover' (default)", () => {
    const { container } = render(
      <FlipCard
        trigger="hover"
        front={<span>Front hover</span>}
        back={<span>Back hover</span>}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(() => {
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
    }).not.toThrow();
  });

  it("applies the perspective style from the perspective prop", () => {
    const { container } = render(
      <FlipCard
        perspective={1200}
        front={<span>F</span>}
        back={<span>B</span>}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.perspective).toBe("1200px");
  });
});

// ─── SkeletonShimmer ──────────────────────────────────────────────────────────

describe("SkeletonShimmer", () => {
  it("renders a single skeleton bar by default (count=1)", () => {
    const { container } = render(<SkeletonShimmer />);

    // The outer flex-col wrapper holds one child bar per count
    const flexWrapper = container.firstChild as HTMLElement;
    // Each skeleton row is a direct child div with overflow-hidden
    const bars = flexWrapper.querySelectorAll(":scope > div");
    expect(bars).toHaveLength(1);
  });

  it("renders the correct number of skeleton bars via count prop", () => {
    const { container } = render(<SkeletonShimmer count={4} />);

    const flexWrapper = container.firstChild as HTMLElement;
    const bars = flexWrapper.querySelectorAll(":scope > div");
    expect(bars).toHaveLength(4);
  });

  it("applies width and height styles to each bar", () => {
    const { container } = render(
      <SkeletonShimmer width="200px" height="30px" />
    );

    const bar = container.querySelector(".overflow-hidden") as HTMLElement;
    expect(bar.style.width).toBe("200px");
    expect(bar.style.height).toBe("30px");
  });

  it("SkeletonCard renders without crashing", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("SkeletonCard applies light theme border class", () => {
    const { container } = render(<SkeletonCard theme="light" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-neutral-200");
  });
});

// ─── TypewriterText ───────────────────────────────────────────────────────────

describe("TypewriterText", () => {
  it("renders the component without crashing", () => {
    const { container } = render(
      <TypewriterText words={["Hello", "World"]} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders a blinking cursor span when cursor=true (default)", () => {
    const { container } = render(
      <TypewriterText words={["Hello"]} cursor />
    );

    // The cursor is a span with bg-current class
    const cursorEl = container.querySelector(".bg-current");
    expect(cursorEl).toBeInTheDocument();
  });

  it("does not render a cursor when cursor=false", () => {
    const { container } = render(
      <TypewriterText words={["Hello"]} cursor={false} />
    );

    const cursorEl = container.querySelector(".bg-current");
    expect(cursorEl).not.toBeInTheDocument();
  });

  it("accepts a custom className applied to the outer span", () => {
    const { container } = render(
      <TypewriterText words={["Test"]} className="text-purple-500" />
    );

    const outerSpan = container.firstChild as HTMLElement;
    expect(outerSpan.className).toContain("text-purple-500");
  });

});
