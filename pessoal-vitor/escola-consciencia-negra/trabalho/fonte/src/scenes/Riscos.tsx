import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, approach, arrive, clamp, f, rand, tween} from '../lib';
import {Kinetic, Photo, SERIF, TYPE, TypeTag} from '../kit';
import words from '../../public/words.json';

// 27,32-30,75 · rajada: um corte em cada risco, 2 quadros antes da palavra (LICOES: corte no tempo forte ou 2 antes)
const RAJADA = [
  {src: 'fotos/rua-alagada-b.jpg', alt: 'fotos/rua-alagada.jpg', at: 27.6, label: 'ENCHENTE'},
  {src: 'fotos/lixo.jpg', at: 28.42, label: 'LIXO'},
  {src: 'fotos/poluicao.jpg', at: 29.04, label: 'POLUIÇÃO'},
  {src: 'fotos/esgoto.jpg', at: 29.86, label: 'ESGOTO A CÉU ABERTO'},
];

export const Rajada: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(27.32) || frame >= f(30.75)) return null;
  const i = [...RAJADA].reverse().findIndex((r) => frame >= f(r.at));
  const k = i < 0 ? -1 : RAJADA.length - 1 - i;
  if (k < 0) {
    // "a" antes da enchente: o cabeçalho do título ainda está na tela (cena Titulo segura até 27,32); aqui só preto
    return <AbsoluteFill style={{background: C.fundo}} />;
  }
  const r = RAJADA[k];
  const s0 = f(r.at);
  const punch = approach(frame, s0, 1.14, 1.04, 0.2);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        <Photo src={r.src} from={s0} zoom0={1} zoomRate={0.03} filter="atual" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 150}}>
        <div
          style={{
            fontFamily: TYPE, fontSize: 64, color: C.tinta, background: C.papelFita, padding: '14px 30px 10px',
            letterSpacing: '0.06em', boxShadow: '0 8px 24px rgba(0,0,0,.5)', transform: 'rotate(-1.5deg)',
            clipPath: `inset(0 ${(1 - arrive(frame, s0, 0.3)) * 100}% 0 0)`,
          }}
        >
          {r.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 30,75-34,9 · mapa escuro de quarteirões com um rio: riscos espalhados ao acaso → se juntam nos
// quarteirões da beira do rio ("não por acaso") → mais riscos caem e quicam 0,68 (ref-brain) no mesmo lugar
export const rioY = (x: number) => 690 + 70 * Math.sin(x / 290) - x * 0.06;
const COLS = 14, ROWS = 9, CW = 150, CH = 132;
const V = (i: number, j: number) => ({x: -70 + i * CW + (rand(i * 31 + j * 7) - 0.5) * 50, y: -40 + j * CH + (rand(i * 13 + j * 57) - 0.5) * 44});
export type Q = {pts: {x: number; y: number}[]; cx: number; cy: number; bairro: boolean};
export const QUADS: Q[] = [];
for (let i = 0; i < COLS; i++)
  for (let j = 0; j < ROWS; j++) {
    const c = [V(i, j), V(i + 1, j), V(i + 1, j + 1), V(i, j + 1)];
    const cx = c.reduce((a, p) => a + p.x, 0) / 4, cy = c.reduce((a, p) => a + p.y, 0) / 4;
    const dr = cy - rioY(cx);
    if (Math.abs(dr) < 70) continue; // o rio passa aqui
    const pts = c.map((p) => ({x: p.x + (cx - p.x) * 0.12, y: p.y + (cy - p.y) * 0.12})); // ruas entre quarteirões
    QUADS.push({pts, cx, cy, bairro: cx > 1050 && cx < 1750 && dr < 0 && dr > -240});
  }
const BAIRRO = QUADS.filter((q) => q.bairro);
const alvo = (i: number) => {
  const q = BAIRRO[i % BAIRRO.length];
  return {x: q.cx + (rand(i * 8.1) - 0.5) * 70, y: q.cy + (rand(i * 9.9) - 0.5) * 60};
};
export const CENTRO = {x: BAIRRO.reduce((a, q) => a + q.cx, 0) / BAIRRO.length, y: BAIRRO.reduce((a, q) => a + q.cy, 0) / BAIRRO.length};
const N = 70;
export const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(30.75) || frame >= f(34.95)) return null;
  const entra = arrive(frame, f(30.75), 0.12);
  const cam = tween(frame, f(32.4), f(34.9), 1, 1.3, E.camera) * (1.04 - 0.04 * entra);
  const bairroFill = clamp((t - 32.05) / 0.5);
  const rio: string[] = [];
  for (let x = -60; x <= 1980; x += 30) rio.push(`${x === -60 ? 'M' : 'L'} ${x} ${rioY(x).toFixed(1)}`);
  const pontos: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const appear = f(30.78) + Math.floor(rand(i * 5.3) * 18);
    if (frame < appear) continue;
    const sx = 120 + rand(i * 2.1) * 1680, sy = 90 + rand(i * 3.7) * 900;
    const tg = alvo(i);
    const go = f(31.9) + (i % 12);
    const x = frame < go ? sx : approach(frame, go, sx, tg.x, 0.13);
    const y = frame < go ? sy : approach(frame, go, sy, tg.y, 0.13);
    const p = arrive(frame, appear, 0.3);
    pontos.push(<circle key={i} cx={x} cy={y} r={9 * (0.8 + 0.2 * p)} fill={C.papel} opacity={p} />);
  }
  for (let i = 0; i < 26; i++) {
    const t0 = 32.62 + (i % 13) * 0.07 + Math.floor(i / 13) * 0.45;
    if (t < t0) continue;
    const tg = alvo(i + 100);
    const tx = tg.x, ty = tg.y;
    const h0 = ty + 80;
    const g = 3800;
    const tFall = Math.sqrt((2 * h0) / g);
    let tt = t - t0, y: number, sq = 1;
    if (tt < tFall) {
      y = ty - h0 + 0.5 * g * tt * tt;
      sq = 0.75;
    } else {
      tt -= tFall;
      let v = g * tFall * 0.68;
      y = ty;
      for (let b = 0; b < 4 && (v * v) / (2 * g) > 2; b++) {
        const dur = (2 * v) / g;
        if (tt < dur) {
          y = ty - (v * tt - 0.5 * g * tt * tt);
          sq = tt < 1 / 30 ? 1.6 : 1;
          break;
        }
        tt -= dur;
        v *= 0.68;
      }
    }
    pontos.push(<ellipse key={`c${i}`} cx={tx} cy={y} rx={10 * Math.sqrt(sq)} ry={10 / Math.sqrt(sq)} fill={C.terracota} />);
  }
  return (
    <AbsoluteFill style={{background: '#16110E'}}>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: `${CENTRO.x}px ${CENTRO.y}px`}}>
        <svg width={1920} height={1080}>
          {QUADS.map((q, i) => (
            <polygon
              key={i} points={q.pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={q.bairro && bairroFill > 0 ? C.vermelho : '#2A211B'} fillOpacity={q.bairro ? 0.7 * (0.35 + 0.65 * bairroFill) : 0.7 + 0.3 * rand(i)}
              stroke={q.bairro ? C.terracota : 'none'} strokeWidth={3} strokeOpacity={bairroFill}
            />
          ))}
          <path d={rio.join(' ')} stroke="#23302F" strokeWidth={96} fill="none" strokeLinejoin="round" />
          {pontos}
        </svg>
        <TypeTag text="BEIRA DO RIO" start={f(32.2)} x={CENTRO.x - 170} y={CENTRO.y - 250} size={40} cps={24} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 34,9-40,5 · moradores na enchente; legenda cinética "pobres, em sua maioria, negras."
export const Moradores: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(34.95) || frame >= f(40.55)) return null;
  const esc = tween(frame, f(37.0), f(37.4), 1, 0.5, E.produtiva);
  const ws = (words as {w: string; s: number}[])
    .filter((w) => w.s >= 37.1 && w.s < 40.3)
    .map((w) => ({w: w.w, s: f(w.s)}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: `brightness(${esc})`}}>
        <Photo src="fotos/moradores-enchente.jpg" from={f(34.95)} zoom0={1.02} zoomRate={0.018} filter="atual" />
      </AbsoluteFill>
      <Kinetic words={ws} accent={['negras.']} size={96} y={560} end={f(40.3)} />
    </AbsoluteFill>
  );
};

export {SERIF};
