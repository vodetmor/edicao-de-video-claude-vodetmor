// Lousa 2D (escura): o prisma visto de cima vira o esquema de interface ar/água, e volta a ser prisma no fim.
// Tudo preso às palavras da locução (P = início da palavra i). Câmera 2D com zoom e rotação.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, HALO, INTER} from './estilo';
import {Tex} from './Tex';
import {CAMINHOS, DIR_IN, ENTRA, FONTE, LIM, N_AGUA, N_E, NL, TELA_C, TELA_N, TH1, TH2, VERT, cauchy, corTela, deg, fmt, fresnelR, snell} from './otica';
import {S_TOPO, GANCHO_FIM, FIBRA_INI, FIBRA_FIM, FINAL_INI} from './Cena3D';
import {camera as curvaCam, clamp01, entrada, expressiva, janela, lerp, P, PAUSA, prog, produtiva} from './tempo';

type V2 = [number, number];
type Cam2 = {u: number; v: number; X: number; Y: number; s: number; rot: number};
const ROT_FACE = -60 * deg; // gira o mundo até a face de entrada ficar horizontal (ar em cima)
const EST: Record<string, Cam2> = {
  prisma: {u: 0.55, v: -0.4, X: 960, Y: 540, s: S_TOPO, rot: 0},
  interface: {u: ENTRA[0], v: ENTRA[1], X: 560, Y: 440, s: 900, rot: ROT_FACE},
  prisma5: {u: 0.55, v: -0.4, X: 700, Y: 470, s: 300, rot: 0},
};
const TRILHA: [number, string, number][] = [
  [0, 'prisma', 1],
  [P(30) + 6, 'interface', 70],
  [FIBRA_FIM - 8, 'prisma5', 1],
];
const camAt = (f: number): Cam2 => {
  let c = EST[TRILHA[0][1]];
  for (const [q, nome, dur] of TRILHA) {
    const a = EST[nome];
    if (f < q - dur) break;
    const t = curvaCam(clamp01((f - (q - dur)) / dur));
    c = {u: lerp(c.u, a.u, t), v: lerp(c.v, a.v, t), X: lerp(c.X, a.X, t), Y: lerp(c.Y, a.Y, t), s: Math.exp(lerp(Math.log(c.s), Math.log(a.s), t)), rot: lerp(c.rot, a.rot, t)};
  }
  return c;
};
const tela = (c: Cam2, p: V2) => {
  const dx = p[0] - c.u, dy = p[1] - c.v;
  const cr = Math.cos(c.rot), sr = Math.sin(c.rot);
  const x = dx * cr - dy * sr, y = dx * sr + dy * cr;
  return {X: c.X + x * c.s, Y: c.Y - y * c.s};
};
// coordenadas locais da interface: x ao longo da superfície, y para o lado do ar
const T_FACE: V2 = [Math.cos(60 * deg), Math.sin(60 * deg)];
const loc = (x: number, y: number): V2 => [ENTRA[0] + x * T_FACE[0] + y * N_E[0], ENTRA[1] + x * T_FACE[1] + y * N_E[1]];

// ---------------------------------------------------------------- primitivas de desenho
const Raio: React.FC<{a: {X: number; Y: number}; b: {X: number; Y: number}; cor?: string; op?: number; w?: number; cresce?: number; seta?: number; brilho?: number}> = ({a, b, cor = C.raio, op = 1, w = 3.5, cresce = 1, seta = 0, brilho = 1}) => {
  if (op <= 0.001 || cresce <= 0.001) return null;
  const bx = lerp(a.X, b.X, cresce), by = lerp(a.Y, b.Y, cresce);
  const ang = Math.atan2(by - a.Y, bx - a.X);
  const mx = lerp(a.X, bx, 0.55), my = lerp(a.Y, by, 0.55), h = 16;
  return (
    <g opacity={op}>
      <line x1={a.X} y1={a.Y} x2={bx} y2={by} stroke={cor} strokeWidth={w * 4} strokeLinecap="round" opacity={0.35 * brilho} filter="url(#brilho)" />
      <line x1={a.X} y1={a.Y} x2={bx} y2={by} stroke={cor} strokeWidth={w} strokeLinecap="round" />
      {seta > 0.01 && cresce > 0.6 && (
        <path d={`M ${mx + Math.cos(ang) * h} ${my + Math.sin(ang) * h} L ${mx + Math.cos(ang + 2.6) * h} ${my + Math.sin(ang + 2.6) * h} L ${mx + Math.cos(ang - 2.6) * h} ${my + Math.sin(ang - 2.6) * h} Z`} fill={cor} opacity={seta} />
      )}
    </g>
  );
};
// arco de ângulo na tela: ângulos em graus de tela (0 = direita, sentido anti-horário visual)
const Arco: React.FC<{O: {X: number; Y: number}; r: number; a0: number; a1: number; cor: string; op?: number; w?: number; tracejado?: boolean}> = ({O, r, a0, a1, cor, op = 1, w = 4, tracejado}) => {
  if (op <= 0.001 || Math.abs(a1 - a0) < 0.2) return null;
  const p = (a: number) => [O.X + r * Math.cos(a * deg), O.Y - r * Math.sin(a * deg)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const grande = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 0 : 1;
  return <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${grande} ${sweep} ${x1} ${y1}`} fill="none" stroke={cor} strokeWidth={w} opacity={op} strokeLinecap="round" strokeDasharray={tracejado ? '8 8' : undefined} />;
};
// rótulo HTML com halo da cor do fundo (nunca cortado por linha)
const Rot: React.FC<{X: number; Y: number; tex?: string; txt?: string; size?: number; cor?: string; op?: number; peso?: number; ancora?: 'c' | 'e' | 'd'; dy?: number}> = ({X, Y, tex, txt, size = 40, cor = C.tinta, op = 1, peso = 600, ancora = 'c', dy = 0}) => {
  if (op <= 0.001) return null;
  const tx = ancora === 'c' ? '-50%' : ancora === 'e' ? '0%' : '-100%';
  return (
    <div style={{position: 'absolute', left: X, top: Y, transform: `translate(${tx}, -50%) translateY(${dy}px)`, opacity: op, color: cor, fontFamily: INTER, fontWeight: peso, fontSize: size, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: HALO}}>
      {tex ? <Tex t={tex} size={size} color={cor} /> : txt}
    </div>
  );
};
// etiqueta "CAI NA PROVA", "PEGADINHA", "SEGREDO": cápsula cheia (texto nunca sobre linha)
const Selo: React.FC<{f: number; ini: number; fim: number; txt: string; cor: string; X: number; Y: number}> = ({f, ini, fim, txt, cor, X, Y}) => {
  const op = janela(f, ini, fim, 8, 8);
  if (op <= 0.001) return null;
  const e = prog(f, ini, 14, expressiva);
  return (
    <div style={{position: 'absolute', left: X, top: Y, opacity: op, transform: `scale(${0.85 + 0.15 * e})`, transformOrigin: 'left center', background: cor, color: '#0B0B0D', fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: '0.06em', padding: '10px 20px 9px', borderRadius: 14}}>{txt}</div>
  );
};

// ---------------------------------------------------------------- estado físico da interface ao longo do tempo
// meio de cima: ar (n = 1). Meio de baixo: vidro flint (no gancho) que vira água.
const N_FLINT = cauchy(0.55);
const INC0 = Math.acos(-(DIR_IN[0] * N_E[0] + DIR_IN[1] * N_E[1])); // incidência do gancho (≈ 60°)
const fisica = (f: number) => {
  const m = prog(f, P(36) - 30, 40, expressiva); // vidro → água, ângulo do gancho → 53°
  const n2 = lerp(N_FLINT, N_AGUA, m);
  const th1 = lerp(INC0, TH1, m);
  // ato 4: a luz faz o caminho contrário; o ângulo na água varre até o limite e passa dele
  const inv = f >= P(156);
  const v1 = prog(f, P(168), P(172) + 14 - P(168), expressiva);
  const v2 = prog(f, P(199) + 6, P(206) - P(199), expressiva);
  const phi = TH2 + (LIM - TH2) * v1 + (62 * deg - LIM) * v2; // ângulo na água (ato 4)
  return {n2, th1, inv, phi, m};
};

const Interface: React.FC<{f: number; c: Cam2; op: number}> = ({f, c, op}) => {
  if (op <= 0.001) return null;
  const {n2, th1, inv, phi} = fisica(f);
  const O = tela(c, loc(0, 0));
  const Lr = 0.42;
  const pt = (x: number, y: number) => tela(c, loc(x, y));
  // superfície e meio de baixo (até a borda; a máscara apaga antes da faixa da legenda)
  const s1 = pt(-3, 0), s2 = pt(3, 0), s3 = pt(3, -3), s4 = pt(-3, -3);
  const elems: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  elems.push(<path key="agua" d={`M ${s1.X} ${s1.Y} L ${s2.X} ${s2.Y} L ${s3.X} ${s3.Y} L ${s4.X} ${s4.Y} Z`} fill={C.agua} />);
  elems.push(<line key="sup" x1={s1.X} y1={s1.Y} x2={s2.X} y2={s2.Y} stroke={C.borda} strokeWidth={2.5} />);
  // ondas (frentes de onda) no ato 2: espaçamento menor na água = luz mais lenta
  const ondas = janela(f, P(36) - 10, P(66), 14, 16);
  // ângulos de tela da normal: para cima = 90°, para baixo = 270°
  let ang1: number, ang2: number | null;
  let thA: number, thB: number | null; // ângulo no ar e na água (rad)
  if (!inv) {
    thA = th1; thB = snell(1, n2, th1);
  } else {
    thB = phi; thA = snell(N_AGUA, 1, phi) as number | null as number;
  }
  const ar = (th: number) => pt(-Math.sin(th) * Lr, Math.cos(th) * Lr);            // raio no ar (lado esquerdo)
  const ag = (th: number) => pt(Math.sin(th) * Lr * 1.05, -Math.cos(th) * Lr * 1.05); // raio na água (lado direito)
  // ---------------- atos 2 e 3: luz do ar para a água
  if (!inv) {
    const A = ar(thA);
    // ato 3: o raio refratado some até a resposta (θ2 = ?), e reaparece no "trinta e sete"
    const esconde = 1 - prog(f, P(99) + 4, 10, produtiva) + prog(f, P(147) - 2, 18, expressiva);
    const cresceRef = f >= P(147) - 2 && f < P(156) ? prog(f, P(147) - 2, 18, expressiva) : 1;
    elems.push(<Raio key="inc" a={A} b={O} seta={1} />);
    if (thB !== null) elems.push(<Raio key="ref" a={O} b={ag(thB)} op={Math.min(1, esconde)} cresce={cresceRef} seta={1} />);
    // frentes de onda: tracinhos perpendiculares que andam com a luz
    if (ondas > 0.01 && thB !== null) {
      const fase = (f % 1000) / 30;
      const lam1 = 0.075, lam2 = lam1 / n2;
      const d1: V2 = [Math.sin(thA), -Math.cos(thA)], d2: V2 = [Math.sin(thB), -Math.cos(thB)];
      for (let k = 0; k < 7; k++) {
        const s = ((k * lam1 + fase * 0.06) % (lam1 * 7)) - lam1 * 7; // de -Lr até 0 no ar
        const px = s * d1[0], py = s * d1[1];
        const a = pt(px - d1[1] * 0.075, py + d1[0] * 0.075), b = pt(px + d1[1] * 0.075, py - d1[0] * 0.075);
        const bordo = Math.min(1, -s / 0.08);
        elems.push(<line key={'o1' + k} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={C.tinta} strokeWidth={2} strokeLinecap="round" opacity={ondas * 0.45 * bordo} />);
      }
      for (let k = 0; k < 8; k++) {
        const s = (k * lam2 + fase * 0.06 / n2) % (lam2 * 8);
        const px = s * d2[0], py = s * d2[1];
        const a = pt(px - d2[1] * 0.075, py + d2[0] * 0.075), b = pt(px + d2[1] * 0.075, py - d2[0] * 0.075);
        const bordo = Math.min(1, s / 0.05) * Math.min(1, (Lr * 1.05 - s) / 0.08);
        elems.push(<line key={'o2' + k} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={C.th2} strokeWidth={2} strokeLinecap="round" opacity={ondas * 0.55 * bordo} />);
      }
    }
    // "esse freio entorta o caminho": continuação tracejada do raio (sem refração)
    const cont = janela(f, P(54), P(66), 12, 12) + janela(f, P(151), P(156) + 10, 12, 12);
    if (cont > 0.01) { const e = pt(Math.sin(thA) * Lr, -Math.cos(thA) * Lr); elems.push(<line key="cont" x1={O.X} y1={O.Y} x2={e.X} y2={e.Y} stroke={C.cinza} strokeWidth={2.5} strokeDasharray="8 9" opacity={Math.min(1, cont)} />); }
  } else {
    // ---------------- ato 4: da água para o ar (caminho contrário), varredura até o limite e além
    const B = ag(thB!);
    elems.push(<Raio key="inc4" a={B} b={O} seta={1} />);
    const R = fresnelR(N_AGUA, 1, thB!);
    if (thA !== null) elems.push(<Raio key="saida" a={O} b={ar(thA)} op={Math.min(1, 1.2 - R)} seta={1} />);
    // reflexão parcial (Fresnel de verdade) que vira reflexão total
    const refl = pt(-Math.sin(thB!) * Lr * 1.05, -Math.cos(thB!) * Lr * 1.05);
    elems.push(<Raio key="refl" a={O} b={refl} op={Math.max(0.12, R)} seta={R > 0.5 ? 1 : 0} brilho={R} />);
  }
  // normal
  const nor = Math.max(prog(f, P(69) - 4, 14, entrada), f >= P(99) ? 1 : 0);
  const realce = janela(f, P(95), P(96) + 6, 4, 10);
  if (nor > 0.01) {
    const a = pt(0, 0.36 * nor), b = pt(0, -0.36 * nor);
    elems.push(<line key="nor" x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} stroke={realce > 0.05 ? C.tinta : C.cinza} strokeWidth={2.5 + realce * 2} strokeDasharray="10 10" />);
    html.push(<Rot key="nort" X={a.X} Y={a.Y - 26} txt="normal" size={30} peso={500} cor={C.cinza} op={nor * (1 - prog(f, P(99), 10, produtiva) + (f > P(151) && f < P(156) + 20 ? 1 : 0))} />);
  }
  // arcos θ1 / θ2 a partir da normal
  const telaAng = (p: {X: number; Y: number}) => ((Math.atan2(-(p.Y - O.Y), p.X - O.X) / deg) % 360 + 360) % 360;
  const arA = thA !== null ? ar(thA) : null, arB = thB !== null ? ag(thB) : null;
  const a1op = Math.max(prog(f, P(79) - 2, 12, entrada), f >= P(99) ? 1 : 0) * (inv ? prog(f, P(163), 12, entrada) : 1);
  const a2op = !inv ? (f < P(99) ? prog(f, P(87) - 2, 12, entrada) : f >= P(147) ? prog(f, P(147) + 6, 12, entrada) : 0) : 1;
  const nUp = telaAng(pt(0, 1)), nDn = telaAng(pt(0, -1));
  if (arA && a1op > 0.01) {
    const ang = telaAng(arA);
    elems.push(<Arco key="a1" O={O} r={inv ? 120 : 110} a0={nUp} a1={ang} cor={C.th1} op={a1op} />);
    const mid = ((nUp + ang) / 2) * deg;
    const lab = inv ? (f >= P(163) ? `${Math.round((thA as number) / deg)}^\\circ` : '\\theta_1') : f >= P(113) ? '53^\\circ' : '\\theta_1';
    html.push(<Rot key="a1t" X={O.X + 160 * Math.cos(mid)} Y={O.Y - 160 * Math.sin(mid)} tex={lab} size={40} cor={C.th1} op={a1op} />);
  }
  if (arB && a2op > 0.01) {
    const ang = telaAng(arB);
    const limite = inv && Math.abs(thB! - LIM) < 0.6 * deg && f > P(170);
    const cor = inv && f >= P(173) && f < P(199) + 10 ? C.lim : C.th2;
    elems.push(<Arco key="a2" O={O} r={100} a0={nDn} a1={ang} cor={cor} op={a2op} />);
    const mid = ((nDn + ang) / 2) * deg;
    let lab = f < P(99) ? '\\theta_2' : !inv ? '37^\\circ' : `${Math.round(thB! / deg)}^\\circ`;
    if (inv && f >= P(173) && f < P(199)) lab = f >= P(193) ? 'L \\approx 49^\\circ' : 'L';
    const longe = lab.includes('approx');
    html.push(<Rot key="a2t" X={longe ? O.X : O.X + 150 * Math.cos(mid)} Y={longe ? O.Y + 375 : O.Y - 150 * Math.sin(mid)} tex={lab} size={40} cor={cor} op={a2op} />);
    void limite;
  }
  // "?" do ato 3 enquanto θ2 não sai
  const q = janela(f, P(108), P(147), 10, 6);
  if (q > 0.01) { const p = ag(TH2); html.push(<Rot key="q" X={p.X - 40} Y={p.Y - 120} txt="?" size={110} peso={700} cor={C.th2} op={q} />); }
  // rótulos dos meios
  const mOp = prog(f, P(30) - 4, 14, entrada);
  const nVis = f >= P(105);
  html.push(<Rot key="mAr" X={640} Y={110} txt="ar" size={44} peso={600} ancora="e" op={mOp} />);
  if (nVis) html.push(<Rot key="nAr" X={712} Y={110} tex="n = 1" size={40} cor={C.cinza} ancora="e" op={prog(f, P(105), 12, entrada)} />);
  html.push(<Rot key="mAg" X={140} Y={720} txt="água" size={44} peso={600} ancora="e" op={mOp * prog(f, P(44) - 6, 14, entrada)} />);
  if (f >= P(109)) html.push(<Rot key="nAg" X={265} Y={722} tex={'n = \\tfrac{4}{3}'} size={40} cor={C.cinza} ancora="e" op={prog(f, P(109), 12, entrada)} />);
  // velocidades (ato 2)
  html.push(<Rot key="v1" X={140} Y={390} txt="300 000 km/s" size={36} peso={600} op={janela(f, P(38) - 2, P(66), 10, 12)} />);
  html.push(<Rot key="v2" X={360} Y={600} txt="225 000 km/s" size={36} peso={600} cor={C.th2} op={janela(f, P(46) - 2, P(66), 10, 12)} />);
  // pegadinha: ângulo medido da superfície (errado)
  const err = janela(f, P(97), P(99) + 6, 8, 10);
  if (err > 0.01 && arA) {
    const ang = telaAng(arA); const sup = telaAng(pt(-1, 0));
    elems.push(<Arco key="err" O={O} r={190} a0={ang} a1={sup} cor={C.lim} op={err} tracejado />);
    const mid = ((ang + sup) / 2) * deg;
    html.push(<Rot key="errx" X={O.X + 240 * Math.cos(mid)} Y={O.Y - 240 * Math.sin(mid)} txt="✕" size={52} peso={700} cor={C.lim} op={err} />);
  }
  // ato 4: "reflexão total"
  html.push(<Rot key="rt" X={720} Y={760} txt="reflexão total" size={38} peso={600} op={janela(f, P(205), P(222), 12, 10)} />);
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: op}}>
        <defs>
          <linearGradient id="someLeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0.74" stopColor="#fff" /><stop offset="0.8" stopColor="#000" /></linearGradient>
          <linearGradient id="someDir" x1="0" y1="0" x2="1" y2="0"><stop offset="0.45" stopColor="#fff" /><stop offset="0.52" stopColor="#000" /></linearGradient>
          <mask id="mDir"><rect width={1920} height={1080} fill="url(#someDir)" /></mask>
          <mask id="mLeg"><rect width={1920} height={1080} fill="url(#someLeg)" /></mask>
          <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        <g mask="url(#mLeg)"><g mask={f >= P(30) ? "url(#mDir)" : undefined}>{elems}</g></g>
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>{html}</div>
    </>
  );
};

// ---------------------------------------------------------------- prisma visto de cima (gancho, ato 5)
const corRGB = (i: number) => corTela(i);
const PrismaTopo: React.FC<{f: number; c: Cam2; op: number; ato5: boolean}> = ({f, c, op, ato5}) => {
  if (op <= 0.001) return null;
  const tri = VERT.map((p) => tela(c, p));
  const E = tela(c, ENTRA), F = tela(c, FONTE);
  const els: React.ReactNode[] = [];
  const html: React.ReactNode[] = [];
  els.push(<path key="tri" d={`M ${tri.map((p) => `${p.X} ${p.Y}`).join(' L ')} Z`} fill={C.vidro} stroke={C.borda} strokeWidth={2.5} strokeLinejoin="round" />);
  const tg: V2 = [-TELA_N[1], TELA_N[0]];
  const t1 = tela(c, [TELA_C[0] + tg[0] * 0.42, TELA_C[1] + tg[1] * 0.42]), t2 = tela(c, [TELA_C[0] - tg[0] * 0.42, TELA_C[1] - tg[1] * 0.42]);
  els.push(<line key="tela" x1={t1.X} y1={t1.Y} x2={t2.X} y2={t2.Y} stroke="#5A5A60" strokeWidth={7} strokeLinecap="round" />);
  // luz branca até o vidro
  const entra = ato5 ? prog(f, FIBRA_FIM - 4, 16, entrada) : 1;
  els.push(<Raio key="in" a={F} b={E} cresce={entra} w={4} />);
  // quais cores aparecem
  let mostra = (i: number) => 1;
  if (ato5) {
    const verm = prog(f, P(244) - 2, 18, expressiva), viol = prog(f, P(252) - 2, 18, expressiva), todas = prog(f, P(267), 26, expressiva);
    mostra = (i: number) => (i === NL - 1 ? Math.max(verm, todas) : i === 0 ? Math.max(viol, todas) : todas);
  }
  CAMINHOS.forEach((cm, i) => {
    const k = mostra(i);
    if (k <= 0.001) return;
    const S = tela(c, cm.S), T = tela(c, cm.T);
    const cor = corRGB(i);
    const so = ato5 && (i === 0 || i === NL - 1) && f < P(267);
    // dentro do vidro: segmento E→S; fora: S→T
    els.push(<line key={'d' + i} x1={E.X} y1={E.Y} x2={lerp(E.X, S.X, Math.min(1, k * 2))} y2={lerp(E.Y, S.Y, Math.min(1, k * 2))} stroke={cor} strokeWidth={so ? 3 : 1.6} opacity={so ? 0.95 : 0.55} />);
    if (k > 0.5) {
      const kk = (k - 0.5) * 2;
      els.push(<line key={'fb' + i} x1={S.X} y1={S.Y} x2={lerp(S.X, T.X, kk)} y2={lerp(S.Y, T.Y, kk)} stroke={cor} strokeWidth={so ? 16 : 12} opacity={so ? 0.45 : 0.32} filter="url(#brilho2)" />);
      els.push(<line key={'f' + i} x1={S.X} y1={S.Y} x2={lerp(S.X, T.X, kk)} y2={lerp(S.Y, T.Y, kk)} stroke={cor} strokeWidth={so ? 4 : 4.5} opacity={0.95} />);
    }
  });
  if (ato5) {
    // "violeta desvia mais": arco entre a direção vermelha e a violeta, na saída
    const dm = janela(f, P(263) - 2, P(271), 10, 10);
    if (dm > 0.01) {
      const r = CAMINHOS[NL - 1], v = CAMINHOS[0];
      const S = tela(c, r.S);
      const ang = (d: V2) => Math.atan2(d[1], d[0]) / deg;
      const raio = 330;
      const a0 = ang(r.d2), a1 = ang(v.d2);
      els.push(<Arco key="dv" O={S} r={raio} a0={a0} a1={a1} cor={C.tinta} op={dm} w={3} />);
      if (0) html.push(<Rot key="dvt" X={S.X + (raio + 30) * Math.cos(((a0 + a1) / 2) * deg) + 16} Y={S.Y - (raio + 30) * Math.sin(((a0 + a1) / 2) * deg) + 30} txt="violeta desvia mais" size={32} peso={600} ancora="e" op={dm} />);
    }
    html.push(<Rot key="vr" X={tela(c, CAMINHOS[NL - 1].T).X + 26} Y={tela(c, CAMINHOS[NL - 1].T).Y - 26} txt="vermelho" size={30} peso={600} cor={C.verm} ancora="e" op={janela(f, P(244) + 6, P(267), 10, 10)} />);
    html.push(<Rot key="vi" X={tela(c, CAMINHOS[0].T).X + 26} Y={tela(c, CAMINHOS[0].T).Y + 30} txt="violeta" size={30} peso={600} cor={C.viol} ancora="e" op={janela(f, P(252) + 6, P(267), 10, 10)} />);
  }
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: op}}>
        <defs>
          <filter id="brilho2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
          <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        {els}
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: op}}>{html}</div>
    </>
  );
};

// opacidade da lousa (troca com os planos 3D)
export const vis2D = (f: number) => {
  if (f < GANCHO_FIM - 14) return 0;
  if (f < FIBRA_INI) return prog(f, GANCHO_FIM - 14, 12, produtiva);
  if (f < FIBRA_FIM - 6) return 1 - prog(f, FIBRA_INI, 10, produtiva);
  if (f < FINAL_INI) return prog(f, FIBRA_FIM - 6, 12, produtiva);
  return 1 - prog(f, FINAL_INI, 12, produtiva);
};

export const Palco: React.FC = () => {
  const f = useCurrentFrame();
  const op = vis2D(f);
  if (op <= 0.001) return null;
  const c = camAt(f);
  // gancho → interface: o prisma e o leque somem enquanto a câmera mergulha na face de entrada
  const ato5 = f >= FIBRA_FIM - 6;
  const prismaOp = ato5 ? 1 : 1 - prog(f, P(22), 26, produtiva);
  const interfaceOp = ato5 ? 0 : prog(f, P(22) + 8, 30, produtiva);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <PrismaTopo f={f} c={c} op={prismaOp} ato5={ato5} />
      <Interface f={f} c={c} op={interfaceOp} />
    </div>
  );
};
