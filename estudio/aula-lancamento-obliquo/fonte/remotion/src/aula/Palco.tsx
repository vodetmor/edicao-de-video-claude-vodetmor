// Palco 2D da aula: o mundo físico (metros, y para cima) desenhado em SVG por uma câmera que viaja.
// Cada trecho é preso às palavras da locução (P = início da palavra i, PAUSA = silêncio aberto).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {camAt, tela, Cam, W, HH} from './camera';
import {C, INTER} from './estilo';
import {Arco, Bola, Rotulo, Seta} from './prim';
import {A, COS, G, H, SEN, T, TH, TS, V0, VX, VY, alcance, fmt, pos, vel, voo} from './fisica';
import {approach, clamp01, entrada, expressiva, janela, lerp, P, PAUSA, PE, prog, produtiva, saida} from './tempo';

const K = 0.25; // comprimento da seta: metros de desenho por m/s
const fant = Array.from({length: 17}, (_, i) => i * 0.2); // flash a cada 0,2 s

// trilha da câmera: [quadro de chegada, estação, duração da viagem]
export const TRILHA: [number, string, number][] = [
  [0, 'cheio', 1],
  [P(48) + 18, 'bola', 34],
  [P(63) + 24, 'cheio', 34],
  [P(66) + 30, 'origem', 40],
  [P(98) + 18, 'origemEsq', 30],
  [P(124) + 30, 'cheio', 36],
  [P(139) + 30, 'esquerda', 36],
  [P(216) + 26, 'cheio', 34],
  [P(226) + 22, 'esquerda', 34],
  [P(291) + 34, 'topo', 40],
  [P(321) + 26, 'esquerda', 36],
  [P(424) + 28, 'leque', 36],
  [P(463) + 30, 'compl', 36],
  [P(496) + 24, 'resumo', 34],
];

const caminho = (c: Cam, t0: number, t1: number, v0 = V0, th = TH, n = 90) => {
  let d = '';
  for (let k = 0; k <= n; k++) {
    const t = lerp(t0, t1, k / n);
    const p = pos(t, v0, th);
    const {X, Y} = tela(c, p.x, p.y);
    d += (k ? ' L ' : 'M ') + X.toFixed(1) + ' ' + Y.toFixed(1);
  }
  return d;
};

// componentes do palco ----------------------------------------------------------
const Chao: React.FC<{c: Cam; f: number; op: number; marcas?: number}> = ({c, f, op, marcas = 1}) => {
  const a = tela(c, -40, 0), b = tela(c, 80, 0);
  const ticks = [];
  for (let m = 0; m <= 40; m += 5) {
    const {X, Y} = tela(c, m, 0);
    ticks.push(<g key={m} opacity={marcas}><line x1={X} y1={Y} x2={X} y2={Y + 9} stroke={C.cinza} strokeWidth={2} /></g>);
  }
  return (
    <g opacity={op}>
      <line x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={C.tinta} strokeWidth={2.5} />
      {ticks}
    </g>
  );
};

const Grade: React.FC<{c: Cam; op: number}> = ({c, op}) => {
  if (op <= 0.001) return null;
  const linhas = [];
  for (let m = -20; m <= 70; m += 5) {
    const {X} = tela(c, m, 0);
    if (X < -10 || X > W + 10) continue;
    linhas.push(<line key={'v' + m} x1={X} y1={0} x2={X} y2={tela(c, 0, 0).Y} stroke={C.grade} strokeWidth={1.5} />);
  }
  for (let m = 5; m <= 40; m += 5) {
    const {Y} = tela(c, 0, m);
    if (Y < -10 || Y > HH) continue;
    linhas.push(<line key={'h' + m} x1={0} y1={Y} x2={W} y2={Y} stroke={C.grade} strokeWidth={1.5} />);
  }
  return <g opacity={op}>{linhas}</g>;
};

// ---------------------------------------------------------------------------------
export const Palco: React.FC = () => {
  const f = useCurrentFrame();
  const c = camAt(f, TRILHA);
  const O = tela(c, 0, 0);
  const svg: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  const add = (n: React.ReactNode) => svg.push(n);
  const lab = (n: React.ReactNode) => html.push(n);
  const k = (n: string) => n + '';

  // entrada da lousa (sai do 3D) e fundo de medida
  const lousa = prog(f, P(31) + 20, 26, produtiva);
  add(<Grade key="grade" c={c} op={lousa * 0.9} />);
  add(<Chao key="chao" c={c} f={f} op={lousa} marcas={1} />);

  // ===== A. a trajetória do gancho volta para a origem ("passo a passo") =========
  {
    const ini = P(32), fim = P(36, 10);
    if (f < fim + 20) {
      const r = clamp01((f - ini) / (fim - ini));
      const tb = T * (1 - expressiva(r)); // bola rebobina
      const op = lousa;
      add(<path key="A-traj" d={caminho(c, 0, tb)} stroke={C.tinta} strokeWidth={3} fill="none" opacity={op * 0.75} />);
      fant.forEach((t, i) => { if (t <= tb + 1e-6) { const p = tela(c, pos(t).x, pos(t).y); add(<Bola key={'A-f' + i} X={p.X} Y={p.Y} fant op={op} />); } });
      const p = tela(c, pos(tb).x, pos(tb).y);
      add(<Bola key="A-bola" X={p.X} Y={p.Y} op={op} />);
    }
  }

  // ===== B. regra do jogo: sem ar, só o peso ======================================
  {
    const ini = P(36, 10), fim = P(66, 14);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 1, 12);
      const b = tela(c, 0, 0);
      // vento: riscos horizontais que somem em "desprezar"
      const vento = janela(f, P(42) - 10, P(43) + 18, 12, 18);
      if (vento > 0) {
        for (let i = 0; i < 9; i++) {
          const y = (i - 4) * 0.55 + 0.4;
          const ph = ((f * 0.9 + i * 37) % 120) / 120;
          const x0 = -6 + ph * 14;
          const p0 = tela(c, x0, y), p1 = tela(c, x0 + 1.6 + (i % 3) * 0.5, y);
          add(<line key={'B-v' + i} x1={p0.X} y1={p0.Y} x2={p1.X} y2={p1.Y} stroke={C.cinza} strokeWidth={2.5} strokeLinecap="round" opacity={vento * 0.6 * op} />);
        }
      }
      lab(<Rotulo key="B-semar" X={b.X} Y={b.Y + 74} txt="sem resistência do ar" size={29} cor={C.cinza} op={janela(f, P(45), P(48) + 6, 10, 8) * op} />);
      add(<Bola key="B-bola" X={b.X} Y={b.Y} op={op} esc={c.s / 36 > 2 ? 1.6 : 1} />);
      // o peso
      const cres = approach(f, P(55, 6), 0.16);
      const esc = c.s / 36 > 2 ? 1.6 : 1;
      const comp = 1.55 * Math.min(c.s, 120);
      const pulso = 1 + 0.06 * Math.sin(clamp01((f - P(60)) / 16) * Math.PI);
      add(<Seta key="B-peso" x1={b.X} y1={b.Y + 15 * esc} x2={b.X} y2={b.Y + 15 * esc + comp * pulso} cor={C.peso} w={6} cresce={cres} op={op * janela(f, P(55), P(63, 20), 1, 12)} cabeca={24} />);
      lab(<Rotulo key="B-plabel" X={b.X + 40} Y={b.Y + 15 * esc + comp * 0.62} tex={'\\vec{P} = m\\,\\vec{g}'} size={44} cor={C.peso} ancora="e" op={op * cres * janela(f, P(55), P(63, 20), 1, 12)} />);
      // "só pra baixo": o mesmo peso em todo ponto da trajetória
      const todos = prog(f, P(63), 22, produtiva);
      if (todos > 0) {
        add(<path key="B-traj" d={caminho(c, 0, T)} stroke={C.linha} strokeWidth={3} strokeDasharray="8 10" fill="none" opacity={todos * op} />);
        [0, 0.8, 1.6, 2.4, 3.2].forEach((t, i) => {
          const s = clamp01((f - P(63) - i * 4) / 12);
          const p = tela(c, pos(t).x, pos(t).y);
          const L = 1.55 * 36 * (c.s / 36);
          add(<Bola key={'B-g' + i} X={p.X} Y={p.Y} op={op * s} />);
          add(<Seta key={'B-gs' + i} x1={p.X} y1={p.Y + 15} x2={p.X} y2={p.Y + 15 + Math.min(L, 90)} cor={C.peso} w={5} cresce={approach(f, P(63) + i * 4, 0.2)} op={op} cabeca={18} />);
        });
      }
      const pa = PAUSA(65);
      lab(<Rotulo key="B-ax" X={1500} Y={170} tex={'a_x = 0'} size={52} cor={C.horiz} op={op * janela(f, pa.de + 4, fim + 12, 12, 10)} dy={(1 - approach(f, pa.de + 4)) * 14} />);
      lab(<Rotulo key="B-ay" X={1500} Y={250} tex={'a_y = -g'} size={52} cor={C.vert} op={op * janela(f, pa.de + 16, fim + 12, 12, 10)} dy={(1 - approach(f, pa.de + 16)) * 14} />);
      lab(<Rotulo key="B-g" X={1500} Y={318} tex={'g \\approx 10\\ \\text{m/s}^2'} size={34} cor={C.cinza} op={op * janela(f, pa.de + 30, fim + 12, 12, 10)} />);
    }
  }

  // ===== C/D. o vetor v0 e a quebra em duas ======================================
  {
    const ini = P(66, 6), fim = P(124, 10);
    if (f >= ini && f < fim + 14) {
      const op = janela(f, ini, fim + 14, 10, 14);
      const vtip = tela(c, V0 * K * COS, V0 * K * SEN);
      const xtip = tela(c, VX * K, 0), ytip = tela(c, 0, VY * K);
      add(<Bola key="C-bola" X={O.X} Y={O.Y} op={op} esc={1.3} />);
      // triângulo retângulo (pausas da derivação)
      const pa1 = PAUSA(102), pa2 = PAUSA(115);
      const tri = Math.max(janela(f, pa1.de, P(124), 14, 10), 0);
      if (tri > 0) add(<path key="C-tri" d={`M ${O.X} ${O.Y} L ${xtip.X} ${xtip.Y} L ${vtip.X} ${vtip.Y} Z`} fill={C.tinta} opacity={0.05 * tri * op} />);
      // ângulo reto
      if (tri > 0) { const s = 22; add(<path key="C-reto" d={`M ${xtip.X - s} ${xtip.Y} L ${xtip.X - s} ${xtip.Y - s} L ${xtip.X} ${xtip.Y - s}`} stroke={C.cinza} strokeWidth={2} fill="none" opacity={tri * op} />); }
      // componentes nascem do vetor
      const q = approach(f, P(93, 10), 0.11);
      const tracej = janela(f, P(93), fim, 12, 10) * 0.8;
      add(<line key="C-dx" x1={vtip.X} y1={vtip.Y} x2={xtip.X} y2={xtip.Y} stroke={C.cinza} strokeWidth={2} strokeDasharray="7 8" opacity={tracej * op * (1 - tri)} />);
      add(<line key="C-dy" x1={vtip.X} y1={vtip.Y} x2={ytip.X} y2={ytip.Y} stroke={C.cinza} strokeWidth={2} strokeDasharray="7 8" opacity={tracej * op} />);
      const pulsoX = 1 + 0.25 * Math.sin(clamp01((f - P(99)) / 14) * Math.PI);
      const pulsoY = 1 + 0.25 * Math.sin(clamp01((f - P(112)) / 14) * Math.PI);
      add(<Seta key="C-vx" x1={O.X} y1={O.Y} x2={xtip.X} y2={xtip.Y} cor={C.horiz} w={6 * pulsoX} cresce={q} op={op} cabeca={22} />);
      add(<Seta key="C-vy" x1={O.X} y1={O.Y} x2={ytip.X} y2={ytip.Y} cor={C.vert} w={6 * pulsoY} cresce={approach(f, P(93, 16), 0.11)} op={op} cabeca={22} />);
      // cópia do v0y no lado oposto do triângulo (seno)
      const opo = approach(f, pa2.de - 20, 0.1);
      if (f > pa2.de - 20) add(<Seta key="C-vy2" x1={lerp(O.X, xtip.X, opo)} y1={O.Y} x2={lerp(ytip.X, vtip.X, opo)} y2={ytip.Y} cor={C.vert} w={6} op={op * 0.9} cabeca={22} />);
      // v0
      const cres = approach(f, P(71), 0.13);
      add(<Seta key="C-v0" x1={O.X} y1={O.Y} x2={vtip.X} y2={vtip.Y} cor={C.tinta} w={6} cresce={cres} op={op} cabeca={24} />);
      lab(<Rotulo key="C-l0" X={lerp(O.X, vtip.X, 0.45) - 46} Y={lerp(O.Y, vtip.Y, 0.45) - 26} tex={'\\vec{v}_0'} size={50} op={op * prog(f, P(73), 12, produtiva)} />);
      // ângulo θ
      const arco = prog(f, P(78), 20, expressiva);
      add(<Arco key="C-arc" X={O.X} Y={O.Y} r={118} a0={0} a1={(TH * 180) / Math.PI * arco} cor={C.tinta} w={3} op={op} />);
      lab(<Rotulo key="C-th" X={O.X + 150} Y={O.Y - 50} tex={'\\theta'} size={46} op={op * prog(f, P(79), 10, produtiva)} />);
      // chão destacado em "chão"
      const ch = janela(f, P(83), P(84, 18), 8, 14);
      add(<line key="C-chao" x1={O.X} y1={O.Y} x2={O.X + 900 * prog(f, P(83), 16, entrada)} y2={O.Y} stroke={C.tinta} strokeWidth={6} opacity={ch * op} strokeLinecap="round" />);
      // rótulos das componentes
      lab(<Rotulo key="C-lx" X={(O.X + xtip.X) / 2} Y={O.Y + 46} tex={'v_{0x}'} size={46} cor={C.horiz} op={op * prog(f, P(100), 12, produtiva)} />);
      lab(<Rotulo key="C-ly" X={O.X - 22} Y={(O.Y + ytip.Y) / 2} tex={'v_{0y}'} size={46} cor={C.vert} ancora="d" op={op * prog(f, P(113), 12, produtiva) * (1 - opo)} />);
      lab(<Rotulo key="C-ly2" X={vtip.X + 22} Y={(O.Y + ytip.Y) / 2} tex={'v_{0y}'} size={46} cor={C.vert} ancora="e" op={op * opo} />);
      // nomes dos lados (silencioso, na pausa)
      {
        // "hipotenusa" escrito ao longo do vetor, do lado de fora do triângulo
        const mx = lerp(O.X, vtip.X, 0.7), my = lerp(O.Y, vtip.Y, 0.7);
        const ang = Math.atan2(vtip.Y - O.Y, vtip.X - O.X) * 180 / Math.PI;
        const nx = -(vtip.Y - O.Y), ny = vtip.X - O.X, nl = Math.hypot(nx, ny);
        const ohp = op * janela(f, pa1.de + 6, P(124), 10, 8);
        if (ohp > 0) lab(<div key="C-hip" style={{position: 'absolute', left: mx - (nx / nl) * 30, top: my - (ny / nl) * 30, transform: `translate(-50%,-50%) rotate(${ang}deg)`, fontFamily: INTER, fontWeight: 500, fontSize: 27, color: C.cinza, opacity: ohp, whiteSpace: 'nowrap'}}>hipotenusa</div>);
      }
      lab(<Rotulo key="C-adj" X={(O.X + xtip.X) / 2} Y={O.Y + 92} txt="cateto adjacente" size={27} cor={C.horiz} op={op * janela(f, pa1.de + 14, pa2.de - 22, 10, 8)} />);
      lab(<Rotulo key="C-opo" X={vtip.X + 22} Y={(O.Y + ytip.Y) / 2 + 44} txt="cateto oposto" size={27} cor={C.vert} ancora="e" op={op * janela(f, pa2.de + 6, P(124), 10, 8)} />);
    }
  }

  // ===== E. independência: o voo com as duas sombras ==============================
  const RAIL = -3.2; // trilho vertical à esquerda da origem
  {
    const ini = P(124, 8), fim = P(139, 14);
    if (f >= ini && f < fim + 14) {
      const op = janela(f, ini, fim + 14, 12, 14);
      const l0 = P(129) + 2, l1 = PAUSA(138).ate - 16;
      const tb = T * clamp01((f - l0) / (l1 - l0));
      const p = pos(tb);
      const B = tela(c, p.x, p.y), Sx = tela(c, p.x, 0), Sy = tela(c, RAIL, p.y);
      const rTop = tela(c, RAIL, 14), rBot = tela(c, RAIL, 0);
      add(<line key="E-rail" x1={rBot.X} y1={rBot.Y} x2={rTop.X} y2={rTop.Y} stroke={C.vert} strokeWidth={2.5} opacity={op * 0.5} />);
      add(<line key="E-rail2" x1={O.X} y1={O.Y} x2={tela(c, 40, 0).X} y2={O.Y} stroke={C.horiz} strokeWidth={4} opacity={op * 0.5 * prog(f, P(129), 16)} />);
      add(<path key="E-traj" d={caminho(c, 0, tb)} stroke={C.tinta} strokeWidth={3} fill="none" opacity={op * 0.75} />);
      fant.forEach((t, i) => {
        if (t > tb + 1e-6) return;
        const q = pos(t), a = tela(c, q.x, q.y), sx = tela(c, q.x, 0), sy = tela(c, RAIL, q.y);
        add(<Bola key={'E-f' + i} X={a.X} Y={a.Y} fant op={op} />);
        add(<line key={'E-tx' + i} x1={sx.X} y1={sx.Y - 10} x2={sx.X} y2={sx.Y + 10} stroke={C.horiz} strokeWidth={3} opacity={op} />);
        add(<line key={'E-ty' + i} x1={sy.X - 10} y1={sy.Y} x2={sy.X + 10} y2={sy.Y} stroke={C.vert} strokeWidth={3} opacity={op} />);
      });
      const guia = op * (tb > 0 && tb < T ? 1 : 0.0);
      add(<line key="E-gx" x1={B.X} y1={B.Y} x2={Sx.X} y2={Sx.Y} stroke={C.horiz} strokeWidth={2} strokeDasharray="6 7" opacity={guia * 0.7} />);
      add(<line key="E-gy" x1={B.X} y1={B.Y} x2={Sy.X} y2={Sy.Y} stroke={C.vert} strokeWidth={2} strokeDasharray="6 7" opacity={guia * 0.7} />);
      add(<Bola key="E-sx" X={Sx.X} Y={Sx.Y} r={11} cor={C.horiz} op={op} />);
      add(<Bola key="E-sy" X={Sy.X} Y={Sy.Y} r={11} cor={C.vert} op={op} />);
      add(<Bola key="E-bola" X={B.X} Y={B.Y} op={op} />);
      lab(<Rotulo key="E-lh" X={tela(c, 34, 0).X} Y={O.Y + 44} txt="horizontal" size={29} peso={600} cor={C.horiz} op={op * prog(f, P(130), 12, produtiva)} />);
      lab(<Rotulo key="E-lv" X={rTop.X} Y={rTop.Y - 30} txt="vertical" size={29} peso={600} cor={C.vert} op={op * prog(f, P(131), 12, produtiva)} />);
    }
  }

  // ===== F/G/H. horizontal uniforme, vertical variado, juntos = parábola ==========
  {
    const ini = P(139, 6), fim = P(216, 6);
    if (f >= ini && f < fim + 14) {
      const op = janela(f, ini, fim + 14, 12, 14);
      const juntos = prog(f, P(206), 30, expressiva);
      const desenha = prog(f, P(212), 40, expressiva);
      add(<path key="F-traj" d={caminho(c, 0, T)} stroke={C.tinta} strokeWidth={lerp(2.5, 4, desenha)} fill="none" opacity={op * lerp(0.35, 0.95, desenha)} />);
      const ts = [0, 0.8, 1.6, 2.4, 3.2];
      ts.forEach((t, i) => {
        const q = pos(t), a = tela(c, q.x, q.y);
        add(<Bola key={'F-b' + i} X={a.X} Y={a.Y} op={op} r={12} />);
        // horizontal: sempre a mesma seta
        const hx = approach(f, P(147) + i * 3, 0.16);
        const vx = tela(c, q.x + VX * K * 1.15, q.y);
        add(<Seta key={'F-hx' + i} x1={a.X} y1={a.Y} x2={vx.X} y2={vx.Y} cor={C.horiz} w={5} cresce={hx} op={op * (1 - juntos * 0.65)} cabeca={17} />);
        // vertical: encolhe na subida, zera no topo, cresce na descida
        const v = vel(t).y;
        const quando = v >= 0 ? P(166) + i * 4 : P(172) + (i - 3) * 4;
        const vy = tela(c, q.x, q.y + v * K * 1.15);
        add(<Seta key={'F-vy' + i} x1={a.X} y1={a.Y} x2={vy.X} y2={vy.Y} cor={C.vert} w={5} cresce={approach(f, quando, 0.16)} op={op * (1 - juntos * 0.65)} cabeca={17} />);
        if (Math.abs(v) < 1e-6) lab(<Rotulo key={'F-zero' + i} X={a.X} Y={a.Y - 40} tex={'v_y = 0'} size={30} cor={C.vert} op={op * prog(f, P(168), 12, produtiva)} />);
        // juntos: a soma das duas é a velocidade, tangente ao caminho
        const tip = tela(c, q.x + VX * K * 1.15, q.y + v * K * 1.15);
        add(<line key={'F-px' + i} x1={vx.X} y1={vx.Y} x2={tip.X} y2={tip.Y} stroke={C.vert} strokeWidth={2} strokeDasharray="5 6" opacity={op * juntos * 0.7} />);
        add(<line key={'F-py' + i} x1={vy.X} y1={vy.Y} x2={tip.X} y2={tip.Y} stroke={C.horiz} strokeWidth={2} strokeDasharray="5 6" opacity={op * juntos * 0.7} />);
        add(<Seta key={'F-v' + i} x1={a.X} y1={a.Y} x2={tip.X} y2={tip.Y} cor={C.tinta} w={5} cresce={approach(f, P(206) + 10 + i * 4, 0.14)} op={op} cabeca={18} />);
      });
      // marcas de 1 em 1 segundo no chão: mesma distância (MRU)
      [0, 1, 2, 3].forEach((t, i) => {
        if (i === 3) return;
        const a = tela(c, pos(t).x, 0), b = tela(c, pos(t + 1).x, 0);
        const s = prog(f, P(148) + i * 5, 14, produtiva) * janela(f, P(148), P(162), 1, 12);
        add(<path key={'F-ch' + i} d={`M ${a.X + 4} ${a.Y + 18} Q ${(a.X + b.X) / 2} ${a.Y + 44} ${b.X - 4} ${a.Y + 18}`} stroke={C.horiz} strokeWidth={2.5} fill="none" opacity={op * s} />);
        lab(<Rotulo key={'F-12' + i} X={(a.X + b.X) / 2} Y={a.Y + 62} txt="12 m" size={26} cor={C.horiz} peso={600} op={op * s} />);
      });
      lab(<Rotulo key="F-1s" X={tela(c, 18, 0).X} Y={O.Y + 104} txt="a cada 1 segundo" size={25} cor={C.cinza} op={op * janela(f, P(149), P(162), 12, 12)} />);
    }
  }

  // ===== I. as três perguntas ====================================================
  {
    const ini = P(216, 2), fim = P(226, 10);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 12, 12);
      add(<path key="I-traj" d={caminho(c, 0, T)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.95} />);
      const top = tela(c, pos(TS).x, H), l = tela(c, A, 0);
      const ch = (n: number, X: number, Y: number, txt: string, q: number) => {
        const s = approach(f, q, 0.18);
        lab(<div key={'I-c' + n} style={{position: 'absolute', left: X, top: Y, transform: `translate(-50%,-50%) scale(${lerp(0.92, 1, s)})`, opacity: op * s, display: 'flex', alignItems: 'center', gap: 12, fontFamily: INTER, fontWeight: 600, fontSize: 34, color: C.tinta}}>
          <span style={{width: 48, height: 48, borderRadius: 24, background: C.tinta, color: C.papel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27}}>{n}</span>{txt}</div>);
      };
      ch(1, top.X, top.Y - 70, 'tempo', P(218));
      const hx = tela(c, pos(TS).x, 0);
      add(<line key="I-h" x1={hx.X} y1={hx.Y} x2={top.X} y2={top.Y + 14} stroke={C.vert} strokeWidth={3} strokeDasharray="8 8" opacity={op * prog(f, P(219) + 5, 12)} />);
      ch(2, hx.X + 118, (hx.Y + top.Y) / 2, 'altura', P(219) + 5);
      add(<Seta key="I-a" x1={O.X} y1={O.Y + 40} x2={l.X} y2={l.Y + 40} cor={C.horiz} w={4} cresce={approach(f, P(219) + 10, 0.12)} op={op} cabeca={16} />);
      ch(3, (O.X + l.X) / 2, O.Y + 88, 'alcance', P(219) + 10);
    }
  }

  // ===== J. pergunta 1: tempo de subida e simetria ================================
  {
    const ini = P(226, 4), fim = P(291, 10);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 12, 12);
      const sobe0 = P(233), sobe1 = P(240) + 4, desce0 = P(274), desce1 = P(279) + 6;
      const tb = f < desce0 ? TS * clamp01((f - sobe0) / (sobe1 - sobe0)) : TS + TS * clamp01((f - desce0) / (desce1 - desce0));
      add(<path key="J-traj0" d={caminho(c, 0, T)} stroke={C.linha} strokeWidth={3} fill="none" opacity={op} />);
      add(<path key="J-traj" d={caminho(c, 0, tb)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.9} />);
      // dobra: a metade da subida espelhada cai sobre a descida
      const dobra = prog(f, P(268), 34, expressiva);
      if (dobra > 0) {
        const xt = tela(c, pos(TS).x, 0).X;
        add(<g key="J-dobra" transform={`translate(${xt} 0) scale(${lerp(1, -1, dobra)} 1) translate(${-xt} 0)`}><path d={caminho(c, 0, TS)} stroke={C.vert} strokeWidth={4} fill="none" opacity={op * 0.8 * janela(f, P(268), P(291), 6, 14)} /></g>);
      }
      const q = pos(tb), a = tela(c, q.x, q.y);
      const v = vel(tb);
      add(<Seta key="J-vy" x1={a.X} y1={a.Y} x2={a.X} y2={a.Y - v.y * K * c.s * 1.15} cor={C.vert} w={5} op={op} cabeca={17} />);
      add(<Seta key="J-vx" x1={a.X} y1={a.Y} x2={a.X + v.x * K * c.s * 1.15} y2={a.Y} cor={C.horiz} w={5} op={op} cabeca={17} />);
      add(<Bola key="J-bola" X={a.X} Y={a.Y} op={op} />);
      lab(<Rotulo key="J-z" X={a.X} Y={a.Y - 48} tex={'v_y = 0'} size={32} cor={C.vert} op={op * janela(f, P(240), P(253), 8, 10)} />);
      // tempos de cada metade
      const top = tela(c, pos(TS).x, 0);
      const meia = (n: string, x0: number, x1: number, q0: number) => {
        const s = prog(f, q0, 14, produtiva);
        add(<path key={'J-m' + n} d={`M ${x0 + 4} ${O.Y + 18} Q ${(x0 + x1) / 2} ${O.Y + 44} ${x1 - 4} ${O.Y + 18}`} stroke={C.tinta} strokeWidth={2.5} fill="none" opacity={op * s} />);
        lab(<Rotulo key={'J-l' + n} X={(x0 + x1) / 2} Y={O.Y + 64} tex={'1{,}6\\ \\text{s}'} size={30} op={op * s} />);
      };
      meia('a', O.X, top.X, P(255));
      meia('b', top.X, tela(c, A, 0).X, P(278));
      const tot = prog(f, P(281), 16, produtiva);
      add(<Seta key="J-T" x1={O.X} y1={O.Y + 104} x2={tela(c, A, 0).X} y2={O.Y + 104} cor={C.tinta} w={3} cresce={tot} op={op} cabeca={14} />);
      lab(<Rotulo key="J-Tl" X={(O.X + tela(c, A, 0).X) / 2} Y={O.Y + 140} tex={'T = 3{,}2\\ \\text{s}'} size={34} op={op * prog(f, PAUSA(290).de, 14, produtiva)} />);
    }
  }

  // ===== K. detalhe do topo: a bola não para =====================================
  {
    const ini = P(291, 4), fim = P(321, 10);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 12, 12);
      const a0 = P(293), a1 = P(320) + 10;
      const tb = lerp(0.95, 2.25, clamp01((f - a0) / (a1 - a0)));
      // passa pelo topo exatamente em "zerou"
      const tt = (() => { const fz = P(304) + 6; const r = (f - a0) / (fz - a0); return f < fz ? lerp(0.95, TS, clamp01(r)) : TS + (2.25 - TS) * clamp01((f - fz) / (a1 - fz)); })();
      void tb;
      add(<path key="K-traj" d={caminho(c, 0.6, 2.6)} stroke={C.linha} strokeWidth={3} fill="none" opacity={op} />);
      add(<path key="K-trajb" d={caminho(c, 0.6, tt)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.9} />);
      const q = pos(tt), a = tela(c, q.x, q.y), v = vel(tt);
      // rastro de fantasmas (mostra que ela continua andando)
      [0.25, 0.5, 0.75].forEach((d, i) => { const r = pos(tt - d * 0.35); const b = tela(c, r.x, r.y); add(<Bola key={'K-r' + i} X={b.X} Y={b.Y} fant op={op * (1 - d)} r={18} />); });
      const s = c.s * K * 0.6;
      const pul = 1 + 0.15 * Math.sin(clamp01((f - P(307)) / 16) * Math.PI);
      add(<Seta key="K-vx" x1={a.X} y1={a.Y} x2={a.X + v.x * s} y2={a.Y} cor={C.horiz} w={7 * pul} op={op} cabeca={26} />);
      add(<Seta key="K-vy" x1={a.X} y1={a.Y} x2={a.X} y2={a.Y - v.y * s} cor={C.vert} w={7} op={op} cabeca={26} />);
      add(<Bola key="K-bola" X={a.X} Y={a.Y} op={op} r={18} />);
      lab(<Rotulo key="K-l" X={a.X + v.x * s + 24} Y={a.Y} tex={'v = v_{0x} = 12\\ \\text{m/s}'} size={40} cor={C.horiz} ancora="e" op={op * prog(f, P(318), 12, produtiva)} />);
      lab(<Rotulo key="K-nao" X={W / 2} Y={170} txt="ela não para" size={52} peso={700} op={op * janela(f, P(299), P(305), 10, 10)} />);
    }
  }

  // ===== L. pergunta 2: altura máxima ===========================================
  {
    const ini = P(321, 4), fim = P(361, 10);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 12, 12);
      add(<path key="L-traj" d={caminho(c, 0, T)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.9} />);
      const base = tela(c, pos(TS).x, 0), top = tela(c, pos(TS).x, H);
      add(<Bola key="L-b" X={top.X} Y={top.Y} op={op} />);
      const h = prog(f, P(324), 22, expressiva);
      add(<line key="L-h" x1={base.X} y1={base.Y} x2={base.X} y2={lerp(base.Y, top.Y + 16, h)} stroke={C.vert} strokeWidth={4} opacity={op} />);
      [base.Y, top.Y].forEach((y, i) => add(<line key={'L-t' + i} x1={base.X - 14} y1={y} x2={base.X + 14} y2={y} stroke={C.vert} strokeWidth={4} opacity={op * h} />));
      lab(<Rotulo key="L-H" X={base.X + 28} Y={(base.Y + top.Y) / 2} tex={'H'} size={50} cor={C.vert} ancora="e" op={op * h} />);
      lab(<Rotulo key="L-Hv" X={base.X + 28} Y={(base.Y + top.Y) / 2 + 56} tex={'= 12{,}8\\ \\text{m}'} size={36} cor={C.vert} ancora="e" op={op * prog(f, PAUSA(360).de + 4, 14, produtiva)} />);
      lab(<Rotulo key="L-z" X={top.X} Y={top.Y - 46} tex={'v_y = 0'} size={30} cor={C.vert} op={op * janela(f, P(330), P(342), 10, 10)} />);
    }
  }

  // ===== M. pergunta 3: alcance (com a fórmula-herói no meio) =====================
  {
    const ini = P(361, 4), fim = P(424, 8);
    if (f >= ini && f < fim + 12) {
      const heroi = janela(f, P(405), PAUSA(409).ate + 6, 16, 16);
      const op = janela(f, ini, fim + 12, 12, 12) * (1 - heroi * 0.85);
      add(<path key="M-traj" d={caminho(c, 0, T)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.9} />);
      const l = tela(c, A, 0);
      add(<Bola key="M-b" X={l.X} Y={l.Y - 15} op={op} />);
      add(<Seta key="M-a" x1={O.X} y1={O.Y + 40} x2={l.X} y2={l.Y + 40} cor={C.horiz} w={5} cresce={approach(f, P(367), 0.12)} op={op} cabeca={18} />);
      lab(<Rotulo key="M-A" X={(O.X + l.X) / 2} Y={O.Y + 82} tex={'A'} size={50} cor={C.horiz} op={op * prog(f, P(367), 12, produtiva)} />);
      lab(<Rotulo key="M-Av" X={(O.X + l.X) / 2 + 38} Y={O.Y + 82} tex={'= 38{,}4\\ \\text{m}'} size={36} cor={C.horiz} ancora="e" op={op * prog(f, P(423), 14, produtiva)} />);
    }
  }

  // ===== N. segredo 1: 45° (gráfico de sen 2θ + leque de trajetórias) ============
  {
    const ini = P(424, 6), fim = P(463, 10);
    if (f >= ini && f < fim + 14) {
      const op = janela(f, ini, fim + 14, 12, 14);
      const pa = PAUSA(462);
      // ângulo da varredura (graus)
      const thAt = (q: number) => {
        if (q < P(451)) return (TH * 180) / Math.PI;
        if (q < pa.de) return lerp((TH * 180) / Math.PI, 45, prog(q, P(451), 26, expressiva));
        const r = (q - pa.de) / (pa.ate - pa.de);
        if (r < 0.62) return lerp(45, 15, expressiva(clamp01(r / 0.18))) + lerp(0, 60, expressiva(clamp01((r - 0.18) / 0.44)));
        return lerp(75, 45, expressiva(clamp01((r - 0.62) / 0.3)));
      };
      const th = thAt(f), thr = (th * Math.PI) / 180;
      // leque: rastros a cada 5° que a varredura já visitou
      if (f > pa.de) {
        for (let g = 15; g <= 75; g += 5) {
          let vis = 0;
          for (let q = pa.de; q <= f; q += 3) if (Math.abs(thAt(q) - g) < 1.2) { vis = 1; break; }
          if (vis) add(<path key={'N-l' + g} d={caminho(c, 0, voo(V0, (g * Math.PI) / 180), V0, (g * Math.PI) / 180, 60)} stroke={g === 45 ? C.tinta : C.cinza} strokeWidth={g === 45 ? 3 : 2} fill="none" opacity={op * (g === 45 ? 0.6 : 0.35)} />);
        }
      }
      add(<path key="N-traj" d={caminho(c, 0, voo(V0, thr), V0, thr)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * 0.95} />);
      const l = tela(c, alcance(V0, thr), 0);
      add(<Bola key="N-b" X={l.X} Y={l.Y - 15} op={op} />);
      const vt = tela(c, V0 * K * Math.cos(thr), V0 * K * Math.sin(thr));
      add(<Seta key="N-v" x1={O.X} y1={O.Y} x2={vt.X} y2={vt.Y} cor={C.tinta} w={5} op={op} cabeca={18} />);
      add(<Arco key="N-arc" X={O.X} Y={O.Y} r={60} a0={0} a1={th} op={op} />);
      add(<Seta key="N-a" x1={O.X} y1={O.Y + 40} x2={l.X} y2={l.Y + 40} cor={C.horiz} w={4} op={op} cabeca={16} />);
      // marca de 40 m (o máximo)
      const m40 = tela(c, 40, 0);
      add(<line key="N-40" x1={m40.X} y1={m40.Y - 300} x2={m40.X} y2={m40.Y + 20} stroke={C.tinta} strokeWidth={2} strokeDasharray="6 8" opacity={op * prog(f, P(455), 14)} />);
      lab(<Rotulo key="N-40l" X={m40.X - 12} Y={m40.Y - 300} ancora="d" tex={'40\\ \\text{m}'} size={30} op={op * prog(f, P(455), 14)} />);
      // leitura ao vivo
      lab(<div key="N-read" style={{position: 'absolute', left: 120, top: 120, fontFamily: INTER, fontWeight: 600, fontSize: 44, color: C.tinta, opacity: op, fontVariantNumeric: 'tabular-nums', lineHeight: 1.25}}>
        <div>θ = {Math.round(th)}°</div><div style={{color: C.horiz}}>A = {fmt(alcance(V0, thr))} m</div></div>);
      // gráfico de sen 2θ à direita
      const gx = 1250, gy = 760, gw = 540, gh = 400;
      const gp = (a: number, v: number) => ({X: gx + (a / 90) * gw, Y: gy - v * gh});
      const des = prog(f, P(433), 30, expressiva);
      let d = '';
      for (let a = 0; a <= 90 * des; a += 1) { const p = gp(a, Math.sin((2 * a * Math.PI) / 180)); d += (a ? ' L ' : 'M ') + p.X + ' ' + p.Y; }
      add(<g key="N-graf" opacity={op}>
        <line x1={gx} y1={gy} x2={gx + gw + 30} y2={gy} stroke={C.tinta} strokeWidth={2.5} />
        <line x1={gx} y1={gy} x2={gx} y2={gy - gh - 40} stroke={C.tinta} strokeWidth={2.5} />
        <path d={d} stroke={C.tinta} strokeWidth={4} fill="none" />
        <line x1={gx} y1={gy - gh} x2={gp(45, 1).X} y2={gy - gh} stroke={C.cinza} strokeWidth={2} strokeDasharray="6 8" opacity={prog(f, P(441), 12)} />
        <line x1={gp(45, 0).X} y1={gy} x2={gp(45, 1).X} y2={gy - gh} stroke={C.cinza} strokeWidth={2} strokeDasharray="6 8" opacity={prog(f, P(451), 12)} />
      </g>);
      const gpt = gp(th, Math.sin(2 * thr));
      add(<circle key="N-dot" cx={gpt.X} cy={gpt.Y} r={11} fill={C.horiz} opacity={op * prog(f, P(436), 10)} />);
      lab(<Rotulo key="N-gy" X={gx - 18} Y={gy - gh - 60} tex={'\\sin 2\\theta'} size={38} ancora="e" op={op * des} />);
      lab(<Rotulo key="N-g1" X={gx - 16} Y={gy - gh} tex={'1'} size={32} ancora="d" op={op * prog(f, P(441), 12)} />);
      lab(<Rotulo key="N-gx" X={gx + gw + 40} Y={gy + 36} tex={'\\theta'} size={38} op={op * des} />);
      [0, 45, 90].forEach((a) => lab(<Rotulo key={'N-t' + a} X={gp(a, 0).X} Y={gy + 34} tex={a + '^\\circ'} size={28} cor={a === 45 ? C.tinta : C.cinza} op={op * (a === 45 ? prog(f, P(451), 12) : des)} />));
      lab(<Rotulo key="N-90" X={gp(45, 1).X} Y={gy - gh - 40} tex={'2\\theta = 90^\\circ'} size={34} op={op * janela(f, P(446), P(455) + 30, 12, 10)} />);
    }
  }

  // ===== O. segredo 2: 30° e 60° caem no mesmo lugar ============================
  {
    const ini = P(463, 8), fim = P(496, 10);
    if (f >= ini && f < fim + 14) {
      const op = janela(f, ini, fim + 14, 12, 14);
      const lanc = P(477) + 2;
      const ang = [30, 60];
      const Rr = alcance(V0, Math.PI / 6);
      const lx = tela(c, Rr, 0);
      const marca = prog(f, P(474), 16, produtiva);
      add(<g key="O-x" opacity={op * marca}>
        <line x1={lx.X - 18} y1={lx.Y - 18} x2={lx.X + 18} y2={lx.Y + 18} stroke={C.horiz} strokeWidth={5} strokeLinecap="round" />
        <line x1={lx.X - 18} y1={lx.Y + 18} x2={lx.X + 18} y2={lx.Y - 18} stroke={C.horiz} strokeWidth={5} strokeLinecap="round" />
      </g>);
      lab(<Rotulo key="O-xl" X={lx.X} Y={lx.Y + 54} tex={'34{,}6\\ \\text{m}'} size={32} cor={C.horiz} op={op * prog(f, P(491), 14, produtiva)} />);
      ang.forEach((g, i) => {
        const thr = (g * Math.PI) / 180;
        const Tv = voo(V0, thr);
        const tb = Math.min(Tv, Math.max(0, ((f - lanc) / 30) * 0.75));
        const cor = i === 0 ? C.tinta : C.cinza;
        const vt = tela(c, V0 * K * Math.cos(thr), V0 * K * Math.sin(thr));
        add(<Seta key={'O-v' + g} x1={O.X} y1={O.Y} x2={vt.X} y2={vt.Y} cor={cor} w={5} cresce={approach(f, P(468 + i * 2), 0.15)} op={op * (1 - prog(f, lanc, 12))} cabeca={18} />);
        lab(<Rotulo key={'O-l' + g} X={vt.X + (i === 0 ? 50 : 10)} Y={vt.Y - 28} tex={g + '^\\circ'} size={38} cor={cor} op={op * prog(f, P(468 + i * 2), 12, produtiva)} />);
        if (f >= lanc) {
          add(<path key={'O-p' + g} d={caminho(c, 0, tb, V0, thr)} stroke={cor} strokeWidth={3.5} fill="none" opacity={op} />);
          for (let t = 0; t <= tb + 1e-6; t += 0.2) { const q = pos(t, V0, thr); const a = tela(c, q.x, q.y); add(<Bola key={'O-f' + g + t.toFixed(1)} X={a.X} Y={a.Y} fant op={op} cor={cor} />); }
          const q = pos(tb, V0, thr), a = tela(c, q.x, q.y);
          add(<Bola key={'O-b' + g} X={a.X} Y={a.Y} op={op} cor={cor} />);
          // pouso: anel que abre
          const fp = lanc + (Tv / 0.75) * 30;
          const an = clamp01((f - fp) / 16);
          if (an > 0 && an < 1) add(<circle key={'O-r' + g} cx={lx.X} cy={lx.Y} r={14 + an * 50} fill="none" stroke={C.horiz} strokeWidth={3} opacity={op * (1 - an)} />);
        }
      });
      const t30 = prog(f, P(481) - 6, 12, produtiva), t60 = prog(f, P(487) - 4, 12, produtiva);
      lab(<Rotulo key="O-t30" X={tela(c, 10, 0).X} Y={tela(c, 0, 7.5).Y} tex={'2{,}0\\ \\text{s}'} size={32} op={op * t30} />);
      lab(<Rotulo key="O-t60" X={tela(c, 13.5, 0).X} Y={tela(c, 0, 17).Y} tex={'3{,}5\\ \\text{s}'} size={32} cor={C.cinza} op={op * t60} />);
    }
  }

  // ===== P. resumo: trajetória pequena com as três respostas ======================
  {
    const ini = P(496, 2), fim = P(521, 10);
    if (f >= ini && f < fim + 12) {
      const op = janela(f, ini, fim + 12, 12, 12);
      add(<path key="P-traj" d={caminho(c, 0, T)} stroke={C.tinta} strokeWidth={4} fill="none" opacity={op * prog(f, P(519), 20) * 0.9 + op * 0.35} />);
      const vt = tela(c, V0 * K * COS, V0 * K * SEN), xt = tela(c, VX * K, 0), yt = tela(c, 0, VY * K);
      const q = prog(f, P(497), 14, produtiva);
      add(<Seta key="P-v0" x1={O.X} y1={O.Y} x2={vt.X} y2={vt.Y} cor={C.tinta} w={5} op={op * q} cabeca={18} />);
      add(<Seta key="P-vx" x1={O.X} y1={O.Y} x2={xt.X} y2={xt.Y} cor={C.horiz} w={5} cresce={approach(f, P(503), 0.15)} op={op} cabeca={18} />);
      add(<Seta key="P-vy" x1={O.X} y1={O.Y} x2={yt.X} y2={yt.Y} cor={C.vert} w={5} cresce={approach(f, P(507), 0.15)} op={op} cabeca={18} />);
      const top = tela(c, pos(TS).x, H), base = tela(c, pos(TS).x, 0), l = tela(c, A, 0);
      add(<line key="P-h" x1={base.X} y1={base.Y} x2={top.X} y2={top.Y} stroke={C.vert} strokeWidth={3} strokeDasharray="7 7" opacity={op * prog(f, P(513), 12)} />);
      add(<Seta key="P-a" x1={O.X} y1={O.Y + 34} x2={l.X} y2={l.Y + 34} cor={C.horiz} w={4} cresce={approach(f, P(516), 0.14)} op={op} cabeca={15} />);
      add(<Bola key="P-b" X={top.X} Y={top.Y} op={op * prog(f, P(510), 12)} />);
    }
  }

  return (
    <>
      <svg width={W} height={HH} style={{position: 'absolute', inset: 0}}>{svg}</svg>
      {html}
    </>
  );
};
