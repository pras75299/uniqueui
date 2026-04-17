// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MorphingModal } from "../components/ui/morphing-modal";
import { RadialMenu } from "../components/ui/radial-menu";
import { NestedComments } from "../components/ui/nested-comments";
import { DrawerSlide } from "../components/ui/drawer-slide";
import { NotificationStack, useNotifications } from "../components/ui/notification-stack";

describe("High-complexity component behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("closes MorphingModal via Escape and close button while controlling body scroll", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MorphingModal isOpen onClose={onClose} ariaLabel="Example modal">
        <div>Modal content</div>
      </MorphingModal>
    );

    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(
      <MorphingModal isOpen={false} onClose={onClose} ariaLabel="Example modal">
        <div>Modal content</div>
      </MorphingModal>
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("toggles RadialMenu, invokes item action, and closes on outside click", () => {
    const editAction = vi.fn();
    render(
      <RadialMenu
        triggerAriaLabel="Open quick actions"
        items={[
          { id: "edit", label: "Edit", icon: <span>Edit icon</span>, onClick: editAction },
          { id: "share", label: "Share", icon: <span>Share icon</span> },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: "Open quick actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(editAction).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.mouseDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("posts and replies in NestedComments, and keeps like action idempotent", () => {
    const onReply = vi.fn();
    const onLike = vi.fn();

    render(
      <NestedComments
        comments={[
          {
            id: "root-1",
            author: "Ada Lovelace",
            content: "Original thread",
            timestamp: "just now",
            likes: 3,
            replies: [],
          },
        ]}
        onReply={onReply}
        onLike={onLike}
      />
    );

    const composer = screen.getByLabelText("Write a new comment");
    fireEvent.change(composer, { target: { value: "A new top-level thought" } });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
    expect(screen.getByRole("button", { name: "Posting…" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("A new top-level thought")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reply to Ada Lovelace" }));
    const replyBox = screen.getByPlaceholderText("Write a reply… (⌘+Enter to send, Esc to cancel)");
    fireEvent.change(replyBox, { target: { value: "Thanks for the details!" } });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    expect(onReply).toHaveBeenCalledWith("root-1", "Thanks for the details!");
    expect(screen.getAllByText("Thanks for the details!").length).toBeGreaterThan(0);

    const likeButton = screen.getByRole("button", { name: "Like comment, 3 likes" });
    fireEvent.click(likeButton);
    expect(onLike).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Like comment, 4 likes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Like comment, 4 likes" }));
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it("closes DrawerSlide on Escape and overlay click, and restores body scroll", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <DrawerSlide isOpen onClose={onClose} ariaLabel="Settings drawer">
        <p>Drawer body</p>
      </DrawerSlide>
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "Settings drawer" })).toBeInTheDocument();
    expect(screen.getByText("Drawer body")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    const dialog = screen.getByRole("dialog", { name: "Settings drawer" });
    const overlay = dialog.previousElementSibling;
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay as Element);
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(
      <DrawerSlide isOpen={false} onClose={onClose} ariaLabel="Settings drawer">
        <p>Drawer body</p>
      </DrawerSlide>
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("invokes onRemove when the dismiss control is activated", () => {
    const onRemoveSpy = vi.fn();

    function Harness() {
      const { notifications, addNotification, removeNotification } = useNotifications();
      const onRemove = (id: string) => {
        onRemoveSpy(id);
        removeNotification(id);
      };
      return (
        <>
          <button type="button" onClick={() => addNotification({ title: "Toast title", description: "Details here.", duration: 60_000 })}>
            Push notify
          </button>
          <NotificationStack notifications={notifications} onRemove={onRemove} />
        </>
      );
    }

    render(<Harness />);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Push notify" }));
    });
    expect(screen.getByText("Toast title")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Dismiss Toast title notification" }));
    });
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it("invokes onRemove when the auto-dismiss timer elapses", () => {
    const onRemoveSpy = vi.fn();

    function Harness() {
      const { notifications, addNotification, removeNotification } = useNotifications();
      const onRemove = (id: string) => {
        onRemoveSpy(id);
        removeNotification(id);
      };
      return (
        <>
          <button type="button" onClick={() => addNotification({ title: "Short lived", duration: 200 })}>
            Push notify
          </button>
          <NotificationStack notifications={notifications} onRemove={onRemove} />
        </>
      );
    }

    render(<Harness />);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Push notify" }));
    });
    expect(screen.getByText("Short lived")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  });
});
