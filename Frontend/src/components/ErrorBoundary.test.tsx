import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

// A component that throws on render
function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

// A normal component
function GoodComponent() {
  return <div data-testid="child">All good</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error from React error boundary logs during tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders terminal fallback UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test crash")} />
      </ErrorBoundary>
    );
    // Should show the recovery terminal header
    expect(screen.getByText(/PORTFOLIO\s+RECOVERY\s+TERMINAL/)).toBeInTheDocument();
    // Should show crash message
    expect(screen.getByText(/CRASH/)).toBeInTheDocument();
    // Should have a terminal input
    expect(screen.getByLabelText("Terminal input")).toBeInTheDocument();
  });

  it("executes 'help' command in the terminal", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Help test")} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/Available commands/)).toBeInTheDocument();
    expect(screen.getByText(/Show this help message/)).toBeInTheDocument();
  });

  it("executes 'error' command showing error details", () => {
    const testError = new Error("Specific error message");
    testError.name = "TestError";

    render(
      <ErrorBoundary>
        <ThrowingComponent error={testError} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "error" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/Error Details/)).toBeInTheDocument();
    expect(screen.getByText(/Specific error message/)).toBeInTheDocument();
  });

  it("shows 'command not found' for unknown commands", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Unknown cmd test")} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "foobar" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/Command not found: foobar/)).toBeInTheDocument();
  });

  it("clears terminal output with 'clear' command", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Clear test")} />
      </ErrorBoundary>
    );

    // Verify boot lines are present
    expect(screen.getByText(/CRASH/)).toBeInTheDocument();

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "clear" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Boot lines should be cleared
    expect(screen.queryByText(/CRASH/)).not.toBeInTheDocument();
  });

  it("supports command history with ArrowUp/ArrowDown", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("History test")} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input") as HTMLInputElement;

    // Type and execute two commands
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "status" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // ArrowUp should recall last command
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("status");

    // ArrowUp again should recall first command
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("help");

    // ArrowDown should cycle forward
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("status");

    // ArrowDown past end should clear input
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("");
  });

  it("executes 'contact' command showing recovery options", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Contact test")} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "contact" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/Recovery Options/)).toBeInTheDocument();
  });

  it("executes 'status' command showing system info", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Status test")} />
      </ErrorBoundary>
    );

    const input = screen.getByLabelText("Terminal input");
    fireEvent.change(input, { target: { value: "status" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/System Status/)).toBeInTheDocument();
    expect(screen.getByText(/Viewport/)).toBeInTheDocument();
  });
});
