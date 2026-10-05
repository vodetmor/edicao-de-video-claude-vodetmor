// Slam: uma palavra que cai do "alto" (escala 2,4 -> 1) com desfoque de velocidade e tremida curta ao bater.
import React from 'react';
import {C, DISPLAY} from '../../theme';
import {approach, E, hash, prog, vel} from '../../kit';
import type {BlocoProps} from '../tipos';

type P = {texto: string; cor?: string; tam?: number; y?: number; sai?: string};

export const Slam: React.FC<BlocoProps<P>> = ({f, dur, h, t, p}) => {
  const tam = p.tam ?? 230;
  const sai = p.sai ? t(p.sai) : dur - 8;
  const sc = (ff: number) => approach(ff, 0, 2.4, 1, 0.34);
  const s = sc(f) * (1 - 0.35 * E.exit(prog(f, sai, 8)));
  const blur = Math.abs(vel(sc, f)) * 22;
  const land = f >= 4 ? Math.exp(-(f - 4) / 3.5) : 0;
  const sx = (hash(f, 3) - 0.5) * 26 * land;
  const sy = (hash(f, 7) - 0.5) * 18 * land;
  const op = Math.min(1, (f + 1) / 2) * (1 - prog(f, sai + 2, 6));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: (p.y ?? 0.35) * h,
        textAlign: 'center',
        transform: `translate(${sx}px, calc(-50% + ${sy}px)) scale(${s})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        opacity: op,
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontStretch: '66%',
        fontSize: tam,
        lineHeight: 0.9,
        letterSpacing: '-0.01em',
        color: (C as any)[p.cor ?? ''] ?? p.cor ?? C.coral,
      }}
    >
      {p.texto.toUpperCase()}
    </div>
  );
};
