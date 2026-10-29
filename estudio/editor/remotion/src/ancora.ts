// Âncoras: todo elemento do vídeo é preso a uma PALAVRA falada, não a um segundo (mesma sintaxe do estudio/motor).
// "botão" (início da 1ª ocorrência) · "botão#2" (2ª) · "botão:fim" (fim da palavra)
// · "oferta:fim+6" / "VSL-3" (deslocamento em quadros) · "@45" (quadro fixo) · "2.5s" (segundo fixo) · "fim" (fim do vídeo)
// Várias palavras ("como editar") = a sequência exata na fala; a âncora cai na primeira palavra (ou na última com :fim).
import type {Palavra} from './tipos';

export const normaliza = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const relogio = (palavras: Palavra[], duracao: number, fps: number) => {
  const chaves = palavras.map((p) => normaliza(p.w));
  return (ancora: string | number): number => {
    if (typeof ancora === 'number') return ancora;
    const m = ancora.trim().match(/^(.+?)(?:#(\d+))?(:fim)?([+-]\d+)?$/);
    if (!m) throw new Error(`âncora inválida: ${ancora}`);
    const [, alvo, n, fim, desl] = m;
    const d = desl ? parseInt(desl, 10) : 0;
    if (alvo === 'fim') return duracao + d;
    if (alvo === 'inicio') return d;
    if (alvo.startsWith('@')) return parseInt(alvo.slice(1), 10) + d;
    if (/^\d+(\.\d+)?s$/.test(alvo)) return Math.round(parseFloat(alvo) * fps) + d;
    const seq = alvo.split(/\s+/).map(normaliza).filter(Boolean);
    const hits: number[] = [];
    for (let i = 0; i + seq.length <= chaves.length; i++) {
      if (seq.every((k, j) => chaves[i + j] === k)) hits.push(i);
    }
    const i = n ? parseInt(n, 10) - 1 : 0;
    if (hits[i] === undefined) throw new Error(`palavra não encontrada na fala: "${alvo}"${n ? ' #' + n : ''}`);
    return (fim ? palavras[hits[i] + seq.length - 1].fe : palavras[hits[i]].f) + d;
  };
};
