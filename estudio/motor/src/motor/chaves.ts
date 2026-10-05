// Números animados presos a palavras: [[âncora, valor, curva?, duração em quadros?], ...].
// O primeiro item é o valor inicial. Cada item seguinte sai do valor em que a animação estava
// naquele quadro (nunca pula), com a curva nomeada do DESIGN-SYSTEM.
import {E, prog, spring} from '../kit';

export type Curva = 'expr' | 'cam' | 'prod' | 'enter' | 'exit' | 'mola' | 'corte' | 'linear';
export type Chave = [string | number, number, Curva?, number?];

const ease = (c: Curva, f: number, s: number, d: number) => {
  if (c === 'corte') return f >= s ? 1 : 0;
  if (c === 'mola') return spring(f, s, 7 / Math.max(d, 1), 0.82);
  if (c === 'linear') return prog(f, s, d);
  return (E as any)[c](prog(f, s, d));
};

export const chave = (f: number, q: (a: string | number) => number, lista: Chave[]): number => {
  let v = lista[0][1];
  for (let i = 1; i < lista.length; i++) {
    const [a, alvo, c = 'expr', d = 18] = lista[i];
    const s = q(a);
    if (f < s) break;
    const de = chave(s, q, lista.slice(0, i));
    v = de + (alvo - de) * ease(c, f, s, d);
  }
  return v;
};
