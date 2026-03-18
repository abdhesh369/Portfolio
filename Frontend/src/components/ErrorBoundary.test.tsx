import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn(), href: '' },
    });
    vi.spyOn(console, "error").mockImplementation(() => { });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
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

  it("renders default fallback UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test crash")} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Base/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload System/i)).toBeInTheDocument();
  });

  it("renders custom fallback if provided", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
        <ThrowingComponent error={new Error("Test crash")} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
  });

  it("calls window.location.reload when Reload System is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test crash")} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText(/Reload System/i);
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it("updates window.location.href when Return to Base is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Test crash")} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText(/Return to Base/i);
    fireEvent.click(homeButton);

    expect(window.location.href).toBe("/");
  });
});
