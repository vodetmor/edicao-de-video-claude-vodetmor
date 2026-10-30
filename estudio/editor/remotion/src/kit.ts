// Curvas e utilidades de movimento (as mesmas do estudio/motor, DESIGN-SYSTEM §5.2). Tudo é função do quadro:
// nada de CSS animation, relógio próprio ou useFrame. Prévia e render saem idênticos.
import {Easing} from 'remotion';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (f: number, ini: number, dur: number) => clamp((f - ini) / dur);

// "Chega rápido, pousa suave": a cada quadro anda uma fração k do que falta.
export const approach = (f: number, ini: number, de: number, para: number, k = 0.15) =>
  f <= ini ? de : para - (para - de) * Math.pow(1 - k, f - ini);
export const chega = (f: number, ini: number, k = 0.15) => approach(f, ini, 0, 1, k);

const bez = (a: number, b: number, c: number, d: number) => Easing.bezier(a, b, c, d);
export const E = {
  produtiva: bez(0.2, 0, 0.38, 0.9),
  expressiva: bez(0.4, 0.14, 0.3, 1),
  entrada: bez(0, 0, 0.3, 1),
  saida: bez(0.4, 0.14, 1, 1),
  camera: bez(0.45, 0, 0.55, 1),
};
export const tween = (f: number, ini: number, dur: number, de: number, para: number, ease = E.expressiva) =>
  de + (para - de) * ease(prog(f, ini, dur));

// Mola amortecida 0 -> 1. z < 1 passa um pouco do ponto (z 0,75 ≈ 3%). w em radianos por quadro.
export const mola = (f: number, ini: number, w = 0.35, z = 0.8) => {
  const t = f - ini;
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

// Entra em `ini`, sai em `fim` (opacidade + leve deslocamento). Devolve {op, y, s}.
export const vida = (f: number, ini: number, fim: number, dy = 18) => {
  const e = chega(f, ini, 0.17);
  const sai = fim < Infinity ? tween(f, fim - 6, 6, 0, 1, E.saida) : 0;
  return {op: clamp(e * 1.4) * (1 - sai), y: (1 - e) * dy - sai * 8, s: 0.96 + 0.04 * e};
};
