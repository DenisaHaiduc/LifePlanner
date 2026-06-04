// =============================================================================
// Theme Engine — derives a full palette from 4 base colors, applies to CSS
// variables, and persists to localStorage.
// =============================================================================

const STORAGE_KEY = 'lifeplanner-theme';

export const DEFAULT_DARK = {
  bg: '#050508',
  card: '#111118',
  accent: '#a855f7',
  text: '#f0f0f5',
};

export const DEFAULT_LIGHT = {
  bg: '#f5f5f7',
  card: '#ffffff',
  accent: '#6366f1',
  text: '#1a1a2e',
};

// --- Color math helpers ---

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, l };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(color * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function lighten(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.min(1, l + amount));
}

function darken(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

function withAlpha(hex, alpha) {
  return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
}

function mix(hex1, hex2, weight) {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 * (1 - weight) + r2 * weight);
  const g = Math.round(g1 * (1 - weight) + g2 * weight);
  const b = Math.round(b1 * (1 - weight) + b2 * weight);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function isDarkColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// --- Derive full palette from 4 base colors ---

export function deriveFullPalette(base) {
  const dark = isDarkColor(base.bg);

  return {
    '--bg-primary': base.bg,
    '--bg-secondary': dark ? lighten(base.bg, 0.03) : darken(base.bg, 0.03),
    '--bg-input': dark ? lighten(base.bg, 0.04) : darken(base.bg, 0.04),

    '--bg-card': base.card,
    '--bg-card-hover': dark ? lighten(base.card, 0.03) : darken(base.card, 0.03),
    '--bg-elevated': dark ? lighten(base.card, 0.05) : darken(base.card, 0.05),

    '--accent': base.accent,
    '--accent-hover': dark ? darken(base.accent, 0.1) : darken(base.accent, 0.12),
    '--accent-secondary': dark ? lighten(base.accent, 0.1) : darken(base.accent, 0.05),
    '--text-accent': dark ? lighten(base.accent, 0.2) : darken(base.accent, 0.1),
    '--accent-glow': withAlpha(base.accent, 0.25),
    '--accent-glow-08': withAlpha(base.accent, 0.08),
    '--accent-glow-30': withAlpha(base.accent, 0.3),

    '--text-primary': base.text,
    '--text-secondary': mix(base.text, base.bg, 0.45),
    '--text-muted': mix(base.text, base.bg, 0.65),

    '--border-subtle': withAlpha(base.text, 0.06),
    '--border-accent': withAlpha(base.accent, 0.3),

    '--glass-bg': withAlpha(base.card, 0.8),
    '--shadow-glow': `0 4px 20px ${withAlpha(base.accent, 0.3)}`,
  };
}

// --- Apply theme to the DOM ---

export function applyTheme(base) {
  const palette = deriveFullPalette(base);
  const root = document.documentElement;

  for (const [prop, value] of Object.entries(palette)) {
    root.style.setProperty(prop, value);
  }

  const scheme = isDarkColor(base.bg) ? 'dark' : 'light';
  root.style.setProperty('color-scheme', scheme);
  root.style.setProperty('--color-scheme', scheme);
}

// --- Persistence ---

export function loadTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_DARK;
}

export function saveTheme(base) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
  } catch {}
}
