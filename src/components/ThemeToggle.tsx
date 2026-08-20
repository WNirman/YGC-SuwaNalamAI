'use client';

import { useRef } from 'react';
import { useTheme } from '@/lib/theme';
import type { AnimationStart, AnimationVariant } from '@/lib/themeTransition';

interface ThemeToggleProps {
  className?: string;
  /** Reveal shape. Ignored when `fromButton` is true. */
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  /** Expand the reveal out of the button itself (default). */
  fromButton?: boolean;
  size?: number;
}

/**
 * Theme switch with a View Transition reveal.
 * Sun/moon morph adapted from Skiper UI "Skiper 4 / ThemeToggleButton3",
 * re-driven by CSS transitions instead of framer-motion.
 */
export function ThemeToggle({
  className = '',
  variant = 'circle-blur',
  start = 'center',
  blur = false,
  fromButton = true,
  size = 38,
}: ThemeToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isDark, toggleTheme, mounted } = useTheme();

  const handleClick = () => {
    let origin: { x: number; y: number } | undefined;

    if (fromButton && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    toggleTheme({ variant, start, blur, origin });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={`theme-toggle ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={mounted ? isDark : undefined}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        strokeLinecap="round"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* The crescent bite: parked off-canvas in light mode, slid across
            the orb in dark mode to carve the moon out of the sun. */}
        <clipPath id="theme-toggle-cut">
          <path
            className="theme-toggle-cut"
            style={{ transform: isDark ? 'translate(-11px, 14px)' : 'none' }}
            d="M0-11h25a1 1 0 0017 13v30H0Z"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-cut)">
          <circle
            className="theme-toggle-orb"
            style={{ transform: isDark ? 'scale(1.25)' : 'none' }}
            cx="16"
            cy="16"
            r="8"
          />
          <g
            className="theme-toggle-rays"
            style={{
              transform: isDark ? 'scale(0.5)' : 'none',
              opacity: isDark ? 0 : 1,
            }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
          </g>
        </g>
      </svg>
    </button>
  );
}
