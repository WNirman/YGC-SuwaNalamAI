'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  createAnimation,
  createOriginAnimation,
  AnimationStart,
  AnimationVariant,
} from './themeTransition';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mediscan-theme';
const STYLE_ID = 'theme-transition-styles';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  /** Swap the theme with the View Transition reveal animation. */
  toggleTheme: (options?: ThemeAnimationOptions) => void;
  setTheme: (theme: Theme, options?: ThemeAnimationOptions) => void;
  mounted: boolean;
}

export interface ThemeAnimationOptions {
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  /** Reveal from this element's center — used by the toggle button. */
  origin?: { x: number; y: number };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Inline script that applies the stored theme before first paint,
 * so a dark-mode reload never flashes the light palette.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;

const applyStyles = (css: string) => {
  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = css;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // themeInitScript already stamped <html>; read it back so React agrees.
    const current = document.documentElement.getAttribute('data-theme');
    setThemeState(current === 'dark' ? 'dark' : 'light');
    setMounted(true);
  }, []);

  const setTheme = useCallback(
    (next: Theme, options: ThemeAnimationOptions = {}) => {
      const {
        variant = 'circle-blur',
        start = 'center',
        blur = false,
        origin,
      } = options;

      const commit = () => {
        document.documentElement.setAttribute('data-theme', next);
        document.documentElement.style.colorScheme = next;
        setThemeState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage may be unavailable (private mode) — theme still applies */
        }
      };

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (
        typeof document === 'undefined' ||
        !document.startViewTransition ||
        prefersReducedMotion
      ) {
        commit();
        return;
      }

      const animation = origin
        ? createOriginAnimation(origin.x, origin.y, blur)
        : createAnimation(variant, start, blur);
      applyStyles(animation.css);

      document.startViewTransition(commit);
    },
    [],
  );

  const toggleTheme = useCallback(
    (options?: ThemeAnimationOptions) => {
      setTheme(theme === 'dark' ? 'light' : 'dark', options);
    },
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme, mounted }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
