// Âncoras: todo evento do vídeo é preso a uma PALAVRA falada, não a um segundo.
// Sintaxe: "botão" (início da 1ª ocorrência) · "botão#2" (2ª) · "botão:fim" (fim da palavra)
//          · "VSL-3" / "oferta:fim+6" (deslocamento em quadros) · "@45" (quadro fixo) · "fim" (fim do vídeo)
export type Palavra = {w: string; s: number; e: number; f: number; fe: number};

export const normaliza = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const relogio = (palavras: Palavra[], duracao: number) => {
  const q = (ancora: string | number): number => {
    if (typeof ancora === 'number') return ancora;
    const m = ancora.trim().match(/^(.+?)(?:#(\d+))?(:fim)?([+-]\d+)?$/);
    if (!m) throw new Error(`âncora inválida: ${ancora}`);
    const [, alvo, n, fim, desl] = m;
    const d = desl ? parseInt(desl, 10) : 0;
    if (alvo === 'fim') return duracao + d;
    if (alvo.startsWith('@')) return parseInt(alvo.slice(1), 10) + d;
    const k = normaliza(alvo);
    const hits = palavras.filter((p) => normaliza(p.w) === k);
    const i = n ? parseInt(n, 10) - 1 : 0;
    if (!hits[i]) throw new Error(`palavra não encontrada na fala: "${alvo}"${n ? ' #' + n : ''}`);
    return (fim ? hits[i].fe : hits[i].f) + d;
  };
  return q;
};
