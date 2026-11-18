import {interpolate, Easing} from 'remotion';
// "chega rápido, pousa suave" (LICOES-MOTION §2)
export const approach = (f: number, start: number, from: number, to: number, k = 0.15) =>
  f < start ? from : to - (to - from) * Math.pow(1 - k, f - start);
export const prog = (f: number, a: number, b: number, ease = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const cam = Easing.bezier(0.65, 0, 0.35, 1); // câmera: sai e chega devagar
export const s = (t: number) => Math.round(t * 30); // segundos -> quadros
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
