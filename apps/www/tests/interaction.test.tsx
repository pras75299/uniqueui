// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnimatedTabs } from "../components/ui/animated-tabs";
import { NotificationStack } from "../components/ui/notification-stack";
import { LimelightNav } from "../components/ui/limelight-nav";

describe("Interactive components", () => {
  it("switches animated tabs and exposes tab semantics", () => {
    const onChange = vi.fn();

    render(
      <AnimatedTabs
        onChange={onChange}
        tabs={[
          { id: "preview", label: "Preview", content: <div>Preview panel</div> },
          { id: "code", label: "Code", content: <div>Code panel</div> },
        ]}
      />
    );

    const previewTab = screen.getByRole("tab", { name: "Preview" });
    const codeTab = screen.getByRole("tab", { name: "Code" });

    expect(previewTab).toHaveAttribute("aria-selected", "true");
    fireEvent.click(codeTab);
    expect(codeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Code panel");
    expect(onChange).toHaveBeenCalledWith("code");
  });

  it("initializes AnimatedTabs from the first tab and switches content on repeated clicks", () => {
    const onChange = vi.fn();

    render(
      <AnimatedTabs
        onChange={onChange}
        tabs={[
          { id: "overview", label: "Overview", content: <div>Overview panel</div> },
          { id: "activity", label: "Activity", content: <div>Activity panel</div> },
          { id: "settings", label: "Settings", content: <div>Settings panel</div> },
        ]}
      />
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const activityTab = screen.getByRole("tab", { name: "Activity" });
    const settingsTab = screen.getByRole("tab", { name: "Settings" });

    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");

    fireEvent.click(activityTab);
    expect(activityTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");

    fireEvent.click(settingsTab);
    expect(settingsTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Settings panel");
    expect(onChange).toHaveBeenNthCalledWith(1, "activity");
    expect(onChange).toHaveBeenNthCalledWith(2, "settings");
  });

  it("dismisses notifications through the labeled close action", () => {
    const onRemove = vi.fn();

    render(
      <NotificationStack
        notifications={[
          { id: "one", title: "Saved", description: "Settings updated", duration: 0 },
        ]}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss Saved notification" }));
    expect(onRemove).toHaveBeenCalledWith("one");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("reports limelight nav selection changes", () => {
    const onTabChange = vi.fn();

    render(
      <LimelightNav
        onTabChange={onTabChange}
        items={[
          { id: "home", label: "Home", icon: <span>Home icon</span> },
          { id: "explore", label: "Explore", icon: <span>Explore icon</span> },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    expect(onTabChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: "Explore" })).toHaveAttribute("aria-current", "page");
  });

  it("clamps LimelightNav default index and executes item onClick callbacks", () => {
    const onTabChange = vi.fn();
    const profileClick = vi.fn();

    render(
      <LimelightNav
        defaultActiveIndex={999}
        onTabChange={onTabChange}
        items={[
          { id: "home", label: "Home", icon: <span>Home icon</span> },
          { id: "profile", label: "Profile", icon: <span>Profile icon</span>, onClick: profileClick },
        ]}
      />
    );

    expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(onTabChange).toHaveBeenCalledWith(0);
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: "Profile" }));
    expect(onTabChange).toHaveBeenCalledWith(1);
    expect(profileClick).toHaveBeenCalledTimes(1);
  });
});
