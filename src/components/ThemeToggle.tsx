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
 * SVG mark adapted from Skiper UI "Theme_buttons_002".
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
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g
          className="theme-toggle-inner"
          style={{ transform: `rotate(${isDark ? -180 : 0}deg)` }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill="var(--theme-toggle-fg)"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            fill="var(--theme-toggle-bg)"
          />
        </g>
        <path
          className="theme-toggle-ring"
          style={{ transform: `rotate(${isDark ? 180 : 0}deg)` }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="var(--theme-toggle-fg)"
        />
      </svg>
    </button>
  );
}
