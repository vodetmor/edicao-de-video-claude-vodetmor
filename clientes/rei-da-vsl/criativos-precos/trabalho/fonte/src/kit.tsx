import React from 'react';
import {Easing} from 'remotion';
import {C, DISPLAY, TEXT} from './theme';
// copied from estudio/motor/src/kit.tsx (frame-based motion helpers)

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);

// "Arrive fast, land soft": each frame covers a fixed fraction k of the remaining distance (LICOES §2).
export const approach = (f: number, start: number, from: number, to: number, k = 0.15) =>
  f <= start ? from : to - (to - from) * Math.pow(1 - k, f - start);
export const arrive = (f: number, start: number, k = 0.15) => approach(f, start, 0, 1, k);

const bez = (a: number, b: number, c: number, d: number) => Easing.bezier(a, b, c, d);
// Named curves (DESIGN-SYSTEM §5.2)
export const E = {
  prod: bez(0.2, 0, 0.38, 0.9),
  expr: bez(0.4, 0.14, 0.3, 1),
  enter: bez(0, 0, 0.3, 1),
  exit: bez(0.4, 0.14, 1, 1),
  cam: bez(0.45, 0, 0.55, 1),
  inQuad: (t: number) => t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
};
export const tween = (f: number, start: number, dur: number, from: number, to: number, ease: (t: number) => number = E.expr) =>
  from + (to - from) * ease(prog(f, start, dur));

// Damped spring 0 -> 1. z < 1 overshoots (z 0.75 = ~3%). w in radians per frame.
export const spring = (f: number, start: number, w = 0.35, z = 0.75) => {
  const t = f - start;
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

// Velocity of any function of frame, per frame
export const vel = (g: (f: number) => number, f: number) => g(f + 0.5) - g(f - 0.5);

export const hash = (i: number, s = 0) => {
  let n = (i * 374761393 + s * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
};

export const mixColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// Anisotropic gaussian (directional blur). Used only while something moves.
export const DirBlur: React.FC<{x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x = 0,
  y = 0,
  children,
  style,
}) => {
  const id = 'db' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const on = x > 0.25 || y > 0.25;
  return (
    <div style={{...style, filter: on ? `url(#${id})` : style?.filter}}>
      {on && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
};

// True sub-frame motion blur: n samples over the shutter, as a running average with normal blending.
// Layer k (1-based) is drawn at opacity 1/k, so every opaque sample ends with weight exactly 1/n, and
// wherever the samples agree (anything static) the result is bit-exact: no brightness pop when the
// blur switches on or off (plus-lighter sums drifted by up to 5% in 8-bit). Samples go from the latest
// time to the earliest, so the leading edge stays crisp and the trail behind it is the exact average.
// Samples must not be far apart or the average reads as separate copies (v2 critique: 30 px steps on the
// whip): callers size n with nSamples, and `gap` adds a small gaussian per sample, along the motion only,
// that fills the space between neighbours (sigma = 0.55 x spacing leaves a ripple under 2%).
// Playback rate of the current output frame (source frames per output frame, set by Ad.tsx). On a slowed
// stretch the shutter spans proportionally fewer source frames, so the blur stays that of a 180-degree shutter.
export const PLAYBACK = {rate: 1};
// the vertical cut (src/Vertical.tsx) sets this; a few scenes relayout for the tall frame
export const LAYOUT = {vertical: false};

export const Samples: React.FC<{
  f: number;
  n?: number;
  shutter?: number;
  active?: boolean;
  render: (ff: number, i: number) => React.ReactNode;
  style?: React.CSSProperties;
  gap?: {x?: number; y?: number};
}> = ({f, n = 8, shutter = 0.5, active = true, render, style, gap}) => {
  const id = 'sg' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!active || n <= 1) return <div style={{position: 'absolute', inset: 0, ...style}}>{render(f, 0)}</div>;
  const gx = gap?.x ?? 0;
  const gy = gap?.y ?? 0;
  const blur = gx > 0.3 || gy > 0.3;
  // filter region in the sample's own box (the frame): wide enough for the gaussian tails
  const mx = (3 * gx + 8) / 1920;
  const my = (3 * gy + 8) / 1080;
  return (
    <div style={{position: 'absolute', inset: 0, isolation: 'isolate', ...style}}>
      {blur && (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={id} x={-mx} y={-my} width={1 + 2 * mx} height={1 + 2 * my} colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${gx.toFixed(2)} ${gy.toFixed(2)}`} />
          </filter>
        </svg>
      )}
      {Array.from({length: n}).map((_, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, opacity: 1 / (i + 1), filter: blur ? `url(#${id})` : undefined}}>
          {render(f + shutter * PLAYBACK.rate * (0.5 - i / (n - 1)), i)}
        </div>
      ))}
    </div>
  );
};

// How many samples keep the fastest point within `step` px of its neighbour sample. `disp` is how far that
// point travels during the shutter (px).
export const nSamples = (disp: number, step = 4, max = 48) => (disp <= step * 0.75 ? 1 : Math.min(max, Math.ceil(disp / step) + 1));

// macOS-style pointer
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number; scale?: number}> = ({
  x,
  y,
  press = 0,
  opacity = 1,
  scale = 1,
}) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 24 24"
    style={{
      position: 'absolute',
      left: x - 4 * (44 / 24),
      top: y - 3 * (44 / 24),
      transform: `scale(${scale * (1 - 0.14 * press)})`,
      transformOrigin: `${4 * (44 / 24)}px ${3 * (44 / 24)}px`,
      opacity,
      overflow: 'visible',
      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.28))',
    }}
  >
    <path
      d="M4 3 L4 19.2 L8.1 15.3 L10.9 21.4 L13.6 20.2 L10.9 14.2 L16.6 14 Z"
      fill="#0A0A0A"
      stroke="#FFFFFF"
      strokeWidth={1.35}
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Kinetic type in the reference's language: letters rise from below a baseline mask with
// ~1.5 frame stagger, a slight rotation, and vertical blur proportional to their speed.
export type RiseOpts = {
  start: number;
  stagger?: number;
  k?: number;
  rise?: number; // em
  rot?: number; // deg
  exitAt?: number; // frame letters start leaving (upwards)
  exitStagger?: number;
  exitDir?: 1 | -1; // -1 up, 1 down
  mask?: boolean;
};

export const letterState = (f: number, i: number, o: RiseOpts) => {
  const s = o.start + i * (o.stagger ?? 1.5);
  const k = o.k ?? 0.2;
  const rise = o.rise ?? 0.95;
  const inY = (ff: number) => approach(ff, s, rise, 0, k);
  let y = inY(f);
  let vy = Math.abs(vel(inY, f));
  let rot = (o.rot ?? -9) * (f <= s ? 1 : Math.pow(1 - k * 0.85, f - s));
  let op = f < s ? 0 : clamp((f - s + 1) / 2.5);
  if (o.exitAt !== undefined) {
    const es = o.exitAt + i * (o.exitStagger ?? 1);
    const dir = o.exitDir ?? -1;
    const outY = (ff: number) => dir * 1.1 * E.exit(prog(ff, es, 9));
    const oy = outY(f);
    y += oy;
    vy += Math.abs(vel(outY, f));
    if (f > es) rot += dir * -6 * E.exit(prog(f, es, 9));
    if (f >= es + 9) op = 0;
  }
  return {y, vy, rot, op};
};

export const RiseText: React.FC<{
  f: number;
  text: string;
  size: number;
  opts: RiseOpts;
  color?: string;
  weight?: number;
  stretch?: number; // font-stretch %
  tracking?: number; // em
  family?: string;
  blurScale?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
  upper?: boolean;
  perLetterColor?: (i: number) => string | undefined;
}> = ({
  f,
  text,
  size,
  opts,
  color = C.ink,
  weight = 900,
  stretch = 70,
  tracking = -0.01,
  family = DISPLAY,
  blurScale = 1,
  style,
  lineHeight = 0.92,
  upper = true,
  perLetterColor,
}) => {
  const chars = Array.from(upper ? text.toUpperCase() : text);
  const mask = opts.mask ?? true;
  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontStretch: `${stretch}%`,
        fontSize: size,
        lineHeight,
        letterSpacing: `${tracking}em`,
        color,
        whiteSpace: 'pre',
        display: 'flex',
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const st = letterState(f, i, opts);
        const b = st.vy * size * 0.5 * blurScale;
        const inner = (
          <DirBlur y={b} style={{display: 'inline-block'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${st.y}em) rotate(${st.rot}deg)`,
                transformOrigin: '0% 100%',
                opacity: st.op,
                color: perLetterColor?.(i) ?? color,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          </DirBlur>
        );
        return mask ? (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.12em 0.02em 0.06em', margin: '-0.12em -0.02em -0.06em'}}>
            {inner}
          </span>
        ) : (
          <span key={i} style={{display: 'inline-block'}}>
            {inner}
          </span>
        );
      })}
    </div>
  );
};

// Word-by-word line for supporting copy (Inter). Words rise 0.45em and settle; exit up.
export const WordsLine: React.FC<{
  f: number;
  text: string;
  start: number;
  size: number;
  color?: string;
  weight?: number;
  stagger?: number;
  exitAt?: number;
  style?: React.CSSProperties;
  maxWidth?: number;
}> = ({f, text, start, size, color = C.ink, weight = 500, stagger = 2, exitAt, style, maxWidth}) => {
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: TEXT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.22,
        letterSpacing: size >= 40 ? '-0.015em' : '-0.005em',
        color,
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '0.26em',
        maxWidth,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = start + i * stagger;
        const yIn = (ff: number) => approach(ff, s, 0.5, 0, 0.18);
        let y = yIn(f);
        let v = Math.abs(vel(yIn, f));
        let op = f < s ? 0 : clamp((f - s + 1) / 4);
        if (exitAt !== undefined) {
          const es = exitAt + i * 1;
          const out = (ff: number) => -0.6 * E.exit(prog(ff, es, 8));
          y += out(f);
          v += Math.abs(vel(out, f));
          op *= 1 - prog(f, es + 2, 6);
        }
        return (
          <DirBlur key={i} y={v * size * 0.45} style={{display: 'inline-block'}}>
            <span style={{display: 'inline-block', transform: `translateY(${y}em)`, opacity: op}}>{w}</span>
          </DirBlur>
        );
      })}
    </div>
  );
};

// Thin callout: a line that draws on toward a detail, then a small label.
export const Callout: React.FC<{
  f: number;
  start: number;
  from: [number, number];
  to: [number, number];
  label: string;
  color?: string;
  side?: 'left' | 'right';
  exitAt?: number;
  size?: number;
}> = ({f, start, from, to, label, color = C.ink, side = 'right', exitAt, size = 24}) => {
  const p = E.prod(prog(f, start, 10));
  const lp = arrive(f, start + 6, 0.2);
  const out = exitAt !== undefined ? prog(f, exitAt, 6) : 0;
  if (f < start || out >= 1) return null;
  const x = lerp(from[0], to[0], p);
  const y = lerp(from[1], to[1], p);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={1.5} />
        <circle cx={from[0]} cy={from[1]} r={3.5 * clamp(p * 3)} fill={color} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: side === 'right' ? to[0] + 12 : undefined,
          right: side === 'left' ? 1920 - to[0] + 12 : undefined,
          top: to[1] - size * 0.62,
          fontFamily: TEXT,
          fontWeight: 600,
          fontSize: size,
          letterSpacing: '0.005em',
          color,
          whiteSpace: 'nowrap',
          opacity: lp,
          transform: `translateX(${(1 - lp) * (side === 'right' ? -10 : 10)}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
};
