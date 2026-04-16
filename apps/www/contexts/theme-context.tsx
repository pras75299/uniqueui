"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "uniqueui-theme";

/** Must match server render — getSnapshot/getServerSnapshot must agree on first client paint. */
const SSR_THEME: Theme = "dark";

let themeCache: Theme = SSR_THEME;
let hasHydrated = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      const s = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (s === "light" || s === "dark") {
        themeCache = s;
        document.documentElement.dataset.theme = s;
        emit();
      }
    } catch {
      // ignore
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return SSR_THEME;
  if (!hasHydrated) return SSR_THEME;
  return themeCache;
}

function getServerSnapshot(): Theme {
  return SSR_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        themeCache = stored;
      }
    } catch {
      // ignore
    }
    hasHydrated = true;
    document.documentElement.dataset.theme = themeCache;
    emit();
  }, []);

  const setTheme = useCallback((t: Theme) => {
    themeCache = t;
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
    emit();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
