/**
 * View Transition based theme-change animations.
 *
 * Adapted from Skiper UI "Theme_buttons_002" (author @gurvinder-singh02,
 * concept from rudrodip / theme-toggle-effect). Rewritten for this project:
 * no Tailwind / next-themes, and dark mode is keyed off
 * `:root[data-theme="dark"]` instead of a `.dark` class.
 *
 * https://developer.chrome.com/docs/web-platform/view-transitions/
 */

export type AnimationVariant =
  | 'circle'
  | 'rectangle'
  | 'polygon'
  | 'circle-blur';

export type AnimationStart =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'bottom-up'
  | 'top-down'
  | 'left-right'
  | 'right-left';

export interface Animation {
  name: string;
  css: string;
}

/** Selector for the dark side of the transition. */
const DARK = ':root[data-theme="dark"]';

const getPositionCoords = (position: AnimationStart) => {
  switch (position) {
    case 'top-left':
      return { cx: '0', cy: '0' };
    case 'top-right':
      return { cx: '40', cy: '0' };
    case 'bottom-left':
      return { cx: '0', cy: '40' };
    case 'bottom-right':
      return { cx: '40', cy: '40' };
    case 'top-center':
      return { cx: '20', cy: '0' };
    case 'bottom-center':
      return { cx: '20', cy: '40' };
    default:
      return { cx: '20', cy: '20' };
  }
};

const getTransformOrigin = (start: AnimationStart) => {
  switch (start) {
    case 'top-left':
      return 'top left';
    case 'top-right':
      return 'top right';
    case 'bottom-left':
      return 'bottom left';
    case 'bottom-right':
      return 'bottom right';
    case 'top-center':
      return 'top center';
    case 'bottom-center':
      return 'bottom center';
    default:
      return 'center';
  }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
  if (variant === 'circle-blur') {
    const { cx, cy } =
      start === 'center' ? { cx: '20', cy: '20' } : getPositionCoords(start);
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
  }
  return '';
};

const getRectangleClipPath = (direction: AnimationStart) => {
  const to = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  switch (direction) {
    case 'top-down':
      return { from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', to };
    case 'left-right':
      return { from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', to };
    case 'right-left':
      return { from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', to };
    case 'top-left':
      return { from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)', to };
    case 'top-right':
      return { from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)', to };
    case 'bottom-left':
      return { from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)', to };
    case 'bottom-right':
      return { from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)', to };
    default:
      return { from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', to };
  }
};

const getPolygonClipPaths = (position: AnimationStart) => {
  if (position === 'top-right') {
    return {
      darkFrom: 'polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)',
      darkTo: 'polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)',
      lightFrom: 'polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)',
      lightTo: 'polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)',
    };
  }
  return {
    darkFrom: 'polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)',
    darkTo: 'polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)',
    lightFrom: 'polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)',
    lightTo: 'polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)',
  };
};

const getCircleClipPosition = (position: AnimationStart) => {
  switch (position) {
    case 'top-left':
      return '0% 0%';
    case 'top-right':
      return '100% 0%';
    case 'bottom-left':
      return '0% 100%';
    case 'bottom-right':
      return '100% 100%';
    case 'top-center':
      return '50% 0%';
    case 'bottom-center':
      return '50% 100%';
    default:
      return '50% 50%';
  }
};

/** Selector-only wrapper shared by the clip-path reveals. */
const clipRevealCSS = (
  suffix: string,
  blur: boolean,
  frames: {
    darkFrom: string;
    darkTo: string;
    lightFrom: string;
    lightTo: string;
  },
) => `
    ::view-transition-group(root) {
      animation-duration: var(--theme-wave-duration);
      animation-timing-function: var(--theme-wave-ease);
    }

    ::view-transition-new(root) {
      animation-name: reveal-light-${suffix};
      ${blur ? 'filter: blur(2px);' : ''}
    }

    ::view-transition-old(root),
    ${DARK}::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }

    ${DARK}::view-transition-new(root) {
      animation-name: reveal-dark-${suffix};
      ${blur ? 'filter: blur(2px);' : ''}
    }

    @keyframes reveal-dark-${suffix} {
      from { clip-path: ${frames.darkFrom}; ${blur ? 'filter: blur(8px);' : ''} }
      ${blur ? '50% { filter: blur(4px); }' : ''}
      to { clip-path: ${frames.darkTo}; ${blur ? 'filter: blur(0px);' : ''} }
    }

    @keyframes reveal-light-${suffix} {
      from { clip-path: ${frames.lightFrom}; ${blur ? 'filter: blur(8px);' : ''} }
      ${blur ? '50% { filter: blur(4px); }' : ''}
      to { clip-path: ${frames.lightTo}; ${blur ? 'filter: blur(0px);' : ''} }
    }
  `;

/**
 * Circular reveal expanding from an exact viewport point — used so the
 * new theme appears to pour out of the toggle button the user clicked.
 */
export const createOriginAnimation = (
  x: number,
  y: number,
  blur = false,
): Animation => {
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const at = `${x}px ${y}px`;
  const suffix = `origin${blur ? '-blur' : ''}`;

  return {
    name: `circle-${suffix}`,
    css: clipRevealCSS(suffix, blur, {
      darkFrom: `circle(0px at ${at})`,
      darkTo: `circle(${radius}px at ${at})`,
      lightFrom: `circle(0px at ${at})`,
      lightTo: `circle(${radius}px at ${at})`,
    }),
  };
};

/**
 * Builds the `<style>` payload driving one theme swap.
 * `blur` softens the reveal edge; `start` picks where the reveal originates.
 */
export const createAnimation = (
  variant: AnimationVariant,
  start: AnimationStart = 'center',
  blur = false,
): Animation => {
  const suffix = `${start}${blur ? '-blur' : ''}`;
  const name = `${variant}-${suffix}`;

  const clipReveal = (frames: {
    darkFrom: string;
    darkTo: string;
    lightFrom: string;
    lightTo: string;
  }) => clipRevealCSS(suffix, blur, frames);

  if (variant === 'rectangle') {
    const { from, to } = getRectangleClipPath(start);
    return {
      name,
      css: clipReveal({
        darkFrom: from,
        darkTo: to,
        lightFrom: from,
        lightTo: to,
      }),
    };
  }

  if (variant === 'polygon') {
    return { name, css: clipReveal(getPolygonClipPaths(start)) };
  }

  if (variant === 'circle') {
    const at = getCircleClipPosition(start);
    const from = `circle(0% at ${at})`;
    const to = start === 'center' ? `circle(100% at ${at})` : `circle(150% at ${at})`;
    return {
      name,
      css: clipReveal({
        darkFrom: from,
        darkTo: to,
        lightFrom: from,
        lightTo: to,
      }),
    };
  }

  // circle-blur — soft masked expansion from the chosen origin.
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);
  const maskPosition = start === 'center' ? 'center' : start.replace('-', ' ');

  return {
    name,
    css: `
      ::view-transition-group(root) {
        animation-timing-function: var(--theme-wave-ease);
      }

      ::view-transition-new(root) {
        mask: url('${svg}') ${maskPosition} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${suffix} var(--theme-wave-duration);
        transform-origin: ${transformOrigin};
      }

      ::view-transition-old(root),
      ${DARK}::view-transition-old(root) {
        animation: scale-${suffix} var(--theme-wave-duration);
        transform-origin: ${transformOrigin};
        z-index: -1;
      }

      @keyframes scale-${suffix} {
        to { mask-size: 350vmax; }
      }
    `,
  };
};
