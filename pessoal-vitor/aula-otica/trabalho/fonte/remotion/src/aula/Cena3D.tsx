// Os planos em 3D: gancho do prisma, fibra óptica e final (que volta ao quadro 0 para o loop).
// O fim do gancho e o início do final batem com a lousa 2D: câmera exatamente de cima, quase ortográfica (dolly zoom).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Shader} from '../glsl/Shader';
import {Cam3, PRISMA, projeta} from './cenaPrisma';
import {FIBRA} from './cenaFibra';
import {FONTE, ENTRA, L1, L_TOTAL, YB, DIR_IN} from './otica';
import {C, HALO, INTER} from './estilo';
import {camera as curvaCam, clamp01, DURACAO, entrada, janela, lerp, P, PAUSA, prog, produtiva} from './tempo';

// câmera de cima que casa com a lousa 2D: s = foc·1080/dist = 381,6 px por unidade, centro (u, v) = (0,55; -0,4)
export const TOPO: Cam3 = {yaw: 0, el: 1.5698, dist: 30, foc: 10.6, alvo: [0.55, YB, 0.4]};
export const S_TOPO = (TOPO.foc * 1080) / TOPO.dist;
// câmera de cima que casa com a lousa do ato 5 (estação prisma5: 300 px/unidade, prisma à esquerda)
export const TOPO5: Cam3 = {yaw: 0, el: 1.5698, dist: 30, foc: 8.3333, alvo: [0.55 + 260 / 300, YB, 0.4 + 70 / 300]};
export const F0: Cam3 = {yaw: -0.15, el: 0.42, dist: 4.4, foc: 2.0, alvo: [0.25, 0.35, 0.15]}; // quadro 0 = último quadro
const HEROI: Cam3 = {yaw: 0.22, el: 0.38, dist: 5.3, foc: 2.0, alvo: [0.85, 0.33, 0.4]};

type Chave = [number, Cam3];
const L = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));
export const interp = (f: number, ks: Chave[]): Cam3 => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [fa, a] = ks[i - 1], [fb, b] = ks[i];
    if (f <= fb) {
      const t = curvaCam(clamp01((f - fa) / (fb - fa)));
      return {yaw: lerp(a.yaw, b.yaw, t), el: lerp(a.el, b.el, t), dist: L(a.dist, b.dist, t), foc: L(a.foc, b.foc, t), alvo: [0, 1, 2].map((k) => lerp(a.alvo[k], b.alvo[k], t)) as [number, number, number]};
    }
  }
  return ks[ks.length - 1][1];
};
// frente do feixe no quadro 0: o ponto do caminho que está logo fora da borda esquerda
const pontoCaminho = (s: number): [number, number, number] => [FONTE[0] + DIR_IN[0] * s, YB, -(FONTE[1] + DIR_IN[1] * s)];
export const FRENTE0 = (() => { let s = L1; while (s > 0 && projeta(F0, pontoCaminho(s)).X > -320) s -= 0.02; return s; })();
// piecewise linear
const pl = (f: number, ks: [number, number][]) => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (f <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], (f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
  return ks[ks.length - 1][1];
};
const LIN = L1 + 0.56; // saída aproximada do vidro (comprimento do trecho interno ≈ 0,55)

// ------------------------------------------------------------------ estado do prisma por quadro
export const GANCHO_FIM = PAUSA(21).ate + 4;
export const FINAL_INI = PAUSA(273).de;
export const estadoPrisma = (f: number) => {
  if (f < FINAL_INI) {
    // a luz anda devagar no vidro (v = c/n) e rápido no ar
    const frente = pl(f, [[0, FRENTE0], [P(3), L1], [P(6) + 2, LIN], [P(7) + 12, L_TOTAL + 0.2]]);
    const cam = interp(f, [
      [0, F0],
      [P(7) + 14, HEROI],
      [P(16), {yaw: 0.62, el: 0.42, dist: 4.4, foc: 2.0, alvo: [1.15, 0.0, 0.5]}],
      [P(21) + 6, {yaw: 0.3, el: 0.8, dist: 7.5, foc: 2.4, alvo: [0.6, YB, 0.38]}],
      [GANCHO_FIM - 8, TOPO],
    ]);
    return {cam, frente, cauda: -1};
  }
  const apaga = P(285) + 30;
  const cam = interp(f, [
    [FINAL_INI + 8, TOPO5],
    [P(274) + 6, HEROI],
    [P(285), {yaw: 0.55, el: 0.34, dist: 4.1, foc: 2.0, alvo: [1.0, 0.33, 0.42]}],
    [DURACAO - 16, F0],
  ]);
  const cauda = pl(f, [[apaga, -1], [apaga + 10, L1 * 0.6], [apaga + 24, L1], [apaga + 34, LIN], [apaga + 50, L_TOTAL + 0.3]]);
  return {cam, frente: L_TOTAL + 1, cauda};
};

const Prisma: React.FC<{f: number; op: number}> = ({f, op}) => {
  const {cam: c, frente, cauda} = estadoPrisma(f);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Shader frag={PRISMA} u={{yaw: c.yaw, el: c.el, dist: c.dist, foc: c.foc, alvo: c.alvo, frente, cauda, luz: 1, amb: 1, tela: 1, expo: 1.4, aa: 2}} />
    </div>
  );
};

// título do gancho: entra palavra por palavra no "Como o vidro faz isso?"
const Titulo: React.FC<{f: number}> = ({f}) => {
  const palavras = ['Refração', 'da', 'luz'];
  const sai = 1 - prog(f, GANCHO_FIM - 14, 12, produtiva);
  if (f < P(17) - 4 || sai <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 110, top: 70, display: 'flex', gap: 26, fontFamily: INTER, fontWeight: 700, fontSize: 82, letterSpacing: '-0.025em', color: C.tinta, opacity: sai, textShadow: HALO}}>
      {palavras.map((w, i) => {
        const q = prog(f, P(17) + i * 5, 16, entrada);
        return <span key={w} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 14}}><span style={{display: 'inline-block', transform: `translateY(${(1 - q) * 110}%)`}}>{w}</span></span>;
      })}
    </div>
  );
};

// ------------------------------------------------------------------ fibra óptica
export const FIBRA_INI = P(222) - 8;
export const FIBRA_FIM = PAUSA(230).ate + 6;
const Fibra: React.FC<{f: number}> = ({f}) => {
  const t = clamp01((f - FIBRA_INI) / (FIBRA_FIM - FIBRA_INI));
  const frente = lerp(-1.4, 6.2, t);
  const cam: Cam3 = {yaw: lerp(0.5, 0.22, curvaCam(t)), el: lerp(0.2, 0.1, t), dist: lerp(2.5, 2.05, curvaCam(t)), foc: 1.7, alvo: [lerp(-0.2, 3.6, t), 0.5, 0]};
  const op = janela(f, FIBRA_INI, FIBRA_FIM + 10, 10, 10);
  const rot = prog(f, P(226) - 2, 14, entrada) * (1 - prog(f, FIBRA_FIM - 10, 10, produtiva));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Shader frag={FIBRA} u={{yaw: cam.yaw, el: cam.el, dist: cam.dist, foc: cam.foc, alvo: cam.alvo, frente, luz: 1, expo: 1.3, aa: 2}} />
      <div style={{position: 'absolute', left: 120, top: 120, fontFamily: INTER, fontWeight: 700, fontSize: 64, letterSpacing: '-0.02em', color: C.tinta, opacity: rot, transform: `translateY(${(1 - rot) * 16}px)`, textShadow: HALO}}>
        fibra óptica
        <div style={{fontWeight: 500, fontSize: 34, color: C.cinza, marginTop: 6, letterSpacing: '-0.01em'}}>a luz quica nas paredes e não escapa</div>
      </div>
    </div>
  );
};

export const Cena3D: React.FC = () => {
  const f = useCurrentFrame();
  const out: React.ReactNode[] = [];
  if (f < GANCHO_FIM + 2) out.push(<Prisma key="g" f={f} op={1 - prog(f, GANCHO_FIM - 12, 12, produtiva)} />, <Titulo key="t" f={f} />);
  if (f >= FIBRA_INI && f < FIBRA_FIM + 10) out.push(<Fibra key="fi" f={f} />);
  if (f >= FINAL_INI) out.push(<Prisma key="fin" f={f} op={prog(f, FINAL_INI, 10, produtiva)} />);
  return <>{out}</>;
};
