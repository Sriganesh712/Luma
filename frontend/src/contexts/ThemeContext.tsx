import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'luma-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  const applyTheme = useCallback((mode: ThemeMode) => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);

    // Save to database phase 2
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('users').update({ theme: mode }).eq('id', session.user.id);
      }
    } catch (err) {
      console.error('Failed to sync theme to DB', err);
    }
  }, [applyTheme]);

  // Listen for auth theme syncs
  useEffect(() => {
    const handleSync = (e: Event) => {
      const mode = (e as CustomEvent).detail as ThemeMode;
      if (mode && ['light', 'dark', 'system'].includes(mode)) {
        setThemeState(mode);
        localStorage.setItem(STORAGE_KEY, mode);
        applyTheme(mode);
      }
    };
    window.addEventListener('luma-theme-sync', handleSync);
    return () => window.removeEventListener('luma-theme-sync', handleSync);
  }, [applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
