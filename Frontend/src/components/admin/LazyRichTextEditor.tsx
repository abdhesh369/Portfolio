import { lazy, Suspense } from "react";

// Lazy-load the heavy tiptap-based editor (vendor-editor ~397KB) only when actually needed
const RichTextEditorImpl = lazy(() =>
  import("./RichTextEditor").then((mod) => ({ default: mod.RichTextEditor }))
);

/** Drop-in replacement that defers the 397KB editor chunk until first render */
export function RichTextEditor(props: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className={props.className}>
          {props.label && (
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
              {props.label}
            </label>
          )}
          <div className="border border-white/10 rounded-lg bg-[hsl(224_71%_4%_/_0.5)] min-h-[200px] animate-pulse" />
        </div>
      }
    >
      <RichTextEditorImpl {...props} />
    </Suspense>
  );
}
