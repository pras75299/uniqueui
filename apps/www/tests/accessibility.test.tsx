// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MorphingModal, MorphingModalTrigger } from "../components/ui/morphing-modal";
import { DrawerSlide } from "../components/ui/drawer-slide";
import { RadialMenu } from "../components/ui/radial-menu";
import { FloatingDock } from "../components/ui/floating-dock";
import { NestedComments } from "../components/ui/nested-comments";

describe("Accessibility", () => {
  it("renders modal and drawer with dialog semantics", () => {
    render(
      <>
        <MorphingModal isOpen onClose={() => undefined} ariaLabel="Example modal">
          <button type="button">Focusable modal content</button>
        </MorphingModal>
        <DrawerSlide isOpen onClose={() => undefined} ariaLabel="Example drawer">
          <button type="button">Focusable drawer content</button>
        </DrawerSlide>
      </>
    );

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(2);
    expect(screen.getByRole("dialog", { name: "Example modal" })).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("dialog", { name: "Example drawer" })).toHaveAttribute("aria-modal", "true");
  });

  it("renders modal trigger as an accessible button", () => {
    render(<MorphingModalTrigger onClick={() => undefined}>Open modal</MorphingModalTrigger>);
    expect(screen.getByRole("button", { name: "Open modal" })).toBeInTheDocument();
  });

  it("announces radial menu trigger state and item labels", () => {
    render(
      <RadialMenu
        triggerAriaLabel="Open actions"
        items={[
          {
            id: "edit",
            label: "Edit",
            icon: <span>Edit icon</span>,
          },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: "Open actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("uses labels for floating dock actions", () => {
    render(
      <FloatingDock
        items={[
          { id: "docs", label: "Documentation", icon: <span>Docs</span>, onClick: vi.fn() },
          { id: "repo", label: "Repository", icon: <span>Repo</span>, href: "https://example.com" },
        ]}
      />
    );

    expect(screen.getByRole("button", { name: "Documentation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repository" })).toBeInTheDocument();
  });

  it("provides labeled comment actions", () => {
    render(
      <NestedComments
        comments={[
          {
            id: "comment-1",
            author: "Ada Lovelace",
            content: "First comment",
            timestamp: "just now",
            likes: 3,
            replies: [],
          },
        ]}
      />
    );

    expect(screen.getByLabelText("Comments")).toBeInTheDocument();
    expect(screen.getByLabelText("Write a new comment")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post comment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Like comment, 3 likes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reply to Ada Lovelace" })).toBeInTheDocument();
  });
});
