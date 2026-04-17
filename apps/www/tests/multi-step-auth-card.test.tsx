// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiStepAuthCard } from "../components/ui/multi-step-auth-card";

describe("MultiStepAuthCard", () => {
  it("blocks email submission until terms consent is accepted", async () => {
    const onSubmitEmail = vi.fn().mockResolvedValue({ exists: true, registered: true });

    render(<MultiStepAuthCard onSubmitEmail={onSubmitEmail} />);

    fireEvent.change(screen.getByLabelText("Work Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }));

    expect(onSubmitEmail).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }));

    await waitFor(() => {
      expect(onSubmitEmail).toHaveBeenCalledWith("ada@example.com");
    });
  });

  it("enforces password rules before allowing account creation", async () => {
    const onCreatePassword = vi.fn().mockResolvedValue(true);

    render(
      <MultiStepAuthCard
        initialState="create-password"
        onCreatePassword={onCreatePassword}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Save and Continue" });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Create Password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "shorter" },
    });

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(onCreatePassword).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Create Password"), {
      target: { value: "Sup3rSecret!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Sup3rSecret!" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreatePassword).toHaveBeenCalledWith("Sup3rSecret!");
    });
  });

  it("accepts a pasted OTP code and submits the combined digits", async () => {
    const onSubmitOTP = vi.fn().mockResolvedValue(true);

    render(<MultiStepAuthCard initialState="otp" onSubmitOTP={onSubmitOTP} />);

    fireEvent.paste(screen.getByLabelText("Digit 1 of 6"), {
      clipboardData: {
        getData: () => "123456",
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Verify Code" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(onSubmitOTP).toHaveBeenCalledWith("123456");
    });
  });
});
