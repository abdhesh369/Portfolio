import { useScrollStore } from "@/hooks/use-scroll-store";

/**
 * TICKET-030: Reading progress bar — fixed at top of viewport.
 * Uses shared scroll store for performance.
 * aria-hidden so screen readers don't announce it.
 */
export function ScrollProgressBar() {
  const { progress } = useScrollStore();

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
