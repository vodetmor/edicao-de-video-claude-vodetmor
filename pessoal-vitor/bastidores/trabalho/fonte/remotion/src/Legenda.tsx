import React from 'react';
import {useCurrentFrame} from 'remotion';
import leg from './data/legenda.json';
import {spring, clamp} from './kit';
import {DISPLAY} from './Fonts';
import {FPS, UI} from './lib';

// Legenda palavra por palavra: a página entra com mola, a palavra falada acende, palavra-chave em coral.
export const Legenda: React.FC<{y?: number; hide?: (f: number) => boolean}> = ({y = 1540, hide}) => {
  const f = useCurrentFrame();
  if (hide && hide(f)) return null;
  const t = f / FPS;
  const pg = (leg as any[]).find((p) => t >= p.s - 0.05 && t < p.e);
  if (!pg) return null;
  const f0 = Math.round(pg.s * FPS);
  const sIn = spring(f, f0 - 1, 0.55, 0.62);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 26px',
      transform: `translateY(${(1 - sIn) * 26}px) scale(${0.9 + 0.1 * sIn})`, opacity: clamp(sIn * 1.6)}}>
      {pg.w.map((w: any, i: number) => {
        const on = t >= w.s - 0.03;
        const fw = Math.round(w.s * FPS);
        const pop = spring(f, fw - 1, 0.7, 0.5);
        const cor = w.k ? UI.coral : '#FFFFFF';
        return (
          <span key={i} style={{fontFamily: DISPLAY, fontWeight: 900, fontStretch: '100%', fontSize: 84, lineHeight: 1.08, letterSpacing: -1,
            color: on ? cor : 'rgba(255,255,255,0.55)', display: 'inline-block',
            transform: `scale(${on ? 1 + 0.12 * Math.max(0, 1 - pop) + 0.02 * (w.k ? 1 : 0) : 1})`,
            textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.9)',
            WebkitTextStroke: '2px rgba(0,0,0,0.35)'}}>{w.t}</span>
        );
      })}
    </div>
  );
};
