// Criativo 3 · "Gestor de tráfego" (vertical 1080x1920, 30 fps).
// The hook's line, where the viewers walk and fall, turns out in scene 3 to be the VSLPLAY retention graph.
// Keys: criativos/chaves.py -> src/data/keys_c3.json (the sound reads the same file).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, TEXT} from '../theme';
import {useFonts} from '../Fonts';
import {useTextures} from '../Ad';
import {Player, PlayerState} from '../Player';
import {approach, arrive, clamp, E, hash, lerp, prog, spring} from '../kit';
import {Btn, EndCard, Headline, Sting, Tag, VW} from './shared';
import keys from '../data/keys_c3.json';
import RET from '../data/retention.json';

export const K3 = keys;
export const C3_FRAMES = keys.end;
const k = K3;

// ---- 1 · hook: viewers walking on a line that breaks into a cliff ---------------------------------------
const L0 = 1110;
const L1 = 1420;
const BX = 470;
const V = 4; // px per frame
const SPAWN = 8; // frames between dots
const R = 15;
const G = 1.6; // gravity px/frame²
// time warp: the fall freezes for a beat while the ring draws
const tw = (f: number) => (f < k.freeze ? f : f < k.freeze + 9 ? k.freeze + (f - k.freeze) * 0.12 : k.freeze + 9 * 0.12 + (f - k.freeze - 9));
const depth = (t: number) => (L1 - L0) * (t < k.brk ? 0 : clamp(spring(t, k.brk, 0.5, 0.75), 0, 1.04));
const cliffY = (x: number, D: number) => {
  if (x <= BX) return L0;
  if (x >= BX + 80) return L0 + D;
  const u = (x - BX) / 80;
  return L0 + D * (u * u * (3 - 2 * u));
};
const OFF = 330; // the line is already full on frame 0

const Dots: React.FC<{f: number}> = ({f}) => {
  const t = tw(f) + OFF;
  const D = depth(tw(f));
  const out: React.ReactNode[] = [];
  const n0 = Math.floor((t - 1200 / V) / SPAWN);
  const n1 = Math.floor(t / SPAWN);
  for (let i = Math.max(0, n0); i <= n1; i++) {
    const age = t - i * SPAWN;
    const x = -20 + age * V;
    if (x > VW + 30) continue;
    const tCross = i * SPAWN + (BX + 20) / V; // moment it reaches the edge (in t)
    const brkT = k.brk + OFF;
    let y = L0 - R;
    let op = 1;
    let streak = 0;
    const doomedOnSlab = tCross < brkT && x > BX; // on the slab that drops
    const falls = hash(i, 3) < 0.45;
    if (doomedOnSlab && t >= brkT) {
      const dt = t - brkT - hash(i, 5) * 4;
      const fall = dt > 0 ? 0.5 * G * 1.4 * dt * dt : 0;
      y = L0 - R + Math.min(fall, 2000);
      streak = dt > 0 ? G * 1.4 * dt : 0;
      op = 1 - clamp((y - L1) / 300);
    } else if (x > BX && tCross >= brkT) {
      if (falls) {
        const dt = (x - BX - 20) / V;
        const fall = dt > 0 ? 0.5 * G * dt * dt : 0;
        y = L0 - R + fall;
        streak = dt > 0 ? G * dt : 0;
        op = 1 - clamp((y - L1) / 260);
      } else {
        y = cliffY(x, D) - R;
      }
    }
    if (op <= 0) continue;
    out.push(
      <g key={i} opacity={op}>
        {streak > 4 && <line x1={x} y1={y - R - Math.min(60, streak * 2.4)} x2={x} y2={y - R - 4} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.3} />}
        <circle cx={x} cy={y} r={R} fill={C.ink} />
      </g>,
    );
  }
  return <>{out}</>;
};

const Scene1: React.FC<{f: number}> = ({f}) => {
  const D = depth(tw(f));
  const path = `M -10 ${L0} L ${BX} ${L0} C ${BX + 40} ${L0} ${BX + 40} ${L0 + D} ${BX + 80} ${L0 + D} L ${VW + 10} ${L0 + D}`;
  const count = f < k.brk ? 100 : Math.round(lerp(100, 58, E.prod(prog(tw(f), k.brk + 2, k.fallEnd - k.brk))));
  const tagS = spring(f, -3, 0.5, 0.55);
  const tagOut = E.exit(prog(f, k.onde - 6, 8));
  const ringP = E.prod(prog(f, k.ring, 8));
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 280,
          background: C.ink,
          color: C.white,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontStretch: '70%',
          fontSize: 92,
          padding: '20px 34px 14px',
          borderRadius: 22,
          transform: `translateY(${-tagOut * 500}px) scale(${tagS})`,
          transformOrigin: '0 50%',
          opacity: 1 - tagOut,
        }}
      >
        GESTOR DE TRÁFEGO:
      </div>
      <Headline f={f} lines={['ONDE AS PESSOAS', 'ABANDONAM', 'SUA VSL?']} start={k.onde - 2} y={250} size={136} />
      <div style={{position: 'absolute', right: 64, top: 790, textAlign: 'right', fontFamily: TEXT}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '75%', fontSize: 200, lineHeight: 0.9, color: f < k.brk ? C.ink : C.coral, fontVariantNumeric: 'tabular-nums'}}>{count}</div>
        <div style={{fontWeight: 500, fontSize: 34, color: '#6B6B70', marginTop: 6}}>assistindo</div>
      </div>
      <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={path} stroke={C.ink} strokeWidth={6} fill="none" />
        <Dots f={f} />
        {f >= k.ring && <circle cx={BX + 10} cy={L0 + 10} r={96} fill="none" stroke={C.coral} strokeWidth={9} strokeDasharray={2 * Math.PI * 96} strokeDashoffset={2 * Math.PI * 96 * (1 - ringP)} transform={`rotate(-90 ${BX + 10} ${L0 + 10})`} />}
      </svg>
      <Tag f={f} at={k.t006} x={BX + 120} y={L0 - 200} text="00:06" bg={C.coral} size={40} />
    </AbsoluteFill>
  );
};

// ---- 2 · only the CPA: an ad dashboard with one number, then the funnel with a hole ---------------------
const brl = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',');
const Scene2: React.FC<{f: number}> = ({f}) => {
  const up = spring(f, k.s2, 0.32, 0.75);
  const toFunnel = E.cam(prog(f, k.funil - 2, 12));
  const cpa = lerp(0, 47.9, E.prod(prog(f, k.mandar, 36)));
  const metric = (v: number) => Math.round(lerp(0, v, E.prod(prog(f, k.mandar - 6, 30))));
  const rows = [
    {n: 'Cliques', v: '1.200', w: 1},
    {n: 'Página', v: '980', w: 0.86},
    {n: 'Play', v: '610', w: 0.72},
    {n: '?', v: '', w: 0.94},
    {n: 'Compra', v: '25', w: 0.4},
  ];
  // the traffic: dots stream into the card
  const stream = f >= k.mandar - 10 && f < k.funil;
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Headline f={f} lines={['MANDAR', 'TRÁFEGO...']} start={k.mandar - 2} y={250} size={160} exitAt={k.apenas - 10} />
      <Headline f={f} lines={['SÓ O CPA?']} start={k.apenas - 2} y={300} size={180} exitAt={k.conta - 10} />
      <Headline f={f} lines={['NÃO CONTA', 'A HISTÓRIA INTEIRA.']} start={k.conta - 2} y={250} size={128} />
      {stream && (
        <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {Array.from({length: 14}).map((_, i) => {
            const x = -30 + ((f - k.mandar + 10) * 9 + i * 80) % 700;
            return <circle key={i} cx={x} cy={640} r={11} fill={C.ink} opacity={x > 60 ? 1 - clamp((x - 520) / 80) : 0} />;
          })}
        </svg>
      )}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 700,
          width: 960,
          height: 640,
          borderRadius: 40,
          background: C.white,
          boxShadow: '0 30px 70px rgba(0,0,0,.10)',
          transform: `translateY(${(1 - up) * 1100 - toFunnel * 300}px) scale(${1 - 0.7 * toFunnel})`,
          opacity: 1 - toFunnel,
          fontFamily: TEXT,
          padding: 60,
          boxSizing: 'border-box',
        }}
      >
        <div style={{fontWeight: 500, fontSize: 30, color: '#6B6B70'}}>Painel de anúncios</div>
        <div style={{display: 'flex', gap: 40, marginTop: 44, opacity: 0.38}}>
          {[
            ['Cliques', metric(1200).toLocaleString('pt-BR')],
            ['CTR', (metric(18) / 10).toFixed(1).replace('.', ',') + '%'],
            ['CPM', 'R$ ' + metric(32)],
          ].map(([l, v]) => (
            <div key={l} style={{flex: 1}}>
              <div style={{fontWeight: 500, fontSize: 26, color: '#6B6B70'}}>{l}</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '75%', fontSize: 56, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{fontWeight: 600, fontSize: 36, marginTop: 60, color: C.ink}}>CPA</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '75%', fontSize: 210, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: C.ink}}>{brl(cpa)}</div>
      </div>
      {f >= k.funil - 2 &&
        rows.map((r, i) => {
          const at = k.funil + i * 4;
          const s = spring(f, at, 0.42, 0.7);
          const w = 240 + 720 * r.w;
          const y = 640 + i * 150;
          if (r.n === '?') {
            const blink = f >= k.historia ? 0.55 + 0.45 * Math.cos(((f - k.historia) / 30) * Math.PI * 2.4) : 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (VW - w) / 2,
                  top: y,
                  width: w,
                  height: 124,
                  borderRadius: 24,
                  border: `6px dashed ${C.coral}`,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: TEXT,
                  fontWeight: 700,
                  fontSize: 36,
                  color: C.coral,
                  opacity: s * blink,
                  transform: `translateY(${(1 - s) * 120}px)`,
                }}
              >
                ??? o que acontece dentro do vídeo
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (VW - w) / 2,
                top: y,
                width: w,
                height: 124,
                borderRadius: 24,
                background: i === 0 ? C.ink : C.white,
                color: i === 0 ? C.white : C.ink,
                boxShadow: '0 12px 30px rgba(0,0,0,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                boxSizing: 'border-box',
                fontFamily: TEXT,
                fontWeight: 600,
                fontSize: 34,
                opacity: clamp(s * 2),
                transform: `translateY(${(1 - s) * 120}px)`,
              }}
            >
              <span>{r.n}</span>
              <span style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '75%', fontSize: 58, fontVariantNumeric: 'tabular-nums'}}>{r.v}</span>
            </div>
          );
        })}
    </AbsoluteFill>
  );
};

// ---- 3/4 · the retention graph (real demo data, first 30 s) ---------------------------------------------
const CURVE = (RET as {curve: {t: number; p: number}[]}).curve;
const TMAX = 30;
const GX = 170;
const GY = 660;
const GW = 830;
const GH = 600;
const pt = (t: number, p: number) => ({x: GX + (GW * t) / TMAX, y: GY + GH * (1 - p / 100)});
const pAt = (t: number) => {
  for (let i = 1; i < CURVE.length; i++) if (CURVE[i].t >= t) return lerp(CURVE[i - 1].p, CURVE[i].p, (t - CURVE[i - 1].t) / (CURVE[i].t - CURVE[i - 1].t));
  return CURVE[CURVE.length - 1].p;
};
const pB = (t: number) => Math.min(100, pAt(t) + (t > 6 ? 16 : t * 2.7));
const pathOf = (fn: (t: number) => number, upTo: number) => {
  const n = Math.max(2, Math.round((upTo / TMAX) * 120));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (upTo * i) / n;
    const q = pt(t, fn(t));
    d += (i ? ' L ' : 'M ') + q.x.toFixed(1) + ' ' + q.y.toFixed(1);
  }
  return d;
};

// viewers walking along the curve again (the hook's dots): some fall off at the 00:06 drop; on version B fewer do
const CurveDots: React.FC<{f: number}> = ({f}) => {
  const start = k.s3 + 76;
  if (f < start) return null;
  const out: React.ReactNode[] = [];
  const SP = 0.16; // graph seconds per frame
  for (let i = 0; i < 60; i++) {
    const born = start - 120 + i * 7;
    const age = f - born;
    if (age < 0) continue;
    const t = age * SP;
    if (t > TMAX) continue;
    const onB = born + 6 / SP >= k.testar; // reached the drop after version B was drawn
    const falls = hash(i, 9) < (onB ? 0.14 : 0.42);
    const fn = onB ? pB : pAt;
    let q = pt(t, fn(t));
    let op = 1;
    if (falls && t > 6) {
      const dt = (t - 6) / SP;
      const a = pt(6, fn(6));
      q = {x: a.x + dt * 1.5, y: a.y + 0.5 * 1.4 * dt * dt};
      op = 1 - clamp((q.y - (GY + GH)) / 60);
    }
    if (op <= 0) continue;
    out.push(<circle key={i} cx={q.x} cy={q.y - 13} r={11} fill={C.ink} opacity={op * clamp((f - start) / 10)} />);
  }
  return <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>{out}</svg>;
};

const Graph: React.FC<{f: number}> = ({f}) => {
  const open = E.cam(prog(f, k.s3, 14));
  const axes = E.prod(prog(f, k.s3 + 8, 14));
  const draw = E.cam(prog(f, k.s3 + 16, 60));
  const tHead = TMAX * draw;
  const head = pt(tHead, pAt(tHead));
  const ab = f >= k.testar;
  const bDraw = E.cam(prog(f, k.testar, 40));
  const ringP = E.prod(prog(f, k.perdendo - 4, 10));
  const knee = pt(6, pAt(6));
  // the panel grows out of the funnel's empty row
  const from = {l: 60, t: 640 + 3 * 150, w: 960, h: 124};
  const to = {l: 40, t: 600, w: 1000, h: 780};
  const box = {l: lerp(from.l, to.l, open), t: lerp(from.t, to.t, open), w: lerp(from.w, to.w, open), h: lerp(from.h, to.h, open)};
  return (
    <>
      <div style={{position: 'absolute', left: box.l, top: box.t, width: box.w, height: box.h, borderRadius: 32, background: C.white, boxShadow: '0 30px 70px rgba(0,0,0,.08)'}} />
      <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: open}}>
        {[0, 25, 50, 75, 100].map((p) => {
          const y = GY + GH * (1 - p / 100);
          return (
            <g key={p} opacity={axes}>
              <line x1={GX} y1={y} x2={GX + GW * axes} y2={y} stroke="#E2E0DC" strokeWidth={2} />
              <text x={GX - 18} y={y + 9} textAnchor="end" fontFamily="Inter Variable" fontSize={26} fill="#8A8A8E">
                {p}%
              </text>
            </g>
          );
        })}
        {[0, 10, 20, 30].map((s) => (
          <text key={s} x={GX + (GW * s) / TMAX} y={GY + GH + 44} textAnchor="middle" fontFamily="Inter Variable" fontSize={26} fill="#8A8A8E" opacity={axes}>
            00:{String(s).padStart(2, '0')}
          </text>
        ))}
        {draw > 0 && <path d={`${pathOf(pAt, tHead)} L ${head.x} ${GY + GH} L ${GX} ${GY + GH} Z`} fill={C.cyan} opacity={ab ? 0.08 : 0.18} />}
        {draw > 0 && <path d={pathOf(pAt, tHead)} stroke={ab ? '#A5A5A9' : C.cyan} strokeWidth={ab ? 6 : 8} fill="none" strokeDasharray={ab ? '16 12' : undefined} strokeLinejoin="round" />}
        {ab && <path d={pathOf(pB, TMAX * bDraw)} stroke={C.cyan} strokeWidth={9} fill="none" strokeLinejoin="round" />}
        {draw > 0 && draw < 1 && <circle cx={head.x} cy={head.y} r={13} fill={C.ink} />}
        {f >= k.perdendo - 4 && f < k.testar && (
          <circle cx={knee.x} cy={knee.y} r={74} fill="none" stroke={C.coral} strokeWidth={9} strokeDasharray={2 * Math.PI * 74} strokeDashoffset={2 * Math.PI * 74 * (1 - ringP)} transform={`rotate(-90 ${knee.x} ${knee.y})`} />
        )}
      </svg>
      <CurveDots f={f} />
      {draw > 0 && draw < 1 && (
        <div style={{position: 'absolute', left: head.x + 20, top: head.y - 74, background: C.ink, color: C.white, fontFamily: TEXT, fontWeight: 700, fontSize: 30, padding: '8px 14px', borderRadius: 12, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
          00:{String(Math.floor(tHead)).padStart(2, '0')} · {Math.round(pAt(tHead))}%
        </div>
      )}
      {f >= k.perdendo && f < k.testar && (
        <div style={{position: 'absolute', left: knee.x + 100, top: knee.y - 150, fontFamily: TEXT, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: C.coral, opacity: arrive(f, k.perdendo, 0.25)}}>
          perdendo
          <br />
          atenção aqui
        </div>
      )}
      {ab && (
        <div style={{position: 'absolute', left: GX + 400, top: GY + 24, display: 'flex', gap: 40, fontFamily: TEXT, fontWeight: 600, fontSize: 32, opacity: arrive(f, k.versoes, 0.25)}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{width: 40, height: 6, background: '#A5A5A9', display: 'inline-block'}} />
            Versão A
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{width: 40, height: 8, background: C.cyan, display: 'inline-block'}} />
            Versão B
          </span>
        </div>
      )}
    </>
  );
};

const KPIS = [
  ['14K', 'Visitas'],
  ['3,5K', 'Cliques'],
  ['24,54%', 'Play rate'],
];
const Scene34: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.paper, overflow: 'hidden', transform: `scale(${1 + 0.00035 * (f - k.s3)})`, transformOrigin: '50% 55%'}}>
    <Headline f={f} lines={['RETENÇÃO', 'DA SUA VSL.']} start={k.s3 + 10} y={250} size={160} exitAt={k.identifica - 12} />
    <Headline f={f} lines={['ACHOU', 'A QUEDA?']} start={k.identifica - 2} y={250} size={160} exitAt={k.testar - 10} />
    <Headline f={f} lines={['TESTE OUTRA', 'VERSÃO.']} start={k.testar - 2} y={250} size={160} />
    <Graph f={f} />
    <div style={{position: 'absolute', left: 64, right: 64, top: 1420, display: 'flex', gap: 20}}>
      {KPIS.map(([v, l], i) => {
        const s = spring(f, k.comport + i * 4, 0.45, 0.6);
        return (
          <div key={l} style={{flex: 1, opacity: f >= k.comport + i * 4 ? 1 : 0, transform: `translateY(${(1 - s) * 60}px)`}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '75%', fontSize: 84, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
            <div style={{fontFamily: TEXT, fontWeight: 500, fontSize: 30, color: '#6B6B70'}}>{l}</div>
          </div>
        );
      })}
    </div>
    {f >= k.comport && <div style={{position: 'absolute', left: 64, top: 1560, fontFamily: TEXT, fontWeight: 500, fontSize: 24, color: '#8A8A8E', opacity: arrive(f, k.comport + 10, 0.2)}}>Dados de demonstração do painel VSLPLAY</div>}
  </AbsoluteFill>
);

// ---- 5 · the features, each showing its own function ------------------------------------------------
const LOGOS = ['hotmart', 'cademi', 'memberkit', 'elementor', 'wordpress', 'leadlovers', 'ticto', 'webflow', 'edduz', 'wix', 'typebot', 'great-pages'];
const Scene5: React.FC<{f: number}> = ({f}) => {
  if (f >= k.muito - 6) {
    return (
      <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
        <Headline f={f} lines={['E MUITO', 'MAIS.']} start={k.muito - 4} y={250} size={190} />
        {LOGOS.map((n, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const at = k.muito - 4 + i * 2;
          const s = spring(f, at, 0.5, 0.55);
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: 70 + col * 320,
                top: 690 + row * 210 + (col === 1 ? 50 : 0),
                width: 290,
                height: 180,
                borderRadius: 36,
                background: C.white,
                boxShadow: '0 16px 40px rgba(0,0,0,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${s})`,
                opacity: f >= at ? 1 : 0,
              }}
            >
              <Img src={staticFile(`logos/${n}.webp`)} style={{maxWidth: 210, maxHeight: 110}} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const collapse = E.expr(prog(f, k.botao - 4, 8));
  const st: PlayerState = {
    x: 40,
    y: 600,
    w: 1000,
    h: 562,
    radius: 22,
    primary: C.coral,
    videoT: (4 + f / 30) % 15.5,
    smart: {box: 1, content: 1, ping: ((f - k.s5) % 36) / 36, collapse},
    controls: {show: collapse, paused: false, time: '00:00', dur: '18:30', seek: 0, fake: 0},
  };
  const btn = spring(f, k.botao + 4, 0.45, 0.5);
  const sec = spring(f, k.sinc + 4, 0.45, 0.55);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Headline f={f} lines={['SMART', 'AUTOPLAY']} start={k.s5 - 2} y={250} size={160} exitAt={k.botao - 8} />
      <Headline f={f} lines={['BOTÃO', 'COM DELAY']} start={k.botao - 2} y={250} size={160} exitAt={k.sinc - 8} />
      <Headline f={f} lines={['SINCRONIZAÇÃO', 'COM A PÁGINA']} start={k.sinc - 2} y={250} size={128} />
      <Player st={st} />
      {f >= k.botao + 4 && <Btn x={80} y={1200} w={920} h={140} sx={btn} sy={btn} shadow={0.5} />}
      {f >= k.sinc + 4 && (
        <div style={{position: 'absolute', left: 40, top: 1370, width: 1000, height: 170, borderRadius: 28, background: C.sun, transform: `translateY(${(1 - sec) * -70}px) scale(${lerp(1.06, 1, sec)})`, padding: '24px 30px', boxSizing: 'border-box', fontFamily: TEXT}}>
          <div style={{fontWeight: 700, fontSize: 32}}>Bônus</div>
          <div style={{display: 'flex', gap: 18, marginTop: 16}}>
            {[0, 1].map((j) => (
              <div key={j} style={{flex: 1, height: 64, borderRadius: 14, background: 'rgba(255,255,255,.6)'}} />
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---- 6 · less guessing, more data -------------------------------------------------------------------
const Scene6: React.FC<{f: number}> = ({f}) => {
  const strike = E.prod(prog(f, k.achismo + 6, 8));
  const dim = E.expr(prog(f, k.mais - 4, 10));
  const draw = E.cam(prog(f, k.dados, 36));
  const full = (RET as {curve: {t: number; p: number}[]}).curve;
  let d = '';
  const nPts = Math.max(2, Math.round(full.length * draw));
  for (let i = 0; i < nPts; i++) d += (i ? ' L ' : 'M ') + (64 + (952 * full[i].t) / 184).toFixed(1) + ' ' + (1260 + 220 * (1 - full[i].p / 100)).toFixed(1);
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', transform: `scale(${1 + 0.0012 * (f - k.s6)})`, transformOrigin: '30% 50%'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - 0.12 * dim})`, transformOrigin: '64px 300px', opacity: 1 - 0.45 * dim}}>
        <Headline f={f} lines={['MENOS ACHISMO.']} start={k.s6 - 2} y={300} size={140} color="#A5A5A9" />
        <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={330} y1={370} x2={330 + 600 * strike} y2={370} stroke={C.coral} strokeWidth={14} strokeLinecap="round" opacity={strike > 0 ? 1 : 0} />
        </svg>
      </div>
      <Headline f={f} lines={['MAIS', 'DADOS.']} start={k.mais - 2} y={560} size={290} />
      {draw > 0 && (
        <svg width={VW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={d} stroke={C.cyan} strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

const Scene7: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
    <Sting f={f} start={k.s7} cy={600} />
    <EndCard
      f={f}
      start={k.s7 + 30}
      btnAt={k.teste}
      y={930}
      lines={[
        {t: 'MAIS CONTROLE.', c: C.white},
        {t: 'MAIS DADOS.', c: C.white},
        {t: 'MAIS INTELIGÊNCIA', c: '#8D8D92'},
        {t: 'PARA SUA VSL.', c: '#8D8D92'},
      ]}
    />
  </AbsoluteFill>
);

export const C3: React.FC = () => {
  useFonts();
  useTextures();
  const f = useCurrentFrame();
  let scene: React.ReactNode;
  if (f < k.s2) scene = <Scene1 f={f} />;
  else if (f < k.s3) scene = <Scene2 f={f} />;
  else if (f < k.s5) scene = <Scene34 f={f} />;
  else if (f < k.s6) scene = <Scene5 f={f} />;
  else if (f < k.s7) scene = <Scene6 f={f} />;
  else scene = <Scene7 f={f} />;
  return <AbsoluteFill style={{background: C.black, fontFamily: TEXT}}>{scene}</AbsoluteFill>;
};

void approach;
