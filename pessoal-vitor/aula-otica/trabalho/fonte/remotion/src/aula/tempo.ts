// Relógio da aula: todo evento é preso a uma palavra da locução (índice em relogio.json).
// P(i) = quadro em que a palavra i começa; PE(i) = quadro em que termina. Tempos já incluem as pausas abertas.
import R from '../data/relogio.json';

export const FPS = R.fps;
export const DURACAO = R.quadros;
const W = R.palavras as {i: number; w: string; f: number; fe: number}[];
export const P = (i: number, d = 0) => W[i].f + d;
export const PE = (i: number, d = 0) => W[i].fe + d;
export const PALAVRAS = W;
export const PAUSAS = R.pausas as {i: number; de: number; ate: number}[];
// falas gravadas à parte e inseridas depois de uma palavra (ex.: chamada para seguir)
export const INSERCOES = ((R as any).insercoes ?? []) as {apos: number; s: number; f: number; fe: number}[];
export const FALA_SEGUIR = INSERCOES.find((x) => x.apos === 150)!;
// fim da pausa aberta depois da palavra i (em quadros)
export const PAUSA = (i: number) => {
  const p = PAUSAS.find((x) => x.i === i);
  if (!p) throw new Error('sem pausa depois da palavra ' + i);
  return {de: Math.round(p.de * FPS), ate: Math.round(p.ate * FPS)};
};

// ---- curvas (DESIGN-SYSTEM §5.2)
const bez = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  if (t <= 0) return 0; if (t >= 1) return 1;
  let u = t;
  for (let k = 0; k < 8; k++) {
    const cx = 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u ** 2 * (1 - u) + u ** 3 - t;
    const dx = 3 * x1 * (1 - u) ** 2 + 6 * (x2 - x1) * u * (1 - u) + 3 * (1 - x2) * u ** 2;
    if (Math.abs(dx) < 1e-6) break;
    u -= cx / dx;
  }
  u = Math.min(1, Math.max(0, u));
  return 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u ** 2 * (1 - u) + u ** 3;
};
export const produtiva = bez(0.2, 0, 0.38, 0.9);
export const expressiva = bez(0.4, 0.14, 0.3, 1);
export const entrada = bez(0, 0, 0.3, 1);
export const saida = bez(0.4, 0.14, 1, 1);
export const camera = bez(0.45, 0, 0.55, 1);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// progresso 0..1 entre dois quadros com uma curva
export const prog = (f: number, a: number, dur: number, curva = expressiva) => curva(clamp01((f - a) / Math.max(1, dur)));
// "chega rápido, pousa suave" (LICOES §2): fração k da distância restante por quadro
export const approach = (f: number, a: number, k = 0.15) => (f < a ? 0 : 1 - Math.pow(1 - k, f - a));
// mola amortecida (overshoot leve) para objetos "jogados"
export const mola = (f: number, a: number, freq = 2.2, amort = 6.5) => {
  if (f < a) return 0;
  const t = (f - a) / FPS;
  return 1 - Math.exp(-amort * t) * Math.cos(freq * Math.PI * 2 * t * 0.5);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// liga/desliga com entrada e saída (para opacidade de blocos)
export const janela = (f: number, a: number, b: number, ent = 10, sai = 8) =>
  Math.min(prog(f, a, ent, entrada), 1 - prog(f, b - sai, sai, saida));
