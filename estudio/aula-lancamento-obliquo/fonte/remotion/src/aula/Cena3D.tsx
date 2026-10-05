// Os três planos em 3D (GLSL): gancho, replay dos ângulos complementares e final.
// O fim do gancho e o início do final batem pixel a pixel com a lousa 2D (vista de lado, mesma escala).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Shader} from '../glsl/Shader';
import {CENA3D, Cam3, ESC, R_BOLA, projeta} from './cena3d';
import {C, INTER} from './estilo';
import {Rotulo} from './prim';
import {Tex} from './Tex';
import {camera as curvaCam, clamp01, entrada, expressiva, janela, lerp, P, PAUSA, prog, produtiva} from './tempo';
import {T, TH, V0, alcance} from './fisica';

const LADO: Cam3 = {yaw: 0, el: 0, dist: 15.75, foc: 2.1, alvo: [4.8, R_BOLA + 1.4, 0]}; // = estação "cheio" da lousa
type Chave = [number, Cam3];
const interp = (f: number, ks: Chave[]): Cam3 => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [fa, a] = ks[i - 1], [fb, b] = ks[i];
    if (f <= fb) {
      const t = curvaCam(clamp01((f - fa) / (fb - fa)));
      return {yaw: lerp(a.yaw, b.yaw, t), el: lerp(a.el, b.el, t), dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), t)), foc: lerp(a.foc, b.foc, t), alvo: [0, 1, 2].map((k) => lerp(a.alvo[k], b.alvo[k], t)) as [number, number, number]};
    }
  }
  return ks[ks.length - 1][1];
};
const pB = (t: number, v0 = V0, th = TH): [number, number, number] => {
  const x = v0 * Math.cos(th) * t, y = Math.max(0, v0 * Math.sin(th) * t - 5 * t * t);
  return [x * ESC, R_BOLA + y * ESC, 0];
};
const curva = (c: Cam3, t1: number, v0 = V0, th = TH, n = 80) => {
  let d = '';
  for (let k = 0; k <= n; k++) { const q = projeta(c, pB((t1 * k) / n, v0, th)); d += (k ? ' L ' : 'M ') + q.X.toFixed(1) + ' ' + q.Y.toFixed(1); }
  return d;
};

// ------------------------------------------------------------------ gancho (0 até a lousa)
const LANC = 6, POUSO = P(12) + 2;
const tbGancho = (f: number) => T * clamp01((f - LANC) / (POUSO - LANC));
const camGancho = (f: number): Cam3 => {
  const b = pB(tbGancho(f));
  const segue: [number, number, number] = [b[0] * 0.92 + 0.05, b[1] * 0.85 + 0.06, 0];
  const fixo: [number, number, number] = [4.8, 1.0, 0];
  const w = expressiva(clamp01((f - 95) / 90));
  const alvo = [0, 1, 2].map((k) => lerp(segue[k], fixo[k], w)) as [number, number, number];
  const base = interp(f, [
    [0, {yaw: -1.1, el: 0.08, dist: 1.25, foc: 2.1, alvo}],
    [70, {yaw: -0.78, el: 0.13, dist: 4.2, foc: 2.1, alvo}],
    [150, {yaw: -0.42, el: 0.2, dist: 10.5, foc: 2.1, alvo}],
    [P(15), {yaw: -0.33, el: 0.22, dist: 13.2, foc: 2.1, alvo}],
    [P(28), {yaw: -0.22, el: 0.16, dist: 14.2, foc: 2.1, alvo}],
    [PAUSA(31).ate - 6, LADO],
  ]);
  return {...base, alvo: f < P(28) ? alvo : base.alvo};
};

const Gancho: React.FC<{f: number}> = ({f}) => {
  const c = camGancho(f);
  const tb = tbGancho(f);
  const op = 1 - prog(f, P(31) + 20, 26, produtiva);
  // traço da curva, régua e rótulos por cima do 3D
  const traco = prog(f, P(15), 48, expressiva);
  const ticks: React.ReactNode[] = [];
  const regua = prog(f, P(24), 40, entrada) * janela(f, P(24), P(28) + 20, 1, 16);
  for (let m = 0; m <= 40; m++) {
    if (regua <= 0.001 || m / 40 > regua) break;
    const a = projeta(c, [m * ESC, 0, 0.0]), b = projeta(c, [m * ESC, 0, m % 5 === 0 ? 0.32 : 0.14]);
    ticks.push(<line key={'t' + m} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={C.tinta} strokeWidth={m % 5 === 0 ? 2.5 : 1.5} opacity={0.75} />);
    if (m % 10 === 0) { const q = projeta(c, [m * ESC, 0, 0.62]); ticks.push(<text key={'n' + m} x={q.X} y={q.Y} fontFamily={INTER} fontWeight={600} fontSize={24} fill={C.tinta} textAnchor="middle">{m} m</text>); }
  }
  const pico = projeta(c, pB(T / 2));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Shader frag={CENA3D} u={{yaw: c.yaw, el: c.el, dist: c.dist, foc: c.foc, alvo: c.alvo, voo1: [V0, TH, tb, tb], voo2: [0, 0, -1, 0], fantOp: 1, marcaX: 0, marcaOp: 0, aa: 1}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {traco > 0 && <path d={curva(c, T * traco)} stroke={C.tinta} strokeWidth={3} fill="none" opacity={0.8} />}
        {ticks}
      </svg>
      <Rotulo X={pico.X} Y={pico.Y - 120} op={janela(f, P(20), P(28) - 4, 12, 12)} tex={'y = x\\tan\\theta - \\dfrac{g\\,x^2}{2\\,v_0^2\\cos^2\\theta}'} size={46} dy={(1 - prog(f, P(20), 16, entrada)) * 16} />
      <Titulo f={f} />
    </div>
  );
};

const Titulo: React.FC<{f: number}> = ({f}) => {
  const palavras = ['Lançamento', 'oblíquo'];
  const sai = 1 - prog(f, PAUSA(31).de + 8, 18, produtiva);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 28, fontFamily: INTER, fontWeight: 700, fontSize: 108, letterSpacing: '-0.025em', color: C.tinta, opacity: sai}}>
      {palavras.map((w, i) => {
        const q = prog(f, P(30 + i) - 2, 16, entrada);
        return <span key={w} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 12}}><span style={{display: 'inline-block', transform: `translateY(${(1 - q) * 110}%)`}}>{w}</span></span>;
      })}
    </div>
  );
};

// ------------------------------------------------------------------ replay 30° e 60° (tempo congelado)
const R30 = Math.PI / 6, R60 = Math.PI / 3;
const Replay: React.FC<{f: number}> = ({f}) => {
  const pa = PAUSA(495);
  const xm = alcance(V0, R30) * ESC;
  const c = interp(f, [
    [pa.de - 6, {yaw: -0.55, el: 0.34, dist: 11.5, foc: 2.1, alvo: [4.3, 0.7, 0]}],
    [pa.ate, {yaw: 0.5, el: 0.15, dist: 7.6, foc: 2.1, alvo: [xm - 1.5, 0.75, 0]}],
  ]);
  const op = janela(f, pa.de - 8, pa.ate + 4, 12, 12);
  const q = projeta(c, [xm, 0, 0.45]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Shader frag={CENA3D} u={{yaw: c.yaw, el: c.el, dist: c.dist, foc: c.foc, alvo: c.alvo, voo1: [V0, R30, 2.0, 2.0], voo2: [V0, R60, 3.4641, 3.4641], fantOp: 1, marcaX: xm, marcaOp: 1, aa: 1}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d={curva(c, 2.0, V0, R30)} stroke={C.tinta} strokeWidth={3} fill="none" opacity={0.7} />
        <path d={curva(c, 3.4641, V0, R60)} stroke={C.cinza} strokeWidth={3} fill="none" opacity={0.7} />
      </svg>
      <Rotulo X={q.X} Y={q.Y + 40} txt="mesmo ponto" size={34} peso={600} cor={C.horiz} op={prog(f, pa.de + 30, 14, produtiva)} />
    </div>
  );
};

// ------------------------------------------------------------------ final: você já sabe onde ela cai
const Final: React.FC<{f: number}> = ({f}) => {
  const ini = P(521) - 6;
  const L0 = P(524) + 2, L1 = P(533) + 4;
  const tb = T * clamp01((f - L0) / (L1 - L0));
  const c = interp(f, [
    [ini + 10, LADO],
    [L0, {yaw: -0.36, el: 0.2, dist: 13.5, foc: 2.1, alvo: [4.8, 1.0, 0]}],
    [L1, {yaw: -0.28, el: 0.17, dist: 12.0, foc: 2.1, alvo: [5.4, 0.9, 0]}],
    [P(533) + 120, {yaw: -0.2, el: 0.14, dist: 10.5, foc: 2.1, alvo: [6.3, 0.7, 0]}],
  ]);
  const op = prog(f, ini, 16, produtiva) * (1 - prog(f, 8306 - 30, 28, produtiva));
  const xm = alcance() * ESC;
  const marca = prog(f, P(529), 14, produtiva);
  const q = projeta(c, [xm, 0, 0.5]);
  const anel = clamp01((f - L1) / 20);
  const pr = projeta(c, [xm, 0, 0]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <Shader frag={CENA3D} u={{yaw: c.yaw, el: c.el, dist: c.dist, foc: c.foc, alvo: c.alvo, voo1: [V0, TH, f >= L0 ? tb : 0, f >= L0 ? tb : -1], voo2: [0, 0, -1, 0], fantOp: 1, marcaX: xm, marcaOp: marca, aa: 1}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {anel > 0 && anel < 1 && <ellipse cx={pr.X} cy={pr.Y} rx={20 + anel * 90} ry={(20 + anel * 90) * 0.28} fill="none" stroke={C.horiz} strokeWidth={3} opacity={1 - anel} />}
      </svg>
      <Rotulo X={q.X} Y={q.Y + 34} tex={'A = 38{,}4\\ \\text{m}'} size={48} cor={C.horiz} op={marca} />
    </div>
  );
};

export const Cena3D: React.FC = () => {
  const f = useCurrentFrame();
  if (f < PAUSA(31).ate + 6) return <Gancho f={f} />;
  const pa = PAUSA(495);
  if (f >= pa.de - 8 && f < pa.ate + 4) return <Replay f={f} />;
  if (f >= P(521) - 6) return <Final f={f} />;
  return null;
};
