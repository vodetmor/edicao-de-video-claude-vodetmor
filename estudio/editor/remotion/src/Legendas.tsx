// Legendas montadas sozinhas a partir das palavras (tempo real da fala, nunca do roteiro).
// Estilos: limpa (padrão do DESIGN-SYSTEM §3), destaque, forte, caixa, nenhuma.
// "destaque" e "forte" são palavra a palavra: fora do DESIGN-SYSTEM do projeto (P10); só quando o usuário pedir.
import React from 'react';
import {E, approach, prog, tween} from './kit';
import type {Marca} from './marca';
import type {EstiloLegenda, Palavra} from './tipos';

type Cue = {ws: Palavra[]; linhas: Palavra[][]; a: number; b: number};
const FRACAS = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'e', 'que', 'para', 'pra', 'por', 'com', 'se', 'te', 'me', 'ao', 'à', 'the', 'of', 'to', 'and']);
const limpa = (w: string) => w.replace(/[.,;:]+$/, '');
const len = (ws: Palavra[]) => ws.map((x) => limpa(x.w)).join(' ').length;

// Quebra em duas linhas: equilibrada, a de baixo igual ou maior (pirâmide), sem deixar artigo/preposição pendurado.
const quebra = (ws: Palavra[], maxLinha: number): Palavra[][] => {
  if (len(ws) <= maxLinha || ws.length < 2) return [ws];
  let melhor = 1;
  let nota = Infinity;
  for (let i = 1; i < ws.length; i++) {
    const a = len(ws.slice(0, i));
    const b = len(ws.slice(i));
    let n = Math.abs(a - b) + (a > b ? 4 : 0) + (FRACAS.has(limpa(ws[i - 1].w).toLowerCase()) ? 12 : 0);
    if (a > maxLinha || b > maxLinha) n += 100;
    if (n < nota) [nota, melhor] = [n, i];
  }
  return [ws.slice(0, melhor), ws.slice(melhor)];
};

export const montaCues = (pal: Palavra[], fps: number, maxLinha: number, linhas: number, maxPal = 99, curta = false): Cue[] => {
  const cues: Cue[] = [];
  let cur: Palavra[] = [];
  const fecha = () => {
    if (cur.length) cues.push({ws: cur, linhas: linhas > 1 ? quebra(cur, maxLinha) : [cur], a: 0, b: 0});
    cur = [];
  };
  pal.forEach((p, i) => {
    const prox = [...cur, p];
    const gap = cur.length ? (p.s - cur[cur.length - 1].e) : 0;
    const dura = cur.length ? p.e - cur[0].s : 0;
    if (cur.length && (len(prox) > maxLinha * linhas || gap > 0.35 || dura > 3.6 || cur.length >= maxPal)) fecha();
    cur.push(p);
    if (/[.!?;:]$/.test(p.w) || (/,$/.test(p.w) && (curta || len(cur) > maxLinha * 0.6))) fecha();
  });
  fecha();
  cues.forEach((c, i) => {
    c.a = c.ws[0].f - 2;
    const fimFala = c.ws[c.ws.length - 1].fe + 8;
    const prox = cues[i + 1] ? cues[i + 1].ws[0].f - 2 : Infinity;
    c.b = Math.min(Math.max(fimFala, c.a + Math.round(0.67 * fps)), prox);
  });
  return cues;
};

export const Legendas: React.FC<{
  f: number; W: number; H: number; fps: number; pal: Palavra[]; estilo: EstiloLegenda; marca: Marca;
  zona: {y: number; x: number; w: number; sobre: 'video' | 'papel'; topo?: boolean}; tamanho?: number;
}> = ({f, W, H, fps, pal, estilo, marca, zona, tamanho}) => {
  const u = Math.min(W, H) / 1080;
  const forte = estilo === 'forte';
  const tam = (tamanho ?? (forte ? 84 : W > H ? 50 : 56)) * u;
  const maxLinha = Math.floor(zona.w / (tam * (forte ? 0.68 : 0.53)));
  const cues = React.useMemo(
    () => montaCues(pal, fps, maxLinha, 2, forte ? 3 : 99, forte),
    [pal, fps, maxLinha, forte],
  );
  if (estilo === 'nenhuma') return null;
  const i = cues.findIndex((c) => f >= c.a && f < c.b);
  if (i < 0) return null;
  const c = cues[i];
  const colado = i > 0 && cues[i - 1].b >= c.a - 2; // troca colada: corte seco (DS §3.3)
  const fimColado = cues[i + 1] && cues[i + 1].a <= c.b + 2;
  const entra = colado && !forte ? 1 : tween(f, c.a, 6, 0, 1, E.produtiva);
  const sai = fimColado ? 0 : prog(f, c.b - 4, 4);
  const op = entra * (1 - sai);
  const y = forte ? 0 : (1 - entra) * 6 * u;
  const esc = forte ? approach(f, c.a, 0.9, 1, 0.32) : 1;
  const sobreVideo = zona.sobre === 'video';
  const cor = sobreVideo ? marca.legenda : marca.tinta;
  const sombra = sobreVideo
    ? forte
      ? '0 4px 14px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.8)'
      : '0 2px 6px rgba(0,0,0,.55), 0 0 1px rgba(0,0,0,.7)'
    : 'none';
  const ativa = (p: Palavra) => f >= p.f - 1 && f < p.fe + 2;
  const caixa = estilo === 'caixa';
  return (
    <div style={{position: 'absolute', left: zona.x, width: zona.w, ...(zona.topo ? {top: zona.y} : {bottom: H - zona.y}), display: 'flex', justifyContent: 'center',
      opacity: op, transform: `translateY(${y}px) scale(${esc})`, transformOrigin: zona.topo ? '50% 0%' : '50% 100%'}}>
      <div style={{
        textAlign: 'center',
        fontFamily: forte ? marca.fonteTitulo : marca.fonteTexto,
        fontWeight: forte ? 800 : 500,
        fontSize: tam,
        lineHeight: forte ? 1.04 : 1.2,
        letterSpacing: forte ? '-0.01em' : '-0.01em',
        textTransform: forte ? 'uppercase' : 'none',
        color: caixa ? marca.tinta : cor,
        textShadow: caixa ? 'none' : sombra,
        background: caixa ? marca.papel : 'transparent',
        padding: caixa ? `${14 * u}px ${22 * u}px` : 0,
        borderRadius: caixa ? 18 * u : 0,
      }}>
        {c.linhas.map((l, k) => (
          <div key={k}>
            {l.map((p, j) => (
              <span key={j} style={{color: (estilo === 'destaque' || forte) && ativa(p) ? (sobreVideo ? marca.destaqueLegenda : marca.destaque) : undefined}}>
                {(j ? ' ' : '') + limpa(p.w)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
