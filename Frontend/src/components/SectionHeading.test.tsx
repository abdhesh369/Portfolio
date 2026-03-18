import { describe, it, expect, vi } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import React from "react";
import type { LucideIcon } from "lucide-react";

// Mock framer-motion to render plain HTML elements
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion") as any;
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, whileInView, initial, transition, viewport, ...props }: any) => <div {...props}>{children}</div>,
      h2: ({ children, whileInView, initial, transition, viewport, ...props }: any) => <h2 {...props}>{children}</h2>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

import SectionHeading from "./SectionHeading";

describe("SectionHeading", () => {
  it("renders badge text", () => {
    render(<SectionHeading badge="Featured" title="Projects" />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders title without highlight as gradient span", () => {
    render(<SectionHeading badge="Test" title="My Title" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders title and highlight separately when highlight is provided", () => {
    render(<SectionHeading badge="Test" title="My" highlight="Projects" />);
    expect(screen.getByText(/My/)).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <SectionHeading badge="Test" title="Title" subtitle="A nice subtitle" />
    );
    expect(screen.getByText("A nice subtitle")).toBeInTheDocument();
  });

  it("does not render subtitle element when not provided", () => {
    const { container } = render(
      <SectionHeading badge="Test" title="Title" />
    );
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("applies cyan color classes by default", () => {
    render(<SectionHeading badge="Badge" title="Title" />);
    const badge = screen.getByText("Badge");
    expect(badge.className).toContain("cyan");
  });

  it("applies the specified color classes", () => {
    render(<SectionHeading badge="Badge" title="Title" color="purple" />);
    const badge = screen.getByText("Badge");
    expect(badge.className).toContain("purple");
  });

  it("renders badge icon when provided", () => {
    const MockIcon = (props: React.SVGProps<SVGSVGElement>) =>
      React.createElement("svg", { ...props, "data-testid": "badge-icon" });
    render(
      <SectionHeading badge="Badge" title="Title" badgeIcon={MockIcon as unknown as LucideIcon} />
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("does not render icon element when badgeIcon is not provided", () => {
    const { container } = render(
      <SectionHeading badge="Badge" title="Title" />
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
