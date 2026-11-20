// Ajudantes de movimento por quadro (mesmos do estudio/motor, DESIGN-SYSTEM §5).
import type React from 'react';
import {Easing} from 'remotion';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (f: number, start: number, dur: number) => clamp((f - start) / dur);

// "Chega rápido, pousa suave": cada quadro cobre uma fração k do que falta (LICOES §2).
export const approach = (f: number, start: number, from: number, to: number, k = 0.15) =>
  f <= start ? from : to - (to - from) * Math.pow(1 - k, f - start);
export const arrive = (f: number, start: number, k = 0.15) => approach(f, start, 0, 1, k);

const bez = (a: number, b: number, c: number, d: number) => Easing.bezier(a, b, c, d);
export const E = {
  prod: bez(0.2, 0, 0.38, 0.9),
  expr: bez(0.4, 0.14, 0.3, 1),
  enter: bez(0, 0, 0.3, 1),
  exit: bez(0.4, 0.14, 1, 1),
  cam: bez(0.45, 0, 0.55, 1),
};
export const tween = (f: number, start: number, dur: number, from: number, to: number, ease: (t: number) => number = E.expr) =>
  from + (to - from) * ease(prog(f, start, dur));

// Mola amortecida 0 -> 1 (z < 1 passa um pouco do alvo).
export const spring = (f: number, start: number, w = 0.35, z = 0.75) => {
  const t = f - start;
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

// pulso curto (0 -> 1 -> 0) a partir de start
export const pulse = (f: number, start: number, dur = 14) => {
  const t = (f - start) / dur;
  return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * Math.exp(-1.5 * t);
};

// entrada padrão: opacidade + subida + escala 0,94 -> 1 (nada nasce do nada)
export const entra = (f: number, start: number, dy = 60, k = 0.16) => {
  const a = arrive(f, start, k);
  return {
    opacity: clamp(a * 1.6),
    transform: `translateY(${(1 - a) * dy}px) scale(${0.94 + 0.06 * a})`,
  } as React.CSSProperties;
};
