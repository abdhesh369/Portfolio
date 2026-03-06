import { useEffect, useState, useCallback } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Table of Contents — auto-generated from h2/h3 in article content.
 * Sticky on desktop, keyboard navigable.
 */
export function TableOfContents({ contentSelector = "article" }: { contentSelector?: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Parse headings from article content
  useEffect(() => {
    const article = document.querySelector(contentSelector);
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: Heading[] = [];

    elements.forEach((el, i) => {
      // Ensure each heading has an id for anchor linking
      if (!el.id) {
        el.id = `heading-${i}-${el.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").slice(0, 50) || i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, [contentSelector]);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of Contents"
      className="hidden xl:block sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">
        On this page
      </h4>
      <ul className="space-y-1 border-l border-white/10">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={`block w-full text-left text-sm py-1.5 transition-colors border-l-2 -ml-px ${heading.level === 3 ? "pl-6" : "pl-4"
                } ${activeId === heading.id
                  ? "text-primary border-primary"
                  : "text-white/40 border-transparent hover:text-white/70 hover:border-white/20"
                }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
