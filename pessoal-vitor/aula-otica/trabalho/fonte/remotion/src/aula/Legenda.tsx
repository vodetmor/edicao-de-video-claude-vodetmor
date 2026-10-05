// Legenda contínua (branca, halo escuro): Inter 500 46 px, base da última linha a 87% da altura, sem caixa, sombra curta.
// Entra com 6 quadros (sobe 6 px), sai em 4. Fórmulas faladas aparecem como fórmula.
import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import katex from 'katex';
import {CUES} from './legendas';
import {P, PE, prog, produtiva} from './tempo';
import {C, HALO, INTER} from './estilo';


const html = (s: string) => s.split('\n').map((linha) => linha.split(/(\$[^$]+\$)/g).map((p) => (p.startsWith('$') ? katex.renderToString(p.slice(1, -1), {throwOnError: false}) : p.replace(/&/g, '&amp;').replace(/</g, '&lt;'))).join('')).join('<br/>');

export const Legenda: React.FC<{some?: (f: number) => number}> = ({some}) => {
  const f = useCurrentFrame();
  const janelas = useMemo(() => CUES.map(([a, b, t], i) => {
    const ini = P(a);
    const prox = i + 1 < CUES.length ? P(CUES[i + 1][0]) : 1e9;
    const fim = Math.min(Math.max(PE(b) + 10, ini + 20), prox - 2, ini + 210);
    return {ini, fim, h: html(t), esq: false};
  }), []);
  const c = janelas.find((j) => f >= j.ini && f < j.fim);
  if (!c) return null;
  const ent = prog(f, c.ini, 6, produtiva);
  const sai = 1 - prog(f, c.fim - 4, 4, produtiva);
  const op = Math.min(ent, sai) * (some ? 1 - some(f) : 1);
  if (op <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: c.esq ? 48 : 96, right: c.esq ? 1000 : 96, bottom: 1080 - 940 - 14, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${(1 - ent) * 6}px)`}}>
      <div style={{maxWidth: c.esq ? 860 : 1240, textAlign: 'center', fontFamily: INTER, fontWeight: 500, fontSize: 46, lineHeight: '56px', letterSpacing: '-0.01em', color: C.tinta, textShadow: HALO}} dangerouslySetInnerHTML={{__html: c.h}} />
    </div>
  );
};
