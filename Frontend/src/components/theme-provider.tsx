import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  accessibilityKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  highContrast: boolean;
  setHighContrast: (high: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  reducedMotion: false,
  setReducedMotion: () => null,
  highContrast: false,
  setHighContrast: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  accessibilityKey = "pf_accessibility",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [accessibility, setAccessibility] = useState<{ reducedMotion: boolean; highContrast: boolean }>(() => {
    try {
      const saved = localStorage.getItem(accessibilityKey);
      return saved ? JSON.parse(saved) : { reducedMotion: false, highContrast: false };
    } catch {
      return { reducedMotion: false, highContrast: false };
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark", "high-contrast");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    if (accessibility.highContrast) {
      root.classList.add("high-contrast");
    }
  }, [theme, accessibility.highContrast]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    reducedMotion: accessibility.reducedMotion,
    setReducedMotion: (reduced: boolean) => {
      const next = { ...accessibility, reducedMotion: reduced };
      localStorage.setItem(accessibilityKey, JSON.stringify(next));
      setAccessibility(next);
    },
    highContrast: accessibility.highContrast,
    setHighContrast: (high: boolean) => {
      const next = { ...accessibility, highContrast: high };
      localStorage.setItem(accessibilityKey, JSON.stringify(next));
      setAccessibility(next);
    },
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
