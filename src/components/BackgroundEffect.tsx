import React from 'react';

/**
 * Premium cinematic background — 5 layered elements:
 *  1. Near-black base (applied on body in index.css)
 *  2. Orange radial glow — top-left, 160px blur
 *  3. Blue radial glow  — bottom-right, 160px blur
 *  4. Massive semi-transparent blue-gray ellipse — center-left
 *  5. Thin white curved arc — traces the right edge of the ellipse
 *
 * All layers are position:fixed so they stay in place while content scrolls.
 * z-index:0 keeps them behind all page content (sections use z-index auto / 1+).
 */
export const BackgroundEffect: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. Orange glow – top-left corner ─────────────────────────
          Large warm amber blob, strongly blurred so it bleeds softly
          across the upper-left quadrant.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-20%',
          width: '75vw',
          height: '75vh',
          background:
            'radial-gradient(ellipse at center, rgba(245,138,18,0.90) 0%, rgba(210,85,8,0.38) 40%, rgba(160,50,5,0.10) 65%, transparent 80%)',
          filter: 'blur(160px)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* ── 2. Blue glow – bottom-right corner ───────────────────────
          Cool bright blue blob mirroring the orange, sits bottom-right.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-20%',
          width: '75vw',
          height: '75vh',
          background:
            'radial-gradient(ellipse at center, rgba(82,172,255,0.85) 0%, rgba(24,110,230,0.32) 42%, rgba(8,60,180,0.08) 65%, transparent 80%)',
          filter: 'blur(160px)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* ── 3. Ellipse fill – center-left, large atmospheric shape ───
          Oversized oval with a soft blue-gray internal gradient.
          Slight blur keeps its edges hazy and premium.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '-16%',
          top: '2%',
          width: '68vw',
          height: '96vh',
          background:
            'radial-gradient(ellipse at 58% 50%, rgba(50,95,210,0.22) 0%, rgba(28,60,160,0.14) 40%, rgba(12,28,100,0.06) 70%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(6px)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* ── 4. Arc border – right edge of the ellipse ────────────────
          Same size/position as the ellipse fill.
          clipPath cuts everything LEFT of center, showing only the
          curved right-side arc — the "planet limb" white line.
          Box-shadow gives it a faint atmospheric halo.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '-16%',
          top: '2%',
          width: '68vw',
          height: '96vh',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.52)',
          clipPath: 'polygon(54% 0%, 100% 0%, 100% 100%, 54% 100%)',
          boxShadow:
            '0 0 18px rgba(200,220,255,0.18), inset 0 0 10px rgba(200,220,255,0.06)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* ── 5. Subtle secondary blue haze – mid-left depth boost ─────
          Small secondary glow to add mid-scene depth and stop the
          center from feeling too dark between the two main glows.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '15%',
          width: '40vw',
          height: '50vh',
          background:
            'radial-gradient(ellipse at center, rgba(40,80,200,0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
        }}
      />
    </div>
  );
};
