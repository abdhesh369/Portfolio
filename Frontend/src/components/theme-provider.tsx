import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  reducedMotion: boolean;
  performanceMode: "high" | "low";
  setPerformanceMode: (mode: "high" | "low") => void;
  treePerformanceMode: "normal" | "power";
  setTreePerformanceMode: (mode: "normal" | "power") => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  reducedMotion: false,
  performanceMode: "high",
  setPerformanceMode: () => null,
  treePerformanceMode: "power",
  setTreePerformanceMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [performanceMode, setPerformanceMode] = useState<"high" | "low">(
    () => (localStorage.getItem("performance-mode") as "high" | "low") || "high"
  );

  const [treePerformanceMode, setTreePerformanceMode] = useState<"normal" | "power">(
    () => (localStorage.getItem("tree-performance-mode") as "normal" | "power") || "power"
  );

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    reducedMotion,
    performanceMode,
    setPerformanceMode: (mode: "high" | "low") => {
      localStorage.setItem("performance-mode", mode);
      setPerformanceMode(mode);
    },
    treePerformanceMode,
    setTreePerformanceMode: (mode: "normal" | "power") => {
      localStorage.setItem("tree-performance-mode", mode);
      setTreePerformanceMode(mode);
    }
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
