// Primitivas do palco: seta, bola, rótulo em KaTeX, texto.
import React from 'react';
import {C, INTER} from './estilo';
import {Tex} from './Tex';

export const Seta: React.FC<{x1: number; y1: number; x2: number; y2: number; cor?: string; w?: number; cresce?: number; op?: number; cabeca?: number; tracejada?: boolean}> = ({x1, y1, x2, y2, cor = C.tinta, w = 5, cresce = 1, op = 1, cabeca = 20, tracejada}) => {
  if (cresce <= 0.001 || op <= 0.001) return null;
  const dx = (x2 - x1) * cresce, dy = (y2 - y1) * cresce;
  const L = Math.hypot(dx, dy);
  if (L < 0.5) return null;
  const ux = dx / L, uy = dy / L;
  const hb = Math.min(cabeca, L * 0.6); // cabeça encolhe em seta curta
  const bx = x1 + dx - ux * hb, by = y1 + dy - uy * hb;
  const px = -uy * hb * 0.48, py = ux * hb * 0.48;
  return (
    <g opacity={op}>
      <line x1={x1} y1={y1} x2={bx + ux * 1} y2={by + uy * 1} stroke={cor} strokeWidth={w} strokeLinecap="round" strokeDasharray={tracejada ? '10 9' : undefined} />
      <path d={`M ${x1 + dx} ${y1 + dy} L ${bx + px} ${by + py} L ${bx - px} ${by - py} Z`} fill={cor} stroke={cor} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
};

export const Bola: React.FC<{X: number; Y: number; r?: number; op?: number; fant?: boolean; cor?: string; esc?: number}> = ({X, Y, r = 15, op = 1, fant, cor = C.tinta, esc = 1}) => {
  if (op <= 0.001) return null;
  const R = r * esc;
  if (fant) return <circle cx={X} cy={Y} r={R} fill={cor} opacity={op * 0.16} />;
  return (
    <g opacity={op}>
      <circle cx={X} cy={Y} r={R} fill={cor} />
      <circle cx={X - R * 0.32} cy={Y - R * 0.34} r={R * 0.28} fill="#fff" opacity={0.22} />
    </g>
  );
};

// rótulo HTML posicionado no palco (centro do texto em X,Y)
export const Rotulo: React.FC<{X: number; Y: number; tex?: string; txt?: string; size?: number; cor?: string; op?: number; ancora?: 'c' | 'e' | 'd'; peso?: number; dy?: number}> = ({X, Y, tex, txt, size = 38, cor = C.tinta, op = 1, ancora = 'c', peso = 500, dy = 0}) => {
  if (op <= 0.001) return null;
  const tx = ancora === 'c' ? '-50%' : ancora === 'e' ? '0%' : '-100%';
  return (
    <div style={{position: 'absolute', left: X, top: Y, transform: `translate(${tx}, -50%) translateY(${dy}px)`, opacity: op, color: cor, fontFamily: INTER, fontWeight: peso, fontSize: size, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>
      {tex ? <Tex t={tex} size={size} color={cor} /> : txt}
    </div>
  );
};

// arco de ângulo (graus a partir do eixo x, sentido anti-horário na tela)
export const Arco: React.FC<{X: number; Y: number; r: number; a0: number; a1: number; cor?: string; w?: number; op?: number}> = ({X, Y, r, a0, a1, cor = C.tinta, w = 3, op = 1}) => {
  if (op <= 0.001 || Math.abs(a1 - a0) < 0.1) return null;
  const p = (a: number) => [X + r * Math.cos((a * Math.PI) / 180), Y - r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const grande = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${grande} 0 ${x1} ${y1}`} fill="none" stroke={cor} strokeWidth={w} opacity={op} strokeLinecap="round" />;
};
