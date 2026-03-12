import { useCallback } from "react";

export const TOGGLE_COMMAND_PALETTE = "TOGGLE_COMMAND_PALETTE";

export function useCommandPalette() {
  const toggle = useCallback(() => {
    window.dispatchEvent(new CustomEvent(TOGGLE_COMMAND_PALETTE));
  }, []);

  const open = useCallback(() => {
    window.dispatchEvent(new CustomEvent(TOGGLE_COMMAND_PALETTE, { detail: { open: true } }));
  }, []);

  return { toggle, open };
}
