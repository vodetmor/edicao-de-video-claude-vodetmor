// Legenda contínua (DESIGN-SYSTEM): Inter 500, 50 px a 1080p, base a 87% da altura, sem caixa, sem karaokê.
// Frases montadas sozinhas a partir das palavras: quebra na pontuação ou a cada ~26 caracteres.
import React from 'react';
import {C, TEXT} from '../../theme';
import {approach, prog} from '../../kit';
import type {BlocoProps} from '../tipos';

type P = {cor?: string; base?: number; tam?: number; max?: number; ultima?: string}; // ultima: última palavra legendada

export const Legenda: React.FC<BlocoProps<P>> = ({f, dur, h, t, inicio, palavras, p}) => {
  const max = p.max ?? 26;
  const lim = inicio + (p.ultima ? t(p.ultima) : dur - 1);
  const ws = palavras.filter((x) => x.f >= inicio && x.f <= lim);
  const frases: {txt: string; a: number; b: number}[] = [];
  let cur: typeof ws = [];
  const flush = () => {
    if (cur.length) frases.push({txt: cur.map((x) => x.w).join(' '), a: cur[0].f - inicio, b: cur[cur.length - 1].fe - inicio});
    cur = [];
  };
  for (const x of ws) {
    const len = [...cur, x].map((y) => y.w).join(' ').length;
    if (cur.length && len > max) flush();
    cur.push(x);
    if (/[.,!?;:]$/.test(x.w)) flush();
  }
  flush();
  const i = frases.findIndex((fr, k) => f >= fr.a - 2 && (k === frases.length - 1 || f < frases[k + 1].a - 2));
  if (i < 0) return null;
  const fr = frases[i];
  const y = approach(f, fr.a - 2, 14, 0, 0.3);
  const op = prog(f, fr.a - 2, 3) * (1 - prog(f, Math.max(fr.b + 12, dur - 4), 4));
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: h * (1 - (p.base ?? 0.87)),
        textAlign: 'center',
        fontFamily: TEXT,
        fontWeight: 500,
        fontSize: p.tam ?? 50,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        color: (C as any)[p.cor ?? ''] ?? p.cor ?? C.ink,
        transform: `translateY(${y}px)`,
        opacity: op,
      }}
    >
      {fr.txt.replace(/[.,]$/, '')}
    </div>
  );
};
