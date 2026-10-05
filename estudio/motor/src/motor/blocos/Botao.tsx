// Botão de compra (CTA): nasce com mola, "alerta" (tremida + anel) numa palavra, e pode mudar de lugar noutra.
import React from 'react';
import {C, TEXT} from '../../theme';
import {E, hash, prog, spring, tween} from '../../kit';
import type {BlocoProps} from '../tipos';

type P = {texto?: string; y?: number; cor?: string; alerta?: string; move?: {em: string; y: number; escala: number}; sai?: string};

export const Botao: React.FC<BlocoProps<P>> = ({f, dur, h, t, p}) => {
  const sp = spring(f, 0, 0.42, 0.5);
  const sai = p.sai ? t(p.sai) : dur - 8;
  const out = E.exit(prog(f, sai, 8));
  let y = (p.y ?? 0.5) * h;
  let esc = 1;
  if (p.move) {
    const m = t(p.move.em);
    y = tween(f, m, 16, y, p.move.y * h, E.cam);
    esc = tween(f, m, 16, 1, p.move.escala, E.cam);
  }
  const a = p.alerta ? t(p.alerta) : 1e9;
  const shake = f >= a ? Math.exp(-(f - a) / 5) * Math.sin((f - a) * 2.6) * 22 : 0;
  const ring = prog(f, a, 16);
  const cor = (C as any)[p.cor ?? ''] ?? p.cor ?? C.coral;
  return (
    <div style={{position: 'absolute', left: '50%', top: y, transform: `translate(calc(-50% + ${shake}px), -50%) scale(${sp * esc * (1 - out)})`}}>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: 999,
            border: `${6 * (1 - ring)}px solid ${cor}`,
            transform: `scale(${1 + ring * 0.35})`,
            opacity: 1 - ring,
          }}
        />
      )}
      <div
        style={{
          fontFamily: TEXT,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: '-0.01em',
          color: C.white,
          background: cor,
          padding: '34px 72px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
          boxShadow: `0 ${18 + hash(1) * 0}px 40px rgba(17,17,19,0.16)`,
        }}
      >
        {p.texto ?? 'Comprar agora'}
      </div>
    </div>
  );
};
