// =============================================================================
// PRESENTATION LAYER - Color Wheel Picker
// =============================================================================
// A circular hue ring with an inner saturation-value square.
// Draggable handles on both the ring and the square let the user
// pick any color visually. Outputs a hex string via onChange.

import { useState, useRef, useCallback, useEffect } from 'react';

/* ── Helpers ─────────────────────────────────────────────── */

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToHsv(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6 * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

/* ── Component ───────────────────────────────────────────── */

const SIZE = 220;          // overall widget size
const RING_WIDTH = 28;     // hue ring thickness
const RING_OUTER = SIZE / 2;
const RING_INNER = RING_OUTER - RING_WIDTH;
const HANDLE_R = 10;

// Inner square sits inside the ring with some padding
const SQUARE_PADDING = 10;
const SQUARE_SIZE = (RING_INNER - SQUARE_PADDING) * 2 * 0.707; // inscribed in circle
const SQUARE_OFFSET = (SIZE - SQUARE_SIZE) / 2;

function ColorWheel({ initialColor, onChange }) {
  const initial = hexToHsv(initialColor || '#a855f7');
  const [hue, setHue] = useState(initial.h);
  const [sat, setSat] = useState(initial.s);
  const [val, setVal] = useState(initial.v);
  const ringRef = useRef(null);
  const squareRef = useRef(null);
  const dragging = useRef(null); // 'ring' | 'square' | null

  // Emit colour whenever HSV changes
  useEffect(() => {
    const [r, g, b] = hsvToRgb(hue, sat, val);
    const hex = rgbToHex(r, g, b);
    onChange(hex);
  }, [hue, sat, val]); // onChange intentionally excluded to avoid loops

  /* ── Ring interaction ─────────────────────────────────── */
  const angleFromEvent = useCallback((e, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - cx;
    const dy = clientY - cy;
    // Use atan2(dx, -dy) so 0° = top, clockwise — matches CSS conic-gradient
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const handleRingStart = useCallback((e) => {
    e.preventDefault();
    dragging.current = 'ring';
    const rect = ringRef.current.getBoundingClientRect();
    setHue(angleFromEvent(e, rect));
  }, [angleFromEvent]);

  /* ── Square interaction ──────────────────────────────── */
  const svFromEvent = useCallback((e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    return { s: x / rect.width, v: 1 - y / rect.height };
  }, []);

  const handleSquareStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = 'square';
    const rect = squareRef.current.getBoundingClientRect();
    const { s, v } = svFromEvent(e, rect);
    setSat(s);
    setVal(v);
  }, [svFromEvent]);

  /* ── Shared drag / release ───────────────────────────── */
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      if (dragging.current === 'ring') {
        const rect = ringRef.current.getBoundingClientRect();
        setHue(angleFromEvent(e, rect));
      } else {
        const rect = squareRef.current.getBoundingClientRect();
        const { s, v } = svFromEvent(e, rect);
        setSat(s);
        setVal(v);
      }
    };
    const handleUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [angleFromEvent, svFromEvent]);

  /* ── Derived positions ───────────────────────────────── */
  const ringMid = RING_OUTER - RING_WIDTH / 2;
  const hueRad = (hue * Math.PI) / 180;
  // sin for X, -cos for Y so 0° = top, clockwise — matches conic-gradient
  const hueHandleX = SIZE / 2 + ringMid * Math.sin(hueRad);
  const hueHandleY = SIZE / 2 - ringMid * Math.cos(hueRad);

  const squareHandleX = SQUARE_OFFSET + sat * SQUARE_SIZE;
  const squareHandleY = SQUARE_OFFSET + (1 - val) * SQUARE_SIZE;

  // Pure hue colour (full sat & val) for the square background
  const [hr, hg, hb] = hsvToRgb(hue, 1, 1);
  const pureHue = rgbToHex(hr, hg, hb);

  // Current selected colour for preview
  const [cr, cg, cb] = hsvToRgb(hue, sat, val);
  const currentHex = rgbToHex(cr, cg, cb);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Wheel container */}
      <div
        ref={ringRef}
        className="relative select-none touch-none cursor-pointer"
        style={{ width: SIZE, height: SIZE }}
        onMouseDown={handleRingStart}
        onTouchStart={handleRingStart}
      >
        {/* Conic‑gradient hue ring via SVG */}
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          <defs>
            <mask id="ringMask">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RING_OUTER} fill="white" />
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RING_INNER} fill="black" />
            </mask>
          </defs>
          <foreignObject width={SIZE} height={SIZE} mask="url(#ringMask)">
            <div
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
          </foreignObject>
        </svg>

        {/* Inner saturation-value square */}
        <div
          ref={squareRef}
          className="absolute cursor-crosshair touch-none"
          style={{
            left: SQUARE_OFFSET,
            top: SQUARE_OFFSET,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            borderRadius: 4,
            background: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, ${pureHue})
            `,
          }}
          onMouseDown={handleSquareStart}
          onTouchStart={handleSquareStart}
        />

        {/* Hue handle (ring) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: hueHandleX - HANDLE_R,
            top: hueHandleY - HANDLE_R,
            width: HANDLE_R * 2,
            height: HANDLE_R * 2,
            borderRadius: '50%',
            border: '2.5px solid white',
            boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          }}
        />

        {/* SV handle (square) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: squareHandleX - 7,
            top: squareHandleY - 7,
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2.5px solid white',
            boxShadow: '0 0 6px rgba(0,0,0,0.5)',
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* Colour preview + hex */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border border-white/10"
          style={{ backgroundColor: currentHex, boxShadow: `0 0 12px ${currentHex}60` }}
        />
        <span className="text-[13px] text-[var(--text-secondary)] font-mono tracking-wide uppercase">{currentHex}</span>
      </div>
    </div>
  );
}

export default ColorWheel;
