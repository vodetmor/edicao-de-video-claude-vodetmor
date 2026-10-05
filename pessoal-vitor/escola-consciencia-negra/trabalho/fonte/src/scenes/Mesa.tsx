import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, E, FILTRO, arrive, clamp, f, monotone, tween} from '../lib';
import {TypeTag} from '../kit';

// VITRINE (8,2-18,45): mesa escura de arquivo com 4 fotos reais. Uma linha terracota (o caminho da água)
// se desenha e a câmera segue a ponta (ref-jackson "P-L-A-N" + ref-x), de foto em foto, sem corte.
// "e sempre escolhe as mesmas casas": a linha se divide e circula as mesmas casas à mão.

type Est = {src: string; x: number; y: number; w: number; h: number; rot: number; tag: string; tagAt: number};
export const ESTACOES: Est[] = [
  {src: 'fotos/encosta.jpg', x: 1150, y: 1050, w: 1500, h: 1000, rot: -2.2, tag: 'ENCOSTA', tagAt: 8.6},
  {src: 'fotos/rio-margem.jpg', x: 3150, y: 1950, w: 1500, h: 1000, rot: 1.6, tag: 'MARGEM DO RIO', tagAt: 11.2},
  {src: 'fotos/rua-alagada.jpg', x: 5150, y: 1050, w: 1500, h: 1000, rot: -1.2, tag: 'RUA SEM DRENAGEM', tagAt: 13.4},
  {src: 'fotos/mesmas-casas.jpg', x: 7250, y: 1850, w: 1650, h: 1100, rot: 0.8, tag: '', tagAt: 99},
];

// Caminho da água em trechos: cada trecho termina num ponto de chegada. Coordenadas do mundo (px).
const TRECHOS = [
  'M 560 520 C 760 700, 900 760, 1000 960 S 1320 1260, 1560 1420', // desce o morro (foto 1)
  'M 1560 1420 C 1900 1680, 2150 1780, 2480 1880', // viaja até o rio
  'M 2480 1880 C 2900 2020, 3300 1880, 3820 2040', // corre pela margem (foto 2)
  'M 3820 2040 C 4200 2150, 4300 1500, 4520 1180', // viaja até a rua
  'M 4520 1180 C 4900 1000, 5300 1200, 5780 1080', // alaga a rua (foto 3)
  'M 5780 1080 C 6200 980, 6300 1900, 6560 2010', // viaja até as casas
  'M 6560 2010 C 6900 2080, 7200 2030, 7451 1991', // entra nas casas (foto 4)
];
const LENS = TRECHOS.map((p) => getLength(p));
const CUM = LENS.reduce<number[]>((a, l) => [...a, a[a.length - 1] + l], [0]);
const TOTAL = CUM[CUM.length - 1];
const FULL = TRECHOS.map((p, i) => (i === 0 ? p : p.replace(/^M [\d.]+ [\d.]+ /, ''))).join(' ');

// tempo (s) → distância percorrida: chegadas presas às palavras
const KEY_T = [8.3, 10.95, 11.2, 13.05, 13.3, 15.05, 15.45, 16.2];
const KEY_D = [0, CUM[1], CUM[2], CUM[3], CUM[4], CUM[5], CUM[6], CUM[7]];
const dist = monotone(KEY_T, KEY_D);

// círculos à mão nas mesmas casas (coordenadas do mundo), um por palavra
const CIRCULOS = [
  {x: 7451, y: 1991, r: 88, at: 16.24},
  {x: 7303, y: 2140, r: 80, at: 17.14},
  {x: 7752, y: 2210, r: 92, at: 17.6},
  {x: 7076, y: 2250, r: 82, at: 17.75},
];

const tremido = (cx: number, cy: number, r: number, seed: number) => {
  // círculo desenhado à mão: raio com pequena ondulação e volta que passa do ponto de partida
  const pts: string[] = [];
  const N = 48;
  for (let i = 0; i <= N + 6; i++) {
    const a = (i / N) * Math.PI * 2 - 1.2 + seed;
    const rr = r * (1 + 0.06 * Math.sin(a * 3 + seed) + 0.03 * Math.sin(a * 7 + seed * 2)) * (1 + i * 0.002);
    pts.push(`${i === 0 ? 'M' : 'L'} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * 0.86 * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const Mesa: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (frame < f(8.15) || frame >= f(18.45)) return null;

  const d = clamp(dist(t), 0, TOTAL);
  const tip = getPointAtLength(FULL, Math.max(0.01, d))!;
  // câmera: segue a ponta com leve atraso; respira (abre) nas viagens, fecha nas fotos
  const lag = getPointAtLength(FULL, Math.max(0.01, d - 140))!;
  const cam = {x: tip.x * 0.55 + lag.x * 0.45, y: tip.y * 0.55 + lag.y * 0.45};
  const seg = Math.min(LENS.length - 1, Math.max(0, CUM.findIndex((c, i) => d >= c && d < (CUM[i + 1] ?? Infinity))));
  const viajando = seg % 2 === 1 ? Math.sin(Math.PI * clamp((d - CUM[seg]) / LENS[seg])) : 0;
  let zoom = 0.86 - 0.16 * viajando;

  // final: câmera assenta sobre as casas e aproxima enquanto os círculos se fecham
  const fimP = E.camera(clamp((t - 16.1) / 1.6));
  const alvoFim = {x: 7300, y: 1960};
  cam.x = cam.x + (alvoFim.x - cam.x) * fimP;
  cam.y = cam.y + (alvoFim.y - cam.y) * fimP;
  zoom = zoom + (1.18 + 0.05 * clamp((t - 17.6) / 0.85) - zoom) * fimP;

  // entrada: a mesa sobe de baixo junto com a saída do A-roll (tilt contínuo)
  const tilt = tween(frame, f(8.15), f(8.62), 1080, 0, E.expressiva);
  const escurece = clamp((t - 17.55) / 0.5); // o resto da foto 4 escurece; os círculos ficam

  return (
    <AbsoluteFill style={{background: C.fundo, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateY(${tilt}px)`}}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: 9000, height: 3200, transformOrigin: '0 0',
            transform: `translate(${960}px, ${540}px) scale(${zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
            backgroundImage: `url(${staticFile('papel.png')})`, backgroundColor: '#1B1512', backgroundBlendMode: 'soft-light',
          }}
        >
          {ESTACOES.map((e, i) => {
            const isCasas = i === 3;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: e.x - e.w / 2, top: e.y - e.h / 2, width: e.w, height: e.h,
                  transform: `rotate(${e.rot}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.65)', background: '#EFE7D8', padding: 22,
                }}
              >
                <Img
                  src={staticFile(e.src)}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: `${FILTRO.atual}${isCasas ? ` brightness(${1 - 0.5 * escurece})` : ''}`,
                  }}
                />
              </div>
            );
          })}
          <svg width={9000} height={3200} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <path
              d={FULL} fill="none" stroke={C.terracota} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={`${d} ${TOTAL + 10}`}
            />
            {/* a ponta: gota sólida, sem brilho */}
            {d > 1 && d < TOTAL - 1 && <circle cx={tip.x} cy={tip.y} r={11} fill={C.terracota} />}
            {CIRCULOS.map((c, i) => {
              const p = E.entrada(clamp((t - c.at) / 0.5)); // desenhado em ~0,5 s (15 quadros)
              if (p <= 0) return null;
              const path = tremido(c.x, c.y, c.r, i * 1.7);
              const L = getLength(path);
              return (
                <path key={i} d={path} fill="none" stroke={C.vermelho} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${L * p} ${L + 10}`} />
              );
            })}
          </svg>
          {ESTACOES.slice(0, 3).map((e, i) => (
            <div key={`t${i}`} style={{position: 'absolute', left: e.x - e.w / 2 - 40, top: e.y - e.h / 2 - 50, transform: `rotate(${e.rot}deg)`}}>
              <TypeTag text={e.tag} start={f(e.tagAt)} x={0} y={0} size={46} cps={22} rot={-1.5} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const mesaDebug = {TOTAL, CUM, arrive};
