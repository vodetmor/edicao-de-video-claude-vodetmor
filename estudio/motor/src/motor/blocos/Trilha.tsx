// Trilha: a linha do tempo da VSL (0 a N min) com marcas que nascem nas palavras e um "vão" medido entre duas.
import React from 'react';
import {C, DISPLAY, TEXT} from '../../theme';
import {approach, E, prog, spring} from '../../kit';
import type {BlocoProps} from '../tipos';

type Marca = {seg: number; rotulo: string; cor?: string; em: string; lado?: 'cima' | 'baixo'};
type P = {y?: number; totalSeg?: number; marcas: Marca[]; cabeca?: {de: string; ate: string; seg0: number; seg1: number}; vao?: {de: number; ate: number; rotulo: string; em: string; cor?: string}; sai?: string};

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const cor = (c?: string, d = C.ink) => (C as any)[c ?? ''] ?? c ?? d;

export const Trilha: React.FC<BlocoProps<P>> = ({f, dur, w, h, t, p}) => {
  const total = p.totalSeg ?? 900;
  const L = w * 0.08;
  const BW = w * 0.84;
  const Y = (p.y ?? 0.55) * h;
  const sai = p.sai ? t(p.sai) : dur - 8;
  const out = E.exit(prog(f, sai, 8));
  const draw = E.prod(prog(f, 0, 16));
  const X = (s: number) => L + (s / total) * BW;
  const vao = p.vao;
  const vd = vao ? E.expr(prog(f, t(vao.em), 14)) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${out * -40}px)`}}>
      {/* trilho */}
      <div style={{position: 'absolute', left: L, top: Y - 5, width: BW, height: 10, borderRadius: 5, background: C.line, transformOrigin: '0 50%', transform: `scaleX(${draw})`}} />
      {/* cabeça de leitura: a VSL "tocando" entre duas palavras */}
      {p.cabeca && f >= t(p.cabeca.de) && (
        <div
          style={{
            position: 'absolute',
            left: X(p.cabeca.seg0),
            top: Y - 5,
            height: 10,
            borderRadius: 5,
            background: C.ink,
            width: X(p.cabeca.seg0 + (p.cabeca.seg1 - p.cabeca.seg0) * E.cam(prog(f, t(p.cabeca.de), t(p.cabeca.ate) - t(p.cabeca.de)))) - X(p.cabeca.seg0),
          }}
        />
      )}
      {[0, total].map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: Y + 34,
            left: X(s),
            transform: `translateX(${i ? '-100%' : '0'})`,
            fontFamily: TEXT,
            fontWeight: 500,
            fontSize: 32,
            color: C.gray,
            opacity: prog(f, 6 + i * 4, 8),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {mmss(s)}
        </div>
      ))}
      {/* marcas */}
      {p.marcas.map((m, i) => {
        const s0 = t(m.em);
        const pop = spring(f, s0, 0.45, 0.55);
        const lab = approach(f, s0 + 3, 1, 0, 0.2);
        const up = (m.lado ?? 'cima') === 'cima';
        const c = cor(m.cor, C.coral);
        const x = X(m.seg);
        const nearLeft = x < w * 0.25;
        const nearRight = x > w * 0.75;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 18, top: Y - 18, width: 36, height: 36, borderRadius: 18, background: c, border: `6px solid ${C.paper}`, boxSizing: 'border-box', transform: `scale(${pop})`}} />
            <div style={{position: 'absolute', left: x - 2, top: up ? Y - 90 : Y + 18, width: 4, height: 72, background: c, transformOrigin: up ? '50% 100%' : '50% 0', transform: `scaleY(${E.prod(prog(f, s0 + 2, 8))})`}} />
            <div
              style={{
                position: 'absolute',
                left: x,
                top: up ? Y - 96 : Y + 96,
                transform: `translate(${nearLeft ? '-14%' : nearRight ? '-86%' : '-50%'}, ${up ? '-100%' : '0'}) translateY(${lab * (up ? 30 : -30)}px)`,
                opacity: 1 - lab,
                textAlign: 'center',
              }}
            >
              <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', color: c}}>{m.rotulo.toUpperCase()}</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 900, fontStretch: '66%', fontSize: 96, lineHeight: 0.95, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{mmss(m.seg)}</div>
            </div>
          </React.Fragment>
        );
      })}
      {/* vão medido entre duas marcas */}
      {vao && vd > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: X(p.marcas[vao.de].seg),
              top: Y + 110,
              width: (X(p.marcas[vao.ate].seg) - X(p.marcas[vao.de].seg)) * vd,
              height: 26,
              borderLeft: `4px solid ${cor(vao.cor, C.coral)}`,
              borderRight: vd > 0.98 ? `4px solid ${cor(vao.cor, C.coral)}` : undefined,
              borderBottom: `4px solid ${cor(vao.cor, C.coral)}`,
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (X(p.marcas[vao.de].seg) + X(p.marcas[vao.ate].seg)) / 2,
              top: Y + 160,
              transform: `translate(-50%, ${approach(f, t(vao.em) + 6, 40, 0, 0.2)}px)`,
              opacity: prog(f, t(vao.em) + 6, 6),
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontStretch: '66%',
              fontSize: 84,
              whiteSpace: 'nowrap',
              color: cor(vao.cor, C.coral),
            }}
          >
            {vao.rotulo.toUpperCase()}
          </div>
        </>
      )}
    </div>
  );
};
