'use client';

/**
 * Animated mark for the AI assistant button: a breathing core with three
 * satellite dots that orbit and pulse out of phase. Pure CSS animation
 * (see globals.css) — no runtime cost, and it stills under
 * `prefers-reduced-motion`.
 */
export function AssistantOrb({ size = 26 }: { size?: number }) {
  return (
    <svg
      className="assistant-orb"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <g className="assistant-orb-satellites">
        <circle className="assistant-orb-dot dot-1" cx="16" cy="4.5" r="2.6" />
        <circle className="assistant-orb-dot dot-2" cx="26" cy="21.5" r="2.2" />
        <circle className="assistant-orb-dot dot-3" cx="6" cy="21.5" r="2.2" />
      </g>
      <circle className="assistant-orb-core" cx="16" cy="16" r="6.4" />
    </svg>
  );
}
