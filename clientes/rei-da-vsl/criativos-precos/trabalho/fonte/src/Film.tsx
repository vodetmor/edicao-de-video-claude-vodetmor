import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Hud, useFonts, approach, clamp, DirBlur, vel} from './ui';

export type Enter = 'cut' | 'whipL' | 'whipR' | 'whipU' | 'whipD' | 'punch' | 'zoomOut';
export type Shot = {
  n: string;
  bg: string;
  hud: string;
  enter?: Enter;
  push?: number; // camera push-in per frame (fraction)
  shake?: number[]; // absolute frames of impacts
  render: (f: number, F: number, d: number) => React.ReactNode; // local frame, absolute frame, duration
};
export type Cues = {dur: number; ini: Record<string, number>; fim: Record<string, number>; ev: Record<string, any>};

const enterXY = (e: Enter, f: number) => {
  const p = (ff: number) => 1 - approach(ff, 0, 0, 1, 0.32);
  const k = (ff: number) => p(ff) * 300;
  switch (e) {
    case 'whipL':
      return {x: k(f), y: 0, vx: Math.abs(vel(k, f)), vy: 0};
    case 'whipR':
      return {x: -k(f), y: 0, vx: Math.abs(vel(k, f)), vy: 0};
    case 'whipU':
      return {x: 0, y: k(f) * 1.4, vx: 0, vy: Math.abs(vel(k, f)) * 1.4};
    case 'whipD':
      return {x: 0, y: -k(f) * 1.4, vx: 0, vy: Math.abs(vel(k, f)) * 1.4};
    default:
      return {x: 0, y: 0, vx: 0, vy: 0};
  }
};

export const Film: React.FC<{cues: Cues; shots: Shot[]; cod: string}> = ({cues, shots, cod}) => {
  useFonts();
  const F = useCurrentFrame();
  let idx = 0;
  shots.forEach((s, i) => {
    if (F >= cues.ini[s.n]) idx = i;
  });
  const s = shots[idx];
  const ini = cues.ini[s.n];
  const d = cues.fim[s.n] - ini;
  const f = F - ini;
  const e = s.enter ?? 'punch';
  const m = enterXY(e, f);
  let sc = 1 + (s.push ?? 0.0007) * f;
  if (e === 'punch') sc *= 1 + 0.07 * Math.pow(1 - 0.3, f);
  if (e === 'zoomOut') sc *= 1 - 0.12 * Math.pow(1 - 0.28, f);
  let sy = 0;
  let sx = 0;
  for (const t of s.shake ?? []) {
    const u = F - t;
    if (u >= 0 && u < 14) {
      const a = 7 * Math.exp(-u * 0.32);
      sy += a * Math.sin(u * 2.4);
      sx += a * 0.5 * Math.sin(u * 3.1 + 1);
    }
  }
  return (
    <AbsoluteFill style={{background: s.bg}}>
      <Stage bg={s.bg}>
        <DirBlur x={Math.min(40, m.vx * 0.9)} y={Math.min(40, m.vy * 0.9)} style={{position: 'absolute', inset: 0}}>
          <div style={{position: 'absolute', inset: 0, transform: `translate(${m.x + sx}px, ${m.y + sy}px) scale(${sc})`, transformOrigin: '50% 50%'}}>
            {s.render(f, F, d)}
          </div>
        </DirBlur>
        <Hud f={F} cod={cod} cor={s.hud} />
      </Stage>
    </AbsoluteFill>
  );
};

export const at = (cues: Cues, n: string) => (abs: number) => abs - cues.ini[n];
export {clamp};
