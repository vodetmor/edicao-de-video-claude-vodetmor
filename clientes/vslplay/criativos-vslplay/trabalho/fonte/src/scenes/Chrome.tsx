import React from 'react';
import {C, TEXT} from '../theme';
import {T} from '../timeline';
import {clamp, mixColor} from '../kit';
import {OUT_DURATION, outAt} from '../warp';

// The film behaves like a video playing inside the player: a tiny timecode at the upper right and a hairline
// progress track along the bottom with the three chapter marks (diamonds only; the chapter words already name them). Always under 35% opacity; its color follows
// the stage under it (white on black and violet, ink on paper, coral and cyan). It bows out when the mark
// starts to rebuild, so the end card stays clean.
const DUR = OUT_DURATION; // output frames (the narrated cut is longer than the 1440-frame source)
const LINE = {x0: 96, x1: 1824, y: 1046};
const MARKS = [
  {at: T.cardA, label: 'atenção'},
  {at: T.cardB, label: 'retenção'},
  {at: T.cardC, label: 'conversão'},
];
const OUT = {a: T.anticip, d: 8};

// 0 = dark stage (white chrome), 1 = light stage (ink chrome); short ramps where a field sweeps over the chrome
const RAMPS: [number, number, number, number][] = [
  [242, 248, 0, 1], // the Coral field fills the frame
  [720, 726, 1, 0], // the Violet field fills the frame
  [759, 764, 0, 1], // the Violet field collapses, paper again
];
const lightAt = (f: number) => {
  if (f >= T.final) return 0;
  if (f >= T.integr) return 1;
  if (f >= T.more) return 0;
  let v = 0;
  for (const [a, b, from, to] of RAMPS) {
    if (f >= b) v = to;
    else if (f >= a) return from + (to - from) * ((f - a) / (b - a));
  }
  return v;
};

// the player's own readout, elapsed / total ("0:16 / 0:48"): a frame counter read as an editor's timeline
const tc = (f: number) => {
  const m = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  return `${m(Math.floor(f / 30))} / ${m(Math.round(DUR / 30))}`; // f: output frame
};

// f: source frame (what is on stage), fo: output frame (the readout and the progress head)
export const Chrome: React.FC<{f: number; fo?: number}> = ({f, fo = f}) => {
  const vis = clamp(f / 8) * (1 - clamp((f - OUT.a) / OUT.d));
  if (vis <= 0) return null;
  const col = mixColor('#FFFFFF', C.ink, lightAt(f));
  const xAt = (fr: number) => LINE.x0 + (LINE.x1 - LINE.x0) * (fr / DUR);
  const head = xAt(fo);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: vis, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', right: 1920 - LINE.x1, top: 42, fontFamily: TEXT, fontWeight: 500, fontSize: 23, color: col, opacity: 0.34, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em'}}>{tc(fo)}</div>
      <div style={{position: 'absolute', left: LINE.x0, top: LINE.y, width: LINE.x1 - LINE.x0, height: 1, background: col, opacity: 0.14}} />
      <div style={{position: 'absolute', left: LINE.x0, top: LINE.y, width: head - LINE.x0, height: 1, background: col, opacity: 0.34}} />
      {MARKS.map((m) => {
        const x = xAt(outAt(m.at));
        const passed = f >= m.at;
        return (
          <React.Fragment key={m.label}>
            <div style={{position: 'absolute', left: x - 4, top: LINE.y - 4, width: 8, height: 8, background: col, opacity: passed ? 0.34 : 0.18, transform: 'rotate(45deg)'}} />
          </React.Fragment>
        );
      })}
    </div>
  );
};
