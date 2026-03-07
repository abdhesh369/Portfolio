import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "../hooks/use-document-title";

describe("useDocumentTitle", () => {
    it("sets the document title", () => {
        renderHook(() => useDocumentTitle("Test Page"));
        expect(document.title).toBe("Test Page");
    });

    it("updates title when value changes", () => {
        const { rerender } = renderHook(
            ({ title }) => useDocumentTitle(title),
            { initialProps: { title: "First" } }
        );
        expect(document.title).toBe("First");

        rerender({ title: "Second" });
        expect(document.title).toBe("Second");
    });

    it("restores previous title on unmount by default", () => {
        const originalTitle = document.title;

        const { unmount } = renderHook(() => useDocumentTitle("Temporary"));
        expect(document.title).toBe("Temporary");

        unmount();
        expect(document.title).toBe(originalTitle);
    });

    it("keeps title on unmount when prevailOnUnmount is true", () => {
        const { unmount } = renderHook(() => useDocumentTitle("Persistent", true));
        expect(document.title).toBe("Persistent");

        unmount();
        expect(document.title).toBe("Persistent");
    });
});
