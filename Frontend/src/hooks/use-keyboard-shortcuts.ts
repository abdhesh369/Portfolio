import { useEffect, useRef } from "react";
import { useTheme } from "../components/theme-provider";

export const useKeyboardShortcuts = () => {
  const { setDebugMode, debugMode } = useTheme();
  const bufferRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Add character to buffer
      bufferRef.current += e.key.toLowerCase();

      // Clear existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Trigger "sudo" or "reveal"
      if (bufferRef.current.endsWith("sudo") || bufferRef.current.endsWith("reveal")) {
        setDebugMode(!debugMode);
        bufferRef.current = "";
      }

      // Clear buffer after 1 second of inactivity
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = "";
      }, 1000);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [debugMode, setDebugMode]);
};
