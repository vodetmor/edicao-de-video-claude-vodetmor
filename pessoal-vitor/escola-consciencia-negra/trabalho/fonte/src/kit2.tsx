// Peças reutilizáveis das partes 3 a 7 (mesma identidade da parte 1).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, E, FILTRO, approach, arrive, clamp, f, rand, tween} from './lib';
import {Midia, SERIF, TYPE} from './kit';
import {ICON} from './icons';

// Palavras de um words.json num intervalo (em segundos), já em quadros, para <Kinetic>.
export const palavras = (words: {w: string; s: number}[], a: number, b: number) =>
  words.filter((w) => w.s >= a && w.s < b).map((w) => ({w: w.w, s: f(w.s)}));

// Janela de cena: devolve null fora de [a, b) (segundos).
export const useJanela = (a: number, b: number) => {
  const frame = useCurrentFrame();
  return {frame, on: frame >= f(a) && frame < f(b)};
};

// Título-conceito: duas linhas que sobem letra a letra da linha de base, com borrão de velocidade
// (mesmo gesto de RACISMO AMBIENTAL na parte 1). Cor 1 = vermelho, cor 2 = papel.
export const TituloConceito: React.FC<{
  l1: string; l2?: string; t1: number; t2?: number; size?: number; ate: number; desde?: number; fundo?: string;
}> = ({l1, l2, t1, t2, size = 200, ate, desde, fundo = C.fundo}) => {
  const frame = useCurrentFrame();
  if (frame < f(desde ?? t1 - 0.1) || frame >= f(ate)) return null;
  const palavra = (txt: string, start: number) => (
    <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', height: size * 1.02, paddingTop: size * 0.02}}>
      {txt.split('').map((ch, i) => {
        const s0 = start + i * 1.2;
        const y = approach(frame, s0, size * 1.05, 0, 0.19);
        const v = frame < s0 ? 0 : size * 1.05 * 0.19 * Math.pow(0.81, frame - s0);
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${frame < s0 ? size * 1.1 : y}px)`, filter: v > 1 ? `blur(${Math.min(9, v / 7)}px)` : undefined}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
  const push = 1 + 0.0011 * (frame - f(t1));
  const out = clamp((frame - (f(ate) - 5)) / 5);
  return (
    <AbsoluteFill style={{background: fundo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${push})`, textAlign: 'center', opacity: 1 - out}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1, color: C.vermelho, letterSpacing: '0.02em'}}>
          {palavra(l1, f(t1))}
        </div>
        {l2 && t2 !== undefined && (
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1, color: C.papel, letterSpacing: '0.02em', marginTop: -size * 0.04}}>
            {palavra(l2, f(t2))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Círculo/traço à mão (lápis vermelho), desenhado em ~10 quadros.
export const tremido = (cx: number, cy: number, r: number, seed: number, ry = 0.86) => {
  const pts: string[] = [];
  const N = 48;
  for (let i = 0; i <= N + 6; i++) {
    const a = (i / N) * Math.PI * 2 - 1.2 + seed;
    const rr = r * (1 + 0.06 * Math.sin(a * 3 + seed) + 0.03 * Math.sin(a * 7 + seed * 2)) * (1 + i * 0.002);
    pts.push(`${i === 0 ? 'M' : 'L'} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * ry * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};
export const Traco: React.FC<{d: string; start: number; dur?: number; cor?: string; w?: number; len?: number}> = ({
  d, start, dur = 10, cor = C.vermelho, w = 7, len = 1200,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = E.produtiva(clamp((frame - start) / dur));
  return <path d={d} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
};

// Ícone Phosphor dentro de um selo de papel que "carimba" o mapa (cai de 1,6× e assenta).
export const Selo: React.FC<{icon: string; x: number; y: number; start: number; r?: number; label?: string; cor?: string}> = ({
  icon, x, y, start, r = 64, label, cor = C.papel,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = approach(frame, start, 1.7, 1, 0.3);
  const rot = approach(frame, start, -10, -2, 0.25);
  const onda = clamp((frame - start) / 16);
  return (
    <g>
      <circle cx={x} cy={y} r={r * (1 + onda * 1.4)} fill="none" stroke={C.papel} strokeWidth={3} opacity={0.5 * (1 - onda)} />
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <circle r={r + 6} fill="rgba(0,0,0,0.45)" transform="translate(4 8)" />
        <circle r={r} fill={cor} />
        <circle r={r - 7} fill="none" stroke={C.tinta} strokeWidth={2} opacity={0.35} />
        <g transform={`translate(${-r * 0.62} ${-r * 0.62}) scale(${(r * 1.24) / 256})`}>
          <path d={ICON[icon]} fill={C.tinta} />
        </g>
      </g>
      {label && (
        <text x={x} y={y + r + 46} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={C.papel} letterSpacing="2"
          opacity={arrive(frame, start + 4, 0.2)}>
          {label.slice(0, Math.min(label.length, Math.floor(((frame - start - 4) / 30) * 22) + 1))}
        </text>
      )}
    </g>
  );
};

// Alfinete que cai e quica (0,68, ref-brain) com anel de impacto.
export const Alfinete: React.FC<{x: number; y: number; start: number; cor?: string}> = ({x, y, start, cor = C.vermelho}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = (frame - start) / 30;
  const g = 5200, h0 = 420, tFall = Math.sqrt((2 * h0) / g);
  let dy = 0;
  if (t < tFall) dy = -h0 + 0.5 * g * t * t;
  else {
    let tt = t - tFall, v = g * tFall * 0.5;
    for (let b = 0; b < 3; b++) {
      const dur = (2 * v) / g;
      if (tt < dur) { dy = -(v * tt - 0.5 * g * tt * tt); break; }
      tt -= dur; v *= 0.5;
    }
  }
  const anel = clamp((t - tFall) / 0.6);
  return (
    <g>
      {t >= tFall && <ellipse cx={x} cy={y} rx={20 + anel * 120} ry={(20 + anel * 120) * 0.45} fill="none" stroke={cor} strokeWidth={4} opacity={1 - anel} />}
      <ellipse cx={x} cy={y} rx={16} ry={6} fill="rgba(0,0,0,0.5)" />
      <g transform={`translate(${x} ${y + dy})`}>
        <path d="M 0 0 C -6 -30, -34 -46, -34 -76 A 34 34 0 1 1 34 -76 C 34 -46, 6 -30, 0 0 Z" fill={cor} />
        <circle cx={0} cy={-78} r={13} fill={C.papel} />
      </g>
    </g>
  );
};

// Número que rola até o valor (formato pt-BR), preso a dois instantes.
export const Contador: React.FC<{de?: number; ate: number; a: number; b: number; size?: number; cor?: string; sufixo?: string; ano?: boolean}> = ({
  de = 0, ate, a, b, size = 150, cor = C.papel, sufixo = '', ano = false,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(tween(frame, a, b, de, ate, E.entrada));
  return (
    <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, color: cor, fontVariantNumeric: 'lining-nums tabular-nums', letterSpacing: '-0.01em'}}>
      {ano ? String(v) : v.toLocaleString('pt-BR')}
      {sufixo}
    </span>
  );
};

// Foto em painel (tríptico / tela dividida): entra subindo com borrão; pode trocar de foto num instante.
export const Painel: React.FC<{
  x: number; w: number; start: number; fotos: {src: string; at: number; filtro?: string}[]; y?: number; h?: number; zoom?: number;
}> = ({x, w, start, fotos, y = 0, h = 1080, zoom = 1.06}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = arrive(frame, start, 0.16);
  const cur = [...fotos].reverse().find((q) => frame >= q.at) ?? fotos[0];
  const punch = cur.at > start ? approach(frame, cur.at, 1.12, 1, 0.22) : 1;
  const flash = cur.at > start && frame - cur.at < 2 ? 0.55 : 0;
  const flt = (FILTRO as Record<string, string>)[cur.filtro ?? 'atual'] ?? cur.filtro;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * 90, width: w, height: h, overflow: 'hidden', opacity: p, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, background: '#000'}}>
      <Midia src={cur.src} from={cur.at} style={{width: '100%', height: '100%', objectFit: 'cover', filter: flt, transform: `scale(${(zoom + 0.012 * ((frame - start) / 30)) * punch})`}} />
      {flash > 0 && <AbsoluteFill style={{background: C.papel, opacity: flash}} />}
    </div>
  );
};

// Linhas de nível (topografia) que se desenham sobre uma foto: "o território revelando".
export const Isolinhas: React.FC<{start: number; cx: number; cy: number; n?: number; cor?: string; opacity?: number}> = ({
  start, cx, cy, n = 9, cor = C.terracota, opacity = 0.7,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const linhas: React.ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const r = 70 + k * 78;
    const pts: string[] = [];
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const rr = r * (1 + 0.16 * Math.sin(a * 2 + k * 0.7) + 0.08 * Math.sin(a * 5 + k * 1.9 + rand(k) * 3));
      pts.push(`${i ? 'L' : 'M'} ${(cx + rr * Math.cos(a) * 1.35).toFixed(1)} ${(cy + rr * Math.sin(a) * 0.8).toFixed(1)}`);
    }
    const p = E.produtiva(clamp((frame - start - k * 3) / 26));
    linhas.push(
      <path key={k} d={pts.join(' ')} fill="none" stroke={cor} strokeWidth={k % 3 === 0 ? 3 : 1.6} opacity={opacity * (1 - k / (n + 3))}
        strokeDasharray={4000} strokeDashoffset={4000 * (1 - p)} />,
    );
  }
  return <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>{linhas}</svg>;
};

// Lampejo de arquivo: sequência rápida de fotos com cintilação de projetor e salto de quadro.
export const Lampejo: React.FC<{fotos: string[]; a: number; b: number}> = ({fotos, a, b}) => {
  const frame = useCurrentFrame();
  if (frame < a || frame >= b) return null;
  const per = (b - a) / fotos.length;
  const i = Math.min(fotos.length - 1, Math.floor((frame - a) / per));
  const local = frame - a - i * per;
  const jx = (rand(frame * 1.7) - 0.5) * 10, jy = (rand(frame * 2.3) - 0.5) * 8;
  const flick = 0.82 + 0.18 * rand(frame * 5.1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${jx}px, ${jy}px) scale(${1.08 - 0.02 * (local / per)})`, filter: `brightness(${flick})`}}>
        <Img src={staticFile(fotos[i])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: FILTRO.arquivo}} />
      </AbsoluteFill>
      {local < 1.5 && <AbsoluteFill style={{background: C.papel, opacity: 0.35}} />}
    </AbsoluteFill>
  );
};
