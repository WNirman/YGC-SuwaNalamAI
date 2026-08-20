'use client';

import React from 'react';

interface SweepButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Leading icon rendered before the label. */
  icon?: React.ReactNode;
}

/**
 * Button with the Skiper UI "Link005" hover treatment: a full-height bar
 * wipes in from the left and the label inverts against it, while a 45deg
 * arrow slides in. The original difference blend is replaced by a solid
 * fill + colour swap so the hover stays on-palette (see globals.css).
 *
 * Adapted from Skiper UI "Skiper 40 Animated Link" (author @gurvinder-singh02),
 * itself inspired by cursor.com. Ported from Tailwind to this project's CSS.
 */
export function SweepButton({
  children,
  icon,
  className = '',
  ...props
}: SweepButtonProps) {
  return (
    <button className={`sweep-btn ${className}`.trim()} {...props}>
      {icon}
      <span className="sweep-btn-label">{children}</span>
      <svg
        className="sweep-btn-arrow"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
