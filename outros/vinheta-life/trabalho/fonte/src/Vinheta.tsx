import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';
import logo from './data/logo.json';
import {T, COR} from './tempo';

// Vinheta de encerramento "life": a bolinha quica, vira o losango, as letras pulam de dentro,
// o pingo do i cai no lugar e a cor inunda a tela a partir dele. Tudo é função do quadro.

const G = logo.geo;
const CX = G.cx, CY = G.cy;
const P = logo.pecas;

// losango de cantos redondos (núcleo bx*s, by*s, raio rr) como caminho SVG; s=0 vira círculo
const losango = (s: number, rr: number) => {
  const bx = Math.max(G.bx * s, 0.001), by = Math.max(G.by * s, 0.001);
  const V = [[CX, CY - by], [CX + bx, CY], [CX, CY + by], [CX - bx, CY]];
  const nrm = (p: number[], q: number[]) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
    return [dy / L, -dx / L];
  };
  let d = '';
  for (let k = 0; k < 4; k++) {
    const v = V[k], prv = V[(k + 3) % 4], nxt = V[(k + 1) % 4];
    const n1 = nrm(prv, v), n2 = nrm(v, nxt);
    const a = [v[0] + rr * n1[0], v[1] + rr * n1[1]], b = [v[0] + rr * n2[0], v[1] + rr * n2[1]];
    d += `${k === 0 ? 'M' : 'L'}${a[0].toFixed(3)},${a[1].toFixed(3)}A${rr.toFixed(3)},${rr.toFixed(3)} 0 0 1 ${b[0].toFixed(3)},${b[1].toFixed(3)}`;
  }
  return d + 'Z';
};

const mola = (f: number, fps: number, de: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({frame: f - de, fps, config: {damping: 11, stiffness: 170, mass: 0.8, ...cfg}});

// pulso de achatamento no contato: 0 fora, 1 no quadro do contato, decai em ~5 quadros com um rebote
const contato = (f: number, fc: number) => {
  const n = f - fc;
  if (n < -1 || n > 9) return 0;
  if (n < 0) return 0.35; // um quadro antes já começa a amassar
  return Math.exp(-n / 2.2) * Math.cos(n * 0.75);
};

// parábolas da bolinha (em unidades da logo, relativo ao centro). Cada trecho: [f0, f1, x0, x1, altura do arco]
const QUIQUES: [number, number, number, number, number][] = [
  [T.q1, T.q2, -150, -62, 95],
  [T.q2, T.q3, -62, 0, 40],
];
const bolinha = (f: number) => {
  if (f < T.q1) {
    const u = Math.max(0, f) / T.q1; // queda acelerando desde o alto
    return {x: interpolate(u, [0, 1], [-262, -150]), y: -150 * (1 - u * u), vy: 300 * u / T.q1};
  }
  for (const [f0, f1, x0, x1, h] of QUIQUES) {
    if (f >= f0 && f < f1) {
      const u = (f - f0) / (f1 - f0);
      return {x: x0 + (x1 - x0) * u, y: -4 * h * u * (1 - u), vy: (-4 * h * (1 - 2 * u)) / (f1 - f0)};
    }
  }
  return {x: 0, y: 0, vy: 0};
};

type Props = {vertical?: boolean};

export const Vinheta: React.FC<Props> = ({vertical = false}) => {
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const S = vertical ? 3.05 : 2.75; // px por unidade da logo

  // ---------- 1. bolinha quicando (até T.q3) e virando losango
  const b0 = bolinha(f);
  const b = vertical ? {x: b0.x * 0.42, y: b0.y * 1.7, vy: b0.vy * 1.7} : b0; // no vertical o quique cresce para cima
  const amassa = Math.max(contato(f, T.q1) * 0.55, contato(f, T.q2) * 0.4);
  const antes = f >= T.q3 ? interpolate(f, [T.q3, T.q3 + 3, T.pop], [0, 1, 0.2], {extrapolateRight: 'clamp'}) : 0;
  const estica = f < T.q3 ? Math.min(0.28, Math.abs(b.vy) * 0.012) : 0;
  const sy = (1 - amassa * 0.45 - antes * 0.3) * (1 + estica);
  const sx = 1 / sy;
  const sNucleo = f < T.pop ? 0 : mola(f, fps, T.pop, {damping: 9, stiffness: 190});
  const sFuro = f < T.furo ? 0 : Math.min(1.035, mola(f, fps, T.furo, {damping: 15, stiffness: 230})); // furo quase sem overshoot: senão o anel vira um fio
  const rFuro = (G.r - G.w) * Math.min(1, sFuro * 2.5);

  // ---------- 2. letras pulando de dentro do losango
  const LETRAS: {id: keyof typeof P; de: number}[] = [
    {id: 'l', de: T.l}, {id: 'i', de: T.i}, {id: 'f', de: T.f}, {id: 'e', de: T.e},
  ];

  // ---------- 3. o i procura o pingo; o pingo cai do alto
  const procura = interpolate(f, [T.procura, T.procura + 6, T.procura + 12, T.procura + 18, T.procura + 22], [0, -8, 7, -3, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin),
  });
  const pg = P.pingo.c;
  const uQ = interpolate(f, [T.cai, T.pousa], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  let pingoY = pg[1] - 230 * (1 - uQ * uQ); // queda livre
  const pulinho = f >= T.hop0 && f < T.hop1 ? (() => {const u = (f - T.hop0) / (T.hop1 - T.hop0); return -4 * 16 * u * (1 - u);})() : 0;
  pingoY += pulinho;
  const vQ = f < T.pousa ? (460 * uQ) / (T.pousa - T.cai) : 0;
  const pAmassa = Math.max(contato(f, T.pousa), contato(f, T.hop1) * 0.6, f >= T.hop0 - 4 && f < T.hop0 ? interpolate(f, [T.hop0 - 4, T.hop0], [0, 0.5]) : 0);
  const pSy = (1 - pAmassa * 0.26) * (1 + Math.min(0.45, vQ * 0.012));
  const iAmassa = Math.max(contato(f, T.pousa) * 0.16, contato(f, T.hop1) * 0.06);

  // ---------- 4. comemoração: a logo cede e salta; a cor inunda a partir do pingo
  const nP = f - T.pousa;
  const logoEsc = nP < 0 ? 1 : 1 - 0.07 * Math.exp(-nP / 6) * Math.cos(nP * 0.55) + (f >= T.hop1 ? -0.012 * Math.exp(-(f - T.hop1) / 3) : 0);
  const respira = 1 + 0.0011 * Math.max(0, f - T.pousa); // nada congela: push-in lento
  const pPx = [(pg[0] - CX) * S * respira + W / 2, (pg[1] - CY) * S * respira + H / 2];
  const rFlood = f < T.pousa ? 0 : Math.hypot(W, H) * (1 - Math.pow(1 - 0.12, f - T.pousa)) * 1.05;

  const Logo: React.FC<{cor: string; fundo: string}> = ({cor, fundo}) => (
    <g transform={`translate(${W / 2},${H / 2}) scale(${S * respira * logoEsc}) translate(${-CX},${-CY})`}>
      {f < T.pop + 1 && (
        <g transform={`translate(${CX + b.x},${CY + b.y + G.r * (1 - sy)}) scale(${sx},${sy}) translate(${-CX},${-CY})`}>
          <circle cx={CX} cy={CY} r={G.r} fill={cor} />
        </g>
      )}
      <defs>
        <clipPath id={`dentro-${fundo}`}><path d={logo.dentro} /></clipPath>
      </defs>
      <g clipPath={`url(#dentro-${fundo})`}>
        {LETRAS.map(({id, de}) => {
          if (f < de) return null;
          const m = mola(f, fps, de, {damping: 10, stiffness: 200});
          const m1 = mola(f - 1, fps, de, {damping: 10, stiffness: 200});
          const v = m - m1; // velocidade (fração por quadro)
          const bb = P[id].bbox;
          const altura = bb[3] - bb[1];
          const dy = (1 - m) * (altura + 40);
          const st = 1 + Math.max(-0.18, Math.min(0.22, v * 1.6));
          const extra = id === 'i' ? 1 - iAmassa : 1;
          const rot = id === 'i' ? procura : (1 - m) * (id === 'e' ? 9 : id === 'f' ? -6 : 4);
          const ox = (bb[0] + bb[2]) / 2, oy = bb[3];
          return (
            <g key={id} transform={`translate(0,${dy}) translate(${ox},${oy}) rotate(${rot}) scale(${1 / st},${st * extra}) translate(${-ox},${-oy})`}>
              <path d={P[id].d} fill={cor} />
            </g>
          );
        })}
      </g>
      {f >= T.pop && (
        <path d={losango(sNucleo, G.r) + (f >= T.furo ? losango(sNucleo * sFuro, rFuro) : '')} fill={cor} fillRule="evenodd" />
      )}
      {f >= T.cai && (
        <g transform={`translate(${pg[0]},${pingoY + 10.6 * (1 - pSy)}) rotate(${f < T.pousa ? 0 : procura * 0}) scale(${1 / pSy},${pSy}) translate(${-pg[0]},${-pg[1]})`}>
          <circle cx={pg[0]} cy={pg[1]} r={10.6} fill={cor} />
        </g>
      )}
    </g>
  );

  // ---------- 5. estouro de formas da própria logo (losangos, bolinhas) + cruzinhas "+" (toque de igreja), sem fade: encolhem até sumir
  const NF = 18;
  const FORMAS = Array.from({length: NF}, (_, k) => {
    const onda = k % 2; // duas levas: a de fora sai primeiro, a de dentro 5 quadros depois
    const ang = (k / NF) * Math.PI * 2 + (onda ? 0.17 : -0.05);
    const dist = (vertical ? 430 : 520) + (k % 3) * 80 - onda * 70;
    return {ang, dist, tipo: k % 4, cor: k % 5 === 2 ? COR.sol : COR.branco, giro: (k % 2 ? 1 : -1) * (90 + k * 9), de: T.pousa + 2 + onda * 5 + (k % 3)};
  });
  const ONDAS = [T.pousa + 1, T.pousa + 7, T.hop1];

  return (
    <AbsoluteFill style={{backgroundColor: COR.fundo}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        {f < T.pop && (() => {
          const k = 1 / (1 + Math.abs(b.y) / 60);
          return <ellipse cx={W / 2 + b.x * S} cy={H / 2 + (G.r + 3) * S} rx={G.r * S * (0.45 + 0.5 * k) * sx} ry={5 * S * (0.6 + 0.4 * k)} fill={COR.laranja} opacity={0.16 * k} />;
        })()}
        <Logo cor={COR.laranja} fundo="claro" />
        {rFlood > 0 && (
          <>
            <defs>
              <clipPath id="onda"><circle cx={pPx[0]} cy={pPx[1]} r={rFlood} /></clipPath>
            </defs>
            <g clipPath="url(#onda)">
              <rect width={W} height={H} fill={COR.laranja} />
              {ONDAS.map((o, k) => {
                const n = f - o;
                if (n < 0 || n > 26) return null;
                const u = 1 - Math.pow(1 - 0.13, n);
                const esp = (k === 2 ? 5 : 9) * (1 - n / 26);
                const e = (1.04 + (k === 2 ? 0.25 : 0.55) * u) * S * respira;
                return (
                  <g key={k} transform={`translate(${W / 2},${H / 2}) scale(${e}) translate(${-CX},${-CY})`}>
                    <path d={losango(1, G.r)} fill="none" stroke={k === 1 ? COR.sol : COR.branco} strokeWidth={esp / e} />
                  </g>
                );
              })}
              {FORMAS.map((s, k) => {
                const n = f - s.de;
                if (n < 0) return null;
                const avanco = 1 - Math.pow(1 - 0.14, n);
                const vida = interpolate(n, [0, 6, 48, 80], [0, 1, 1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
                if (vida <= 0.001) return null;
                const raio = 0.55 + 0.45 * avanco; // nasce na borda da logo, não por cima dela
                const x = W / 2 + Math.cos(s.ang) * s.dist * raio * (vertical ? 0.75 : 1);
                const y = H / 2 + Math.sin(s.ang) * s.dist * raio * (vertical ? 1.75 : 0.62);
                const tam = (s.tipo === 2 ? 17 : 28) * vida * (vertical ? 1.1 : 1);
                const rot = s.giro * avanco + n * 0.8;
                const flutua = -n * 0.6; // seguem subindo devagar: nada congela
                return (
                  <g key={k} transform={`translate(${x},${y + flutua}) rotate(${rot})`}>
                    {s.tipo === 0 && <rect x={-tam} y={-tam} width={tam * 2} height={tam * 2} rx={tam * 0.45} fill="none" stroke={s.cor} strokeWidth={7 * vida} transform="rotate(45)" />}
                    {s.tipo === 1 && <rect x={-tam * 0.8} y={-tam * 0.8} width={tam * 1.6} height={tam * 1.6} rx={tam * 0.4} fill={s.cor} transform="rotate(45)" />}
                    {s.tipo === 2 && <circle r={tam} fill={s.cor} />}
                    {s.tipo === 3 && (
                      <g fill={s.cor}>
                        <rect x={-tam * 0.28} y={-tam} width={tam * 0.56} height={tam * 2} rx={tam * 0.28} />
                        <rect x={-tam * 0.8} y={-tam * 0.55} width={tam * 1.6} height={tam * 0.56} rx={tam * 0.28} />
                      </g>
                    )}
                  </g>
                );
              })}
              <Logo cor={COR.branco} fundo="cheio" />
            </g>
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
