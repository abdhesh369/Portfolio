import { useEffect } from "react";
import { toast } from "#src/hooks/use-toast";

/**
 * Adds copy-to-clipboard button to all <pre> code blocks in the article.
 * Call this hook from BlogPost after content renders.
 */
export function useCodeBlockCopy(containerRef: React.RefObject<HTMLElement | null>, trigger?: unknown) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preBlocks = container.querySelectorAll("pre");

    const buttons: HTMLButtonElement[] = [];

    preBlocks.forEach((pre) => {
      // Don't add duplicate buttons
      if (pre.querySelector(".code-copy-btn")) return;

      // Make pre relative for button positioning
      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.className = "code-copy-btn";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.title = "Copy code";
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

      Object.assign(btn.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        padding: "6px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        color: "rgba(255,255,255,0.5)",
        cursor: "pointer",
        opacity: "0",
        transition: "opacity 0.2s, color 0.2s, background 0.2s",
        zIndex: "10",
      });

      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        const text = code?.textContent || pre.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          btn.style.color = "var(--color-green)";
          setTimeout(() => {
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            btn.style.color = "rgba(255,255,255,0.5)";
          }, 2000);
        } catch (err: unknown) {
          toast({ variant: "destructive", title: "Failed to copy code to clipboard" });
          console.error(err);
        }
      });

      pre.appendChild(btn);
      buttons.push(btn);

      // Show on hover
      pre.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
      pre.addEventListener("mouseleave", () => { btn.style.opacity = "0"; });
    });

    return () => {
      buttons.forEach((btn) => btn.remove());
    };
  }, [containerRef, trigger]);
}
