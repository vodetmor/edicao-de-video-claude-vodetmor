import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {approach, clamp, E, nSamples, prog, Samples} from '../kit';
import {ICON_C, IconState, Lockup, Piece} from '../Logo';

// One ribbon of the real mark flies in at logo scale (real texture), then grows toward the camera about a
// point deep inside its own shape and flattens into its chapter color: the same grammar as the
// deconstruction, where the warm ribbon became the Coral field.
type Kind = 'cool' | 'purple';
const PIVOT: Record<Kind, {x: number; y: number}> = {
  cool: {x: 130, y: 330}, // center of the largest circle inside the cool ribbon
  purple: {x: 392, y: 640},
};
const FLAT: Record<Kind, string> = {cool: C.cyan, purple: C.violet};

export const ribbonPlace = (kind: Kind, f: number, start: number) => {
  const s = 0.6;
  if (kind === 'cool') {
    return {cx: approach(f, start, -620, 700, 0.2), cy: approach(f, start, 610, 540, 0.2), s};
  }
  return {cx: approach(f, start, 1080, 960, 0.2), cy: approach(f, start, 1500, 640, 0.2), s};
};

// growth toward the camera: frames, and the scale range over which the texture flattens into the field color.
// The purple ribbon out of its mark is an odd boot-shaped silhouette, so it grows faster and goes flat sooner
// (v2 critique: an unrecognisable blob over the chart); the cool one reads as a clean crescent and keeps its pace.
const GROW: Record<Kind, {d: number; f0: number; f1: number}> = {
  cool: {d: 10, f0: 1.15, f1: 2.55},
  purple: {d: 7, f0: 1.05, f1: 1.75},
};
const ribbonState = (kind: Kind, ff: number, start: number, growAt: number): {icon: IconState; place: {cx: number; cy: number; s: number}} => {
  const place = ribbonPlace(kind, ff, start);
  const rot0 = kind === 'cool' ? -38 : 30;
  const rot = rot0 * Math.pow(0.8, Math.max(0, ff - start));
  const G = GROW[kind];
  const g = E.expr(prog(ff, growAt, G.d));
  const sc = Math.pow(18, g);
  const pv = PIVOT[kind];
  const pivScreen = {x: place.cx + (pv.x - ICON_C) * place.s, y: place.cy + (pv.y - ICON_C) * place.s};
  const dx = ((960 - pivScreen.x) / place.s) * g;
  const dy = ((540 - pivScreen.y) / place.s) * g;
  const piece: Piece = {rot, s: sc, px: pv.x, py: pv.y, x: dx, y: dy, flat: clamp((sc - G.f0) / (G.f1 - G.f0)), op: 1};
  const off: Piece = {op: 0};
  const icon: IconState = {
    cool: kind === 'cool' ? piece : off,
    warm: off,
    purple: kind === 'purple' ? piece : off,
    tri: {fill: '#000', op: 0},
    noHole: g > 0.02,
  };
  return {icon, place};
};

// how far the fastest edge travels during the shutter: the flight, the settling rotation (far edge ~450
// units out) and the growth toward the camera (visible edges up to ~1100 px from the pivot)
const SHUTTER = 0.55;
const ribbonDisp = (kind: Kind, f: number, start: number, growAt: number) => {
  const a = f - SHUTTER / 2;
  const b = f + SHUTTER / 2;
  const pa = ribbonPlace(kind, a, start);
  const pb = ribbonPlace(kind, b, start);
  const rot0 = kind === 'cool' ? -38 : 30;
  const r = (ff: number) => rot0 * Math.pow(0.8, Math.max(0, ff - start));
  const g = (ff: number) => E.expr(prog(ff, growAt, GROW[kind].d));
  const fly = Math.hypot(pb.cx - pa.cx, pb.cy - pa.cy) + 450 * 0.6 * Math.pow(18, g(b)) * ((Math.abs(r(b) - r(a)) * Math.PI) / 180);
  return Math.max(fly, 1100 * Math.log(18) * Math.abs(g(b) - g(a)));
};

export const RibbonField: React.FC<{f: number; kind: Kind; start: number; growAt: number; full: number; until?: number}> = ({
  f,
  kind,
  start,
  growAt,
  full,
  until,
}) => {
  if (f < start || f > (until ?? full + 1)) return null;
  if (f >= full) return <AbsoluteFill style={{background: FLAT[kind]}} />;
  // the tip of a growing ribbon is a thin point moving fast: a sample every 3 px, and while it grows each sample
  // is softened by half its spacing so neighbouring copies of the point merge (48 plain samples left ~20
  // separate hairlines at the violet tip on f719, v4 critique)
  const disp = ribbonDisp(kind, f, start, growAt);
  const n = nSamples(disp, 3, 96);
  const sig = n > 1 && f >= growAt ? Math.min(2.5, (0.55 * disp) / (n - 1)) : 0;
  return (
    <Samples
      f={f}
      n={n}
      gap={sig > 0.6 ? {x: sig, y: sig} : undefined}
      shutter={SHUTTER}
      render={(ff, i) => {
        const {icon, place} = ribbonState(kind, ff, start, growAt);
        return <Lockup place={place} icon={icon} word={null} uid={`rb${kind}${i}`} stage={C.paper} />;
      }}
    />
  );
};
