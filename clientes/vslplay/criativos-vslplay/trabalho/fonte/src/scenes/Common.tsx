import React from 'react';
import {C, COL, TEXT} from '../theme';
import {arrive, clamp, Cursor, E, lerp, prog, RiseText, vel, WordsLine} from '../kit';

export const timeStr = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// Fictitious progress: fast at first, slow at the end (the same mapping drawn in the Barra Fictícia diagram)
export const FAKE_K = 2.4;
export const fakeOf = (p: number) => 1 - Math.pow(1 - clamp(p), FAKE_K);

// ---------------------------------------------------------------------------
// Chapter word: Archivo 900, letters rise from a baseline mask; the white dot drops in as the period.
// Archivo metrics at wdth 64 / wght 900: cap 0.686 em, period advance 0.228 em.
export const CH_SIZE = 340;
export const CH_STRETCH = 64;

export const ChapterWord: React.FC<{
  f: number;
  word: string; // without the period
  start: number;
  exitAt: number;
  color: string;
  dotAt: number; // frame the dot lands
}> = ({f, word, start, exitAt, color, dotAt}) => {
  if (f < start - 1 || f > exitAt + 16) return null;
  const S = CH_SIZE;
  const d = 0.2 * S; // the dot, a touch fuller than the glyph period
  // gravity fall from above the frame, 9 frames
  const fallFrames = 9;
  const t0 = dotAt - fallFrames;
  const yFall = (ff: number) => {
    const u = clamp((ff - t0) / fallFrames);
    return -900 * (1 - u * u);
  };
  let dy = f < dotAt ? yFall(f) : 0;
  let aspect = 1;
  if (f < dotAt) {
    const v = Math.abs(vel(yFall, f));
    aspect = lerp(1, 0.55, clamp(v / 190));
  } else {
    // floor: on a slowed stretch the source frame is fractional; the squash still gets its frames
    const k = Math.floor(f - dotAt);
    aspect = k === 0 ? 1.9 : k === 1 ? 0.9 : k === 2 ? 1.06 : 1;
  }
  const dotExit = exitAt + 3;
  if (f >= dotExit) {
    const up = (ff: number) => -1100 * E.exit(prog(ff, dotExit, 10));
    dy = up(f);
    aspect = lerp(1, 0.5, clamp(Math.abs(vel(up, f)) / 120));
  }
  const w = d * Math.sqrt(aspect);
  const h = d / Math.sqrt(aspect);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 540 - 0.5 * S, height: S, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', display: 'flex', paddingRight: 0.228 * S}}>
        <RiseText
          f={f}
          text={word}
          size={S}
          stretch={CH_STRETCH}
          weight={900}
          color={color}
          tracking={-0.012}
          lineHeight={1}
          opts={{start, stagger: 1.2, k: 0.2, rise: 1.0, rot: -7, exitAt, exitStagger: 0.6, exitDir: -1}}
        />
        {f >= t0 && f < dotExit + 12 && (
          <div
            style={{
              position: 'absolute',
              // period box starts where the letters end; the glyph's dot is centered at 0.114 em in its 0.228 em advance
              left: `calc(100% - ${0.228 * S}px + ${0.114 * S - w / 2}px)`,
              // baseline sits at (ascent - half leading) = 0.878 - 0.044 em from the top of a 1.0 line box
              top: 0.834 * S - h + dy,
              width: w,
              height: h,
              borderRadius: '50%',
              background: '#FFFFFF',
            }}
          />
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Left column: chapter tag, feature title (Archivo), one support line (Inter).
export type Feature = {at: number; until: number; lines: string[]; support: string};

export const TITLE_SIZE = 96;

export const FeatureText: React.FC<{
  f: number;
  tag: string;
  tagColor: string;
  items: Feature[];
  top?: number;
  ink?: string;
  sub?: string;
}> = ({f, tag, tagColor, items, top = 352, ink = C.ink, sub = '#4A4A50'}) => {
  const first = items[0];
  const last = items[items.length - 1];
  if (f < first.at - 2 || f > last.until + 14) return null;
  const tagIn = arrive(f, first.at, 0.2);
  const tagOut = E.exit(prog(f, last.until, 9));
  return (
    <div style={{position: 'absolute', left: COL.x, top, width: COL.w + 40}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 30,
          fontFamily: TEXT,
          fontWeight: 600,
          fontSize: 23,
          letterSpacing: '0.01em',
          color: ink,
          opacity: 0.62 * clamp(tagIn * 1.5) * (1 - tagOut),
          transform: `translateY(${(1 - tagIn) * 16 - tagOut * 16}px)`,
        }}
      >
        <div style={{width: 12, height: 12, borderRadius: 6, background: tagColor, opacity: 1 / 0.62}} />
        {tag}
      </div>
      <div style={{position: 'relative', marginTop: 20}}>
        {items.map((it, idx) => {
          if (f < it.at - 1 || f > it.until + 14) return null;
          return (
            <div key={idx} style={{position: 'absolute', left: 0, top: 0}}>
              {it.lines.map((ln, li) => (
                <RiseText
                  key={li}
                  f={f}
                  text={ln}
                  size={TITLE_SIZE}
                  stretch={CH_STRETCH}
                  weight={900}
                  color={ink}
                  tracking={-0.008}
                  lineHeight={0.94}
                  opts={{start: it.at + li * 3, stagger: 1, k: 0.2, rise: 1.0, rot: -6, exitAt: it.until + li * 1.5, exitStagger: 0.5, exitDir: -1}}
                />
              ))}
              <div style={{marginTop: 26}}>
                <WordsLine f={f} text={it.support} start={it.at + 7} size={34} weight={500} color={sub} stagger={1.6} exitAt={it.until} maxWidth={COL.w} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Cursor path: holds between moves, each move eased (human hand: accelerate, then land soft).
export type CursorKey = {at: number; x: number; y: number; dur?: number};
export const cursorPos = (f: number, keys: CursorKey[]) => {
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const t = E.expr(prog(f, k.at, k.dur ?? 16));
    x = lerp(x, k.x, t);
    y = lerp(y, k.y, t);
  }
  return {x, y};
};
// press 0..1: down over 2 frames, up over 4
export const pressAt = (f: number, at: number) => {
  if (f < at - 2 || f > at + 5) return 0;
  if (f <= at) return E.inQuad(clamp((f - (at - 2)) / 2));
  return 1 - E.outCubic(clamp((f - at) / 5));
};

export const CursorTrack: React.FC<{f: number; keys: CursorKey[]; clicks: number[]; show: [number, number]; n?: number}> = ({f, keys, clicks, show, n = 6}) => {
  if (f < show[0] || f > show[1] + 8) return null;
  const op = clamp((f - show[0]) / 3) * (1 - clamp((f - show[1]) / 6));
  const press = Math.max(...clicks.map((c) => pressAt(f, c)), 0);
  const v = cursorPos(f + 0.5, keys);
  const u = cursorPos(f - 0.5, keys);
  const speed = Math.hypot(v.x - u.x, v.y - u.y);
  // a sample every 2 px of travel during the half-frame shutter (6 fixed samples strobed into 4-5 copies of
  // the arrow at full speed, v4 critique); `n` is the least
  const samples = speed > 6 ? Math.min(24, Math.max(n, Math.ceil((speed * 0.5) / 2) + 1)) : 1;
  return (
    <div style={{position: 'absolute', inset: 0, isolation: 'isolate', opacity: op}}>
      {Array.from({length: samples}).map((_, i) => {
        const ff = samples === 1 ? f : f + 0.5 * (0.5 - i / (samples - 1));
        const p = cursorPos(ff, keys);
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: 1 / (i + 1)}}>
            <Cursor x={p.x} y={p.y} press={press} />
          </div>
        );
      })}
    </div>
  );
};

// A click ripple on the exact click frame (thin ring, 10 frames)
export const ClickRing: React.FC<{f: number; at: number; x: number; y: number; color?: string}> = ({f, at, x, y, color = '#FFFFFF'}) => {
  if (f < at || f > at + 10) return null;
  const t = E.enter(prog(f, at, 10));
  const R = lerp(10, 46, t);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - R,
        top: y - R,
        width: R * 2,
        height: R * 2,
        borderRadius: '50%',
        boxShadow: `inset 0 0 0 ${lerp(3, 1, t)}px ${color}`,
        opacity: 1 - t,
      }}
    />
  );
};

// Stage camera: composes a transform about the frame. Returns CSS transform for a 1920x1080 stage.
export const pushIn = (f: number, from: number, rate = 0.00025, px = 960, py = 540) => {
  const s = 1 + rate * Math.max(0, f - from);
  return `translate(${px}px, ${py}px) scale(${s}) translate(${-px}px, ${-py}px)`;
};

// ---- the chapter 3 -> price whip: both stages on one strip ---------------------------------------
export const WHIP = {a: 961, b: 971};
export const whipX = (ff: number) => -1920 * E.expr(prog(ff, WHIP.a, WHIP.b - WHIP.a));
// A row carried by the whip on a damped spring (damping on the velocity relative to the strip): it trails
// while the strip accelerates, runs past its mark while the strip brakes, then settles. Returns the row's
// extra x offset, scaled by `amt` so the follow-through reads without tearing the layout apart.
export const whipDrag = (ff: number, w: number, z = 0.5, amt = 0.16) => {
  if (ff <= WHIP.a || ff >= WHIP.b + 30) return 0;
  const dt = 1 / 8;
  let x = 0;
  let v = 0;
  for (let t = WHIP.a; t < ff - 1e-9; t += dt) {
    const h = Math.min(dt, ff - t);
    const vt = (whipX(t + h) - whipX(t)) / h;
    const a = w * w * (whipX(t + h) - x) + 2 * z * w * (vt - v);
    v += a * h;
    x += v * h;
  }
  return amt * (x - whipX(ff));
};

// ---- feature camera: pushes into the player on each feature's action ------------------------------
// screen = C + s * (world - A). The player may grow past its rest box; it is then cut to WIN, the frame
// right of the text column, with rounded corners and its shadow redrawn on the visible rect.
export type Cam = {ax: number; ay: number; cx: number; cy: number; s: number};
export type Rect = {l: number; t: number; r: number; b: number};
export const WIN: Rect = {l: 648, t: 96, r: 1824, b: 984};
export const FULL: Rect = {l: 0, t: 0, r: 1920, b: 1080};
export const CAM_ID: Cam = {ax: 960, ay: 540, cx: 960, cy: 540, s: 1};
export const camCss = (c: Cam) => `translate(${c.cx}px, ${c.cy}px) scale(${c.s}) translate(${-c.ax}px, ${-c.ay}px)`;
export const camPt = (c: Cam, x: number, y: number) => ({x: c.cx + c.s * (x - c.ax), y: c.cy + c.s * (y - c.ay)});
// a push around the anchor A: A slides from its rest position to C while the scale grows (log-linear)
export const pushCam = (A: {x: number; y: number}, Cc: {x: number; y: number}, s1: number, t: number): Cam => ({
  ax: A.x,
  ay: A.y,
  cx: lerp(A.x, Cc.x, t),
  cy: lerp(A.y, Cc.y, t),
  s: Math.exp(Math.log(s1) * t),
});
// the same camera described around another anchor (screen positions unchanged)
export const reanchor = (c: Cam, x: number, y: number): Cam => ({ax: x, ay: y, cx: c.cx + c.s * (x - c.ax), cy: c.cy + c.s * (y - c.ay), s: c.s});
// camera between two framings: the anchor's screen position moves in a straight line, the scale log-linearly
export const camLerp = (a: Cam, b: Cam, t: number, anchor: {x: number; y: number} = {x: a.ax, y: a.ay}): Cam => {
  const A = reanchor(a, anchor.x, anchor.y);
  const B = reanchor(b, anchor.x, anchor.y);
  return {ax: anchor.x, ay: anchor.y, cx: lerp(A.cx, B.cx, t), cy: lerp(A.cy, B.cy, t), s: Math.exp(lerp(Math.log(A.s), Math.log(B.s), t))};
};
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({l: lerp(a.l, b.l, t), t: lerp(a.t, b.t, t), r: lerp(a.r, b.r, t), b: lerp(a.b, b.b, t)});
// how far the player's corners travel on screen during the shutter (for adaptive motion blur)
export const camDispOf = (camAt: (ff: number) => Cam, f: number, shutter: number, box: {x: number; y: number; w: number; h: number}) => {
  const a = camAt(f - shutter / 2);
  const b = camAt(f + shutter / 2);
  let d = 0;
  for (const [x, y] of [
    [box.x, box.y],
    [box.x + box.w, box.y],
    [box.x, box.y + box.h],
    [box.x + box.w, box.y + box.h],
  ]) {
    const p = camPt(a, x, y);
    const q = camPt(b, x, y);
    d = Math.max(d, Math.hypot(q.x - p.x, q.y - p.y));
  }
  return d;
};
export const PLAYER_SHADOW = '0 22px 46px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.06)';
