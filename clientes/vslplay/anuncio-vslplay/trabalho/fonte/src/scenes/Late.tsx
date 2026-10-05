import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, TEXT} from '../theme';
import {T} from '../timeline';
import {arrive, clamp, E, LAYOUT, lerp, mixColor, nSamples, prog, RiseText, Samples, spring, WordsLine} from '../kit';
import {dotSocket, Lockup} from '../Logo';
import {pushIn, WHIP, whipDrag} from './Common';

const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR');

// ================================================================================================
// PRICE · paper. 0 to 100.000 plays/ano; the competitor's bill grows R$ 0,02 per play past its
// 50.000-play plan (R$ 7.164 + R$ 1.000 = R$ 8.164, numbers from vslplay.com); VSLPLAY stays at R$ 582.
// Shown per month (the narration says the monthly price): R$ 597 -> R$ 680 against R$ 48,50 (Pro, annual plan).
// The whole setup rides in on the whip; each row hangs on its own spring, so the rows land in cascade.
// ================================================================================================
const P0 = T.price; // 966
const COUNT = {a: 974, b: 1004}; // 0 to 100.000 in one second, right after the rows land
const STAMP = T.priceStamp; // 1013: the pill draws around R$ 582 and fills on the beat (+9)
const BAR = {x: 96, max: 1300, h: 64};
const COMP_BASE = 7164;
const VSL = 582;
const VAL = 120; // both prices: the loudest numbers on the page (the critique: prices >= 90 px)
const plays = (f: number) => 100000 * E.prod(prog(f, COUNT.a, COUNT.b - COUNT.a));
const compCost = (f: number) => COMP_BASE + 0.02 * Math.max(0, plays(f) - 50000);
const barLen = (v: number) => (v / 8164) * (LAYOUT.vertical ? 620 : BAR.max);
const ROW_Y = [440, 710]; // bar tops
const PILL = {w: 440, h: 140};
const perMonth = (annual: number) => annual / 12;

const Price$: React.FC<{v: string; color: string; width?: number}> = ({v, color, width}) => (
  <div style={{width, textAlign: width ? 'center' : undefined, fontFamily: DISPLAY, fontWeight: 900, fontStretch: '64%', fontSize: VAL, lineHeight: 1, letterSpacing: '-0.01em', color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{v}</div>
);

export const Price: React.FC<{f: number; ft?: number}> = ({f, ft}) => {
  if (f < WHIP.a || f >= T.more) return null;
  const t = ft ?? f;
  // follow-through: stiffer springs on top, softer below (the lower rows land last)
  const dx = [whipDrag(t, 0.74), whipDrag(t, 0.62), whipDrag(t, 0.52), whipDrag(t, 0.46)];
  const row = (i: number): React.CSSProperties => ({position: 'absolute', inset: 0, transform: `translateX(${dx[i]}px)`});
  const cBase = barLen(COMP_BASE);
  const cExtra = barLen(compCost(f) - COMP_BASE);
  const vLen = barLen(VSL);
  const extraOn = plays(f) > 50000;
  const noteIn = arrive(f, COUNT.a + 12, 0.2); // about when the counter passes 50.000
  const pl = plays(f);
  const cy = [ROW_Y[0] + BAR.h / 2, ROW_Y[1] + BAR.h / 2];
  // the stamp (ref-x): a pill draws around R$ 582, fills with coral, the price turns white and is pressed
  const draw = E.prod(prog(f, STAMP, 9));
  const fillA = E.expr(prog(f, STAMP + 9, 4));
  const press = f >= STAMP + 9 ? 1 + 0.07 * (spring(f, STAMP + 9, 0.6, 0.35) - 1) : 1;
  const pill = {x: BAR.x + vLen + 36, y: cy[1] - PILL.h / 2, w: PILL.w, h: PILL.h};
  const pr = pill.h / 2;
  const perim = 2 * (pill.w - 2 * pr) + 2 * Math.PI * pr;
  // start at the left middle and run clockwise
  const pillPath = `M ${pill.x} ${pill.y + pr} A ${pr} ${pr} 0 0 1 ${pill.x + pr} ${pill.y} L ${pill.x + pill.w - pr} ${pill.y} A ${pr} ${pr} 0 0 1 ${pill.x + pill.w - pr} ${pill.y + pill.h} L ${pill.x + pr} ${pill.y + pill.h} A ${pr} ${pr} 0 0 1 ${pill.x} ${pill.y + pr} Z`;
  const pc = {x: pill.x + pill.w / 2, y: cy[1]};
  const valColor = mixColor(C.ink, '#FFFFFF', fillA);
  const compX = BAR.x + cBase + (extraOn ? cExtra : 0) + 30;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: pushIn(f, P0, 0.00022, 700, 540), transformOrigin: '0 0'}}>
        {/* the scenario: plays per year */}
        <div style={row(0)}>
          <div style={{position: 'absolute', left: 92, top: 150, display: 'flex', alignItems: 'baseline', gap: 22}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontStretch: '64%', fontSize: 110, lineHeight: 1, letterSpacing: '-0.01em', color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{fmt(pl)}</div>
            <div style={{fontFamily: TEXT, fontWeight: 600, fontSize: 38, color: C.ink, opacity: 0.55}}>plays/ano</div>
          </div>
          <div style={{position: 'absolute', left: BAR.x, top: 310, fontFamily: TEXT, fontWeight: 600, fontSize: 23, color: C.ink, opacity: 0.45}}>Custo por mês</div>
        </div>

        {/* row 1: competitor */}
        <div style={row(1)}>
          <div style={{position: 'absolute', left: BAR.x, top: ROW_Y[0] - 48, fontFamily: TEXT, fontWeight: 600, fontSize: 30, color: C.ink, opacity: 0.62}}>Concorrente V***B</div>
          <div style={{position: 'absolute', left: BAR.x, top: ROW_Y[0], width: cBase, height: BAR.h, borderRadius: extraOn ? '8px 0 0 8px' : 8, background: '#BDBBB5'}} />
          {extraOn && <div style={{position: 'absolute', left: BAR.x + cBase, top: ROW_Y[0], width: cExtra, height: BAR.h, borderRadius: '0 8px 8px 0', background: C.ink}} />}
          <div style={{position: 'absolute', left: compX, top: cy[0] - VAL * 0.5}}>
            <Price$ v={`R$ ${fmt(perMonth(compCost(f)))}`} color={C.ink} />
          </div>
          <div style={{position: 'absolute', left: BAR.x, top: ROW_Y[0] + BAR.h + 16, fontFamily: TEXT, fontWeight: 500, fontSize: 26, color: C.ink, opacity: 0.55 * noteIn, transform: `translateY(${(1 - noteIn) * 12}px)`}}>
            cobra R$ 0,02 por play extra
          </div>
        </div>

        {/* row 2: VSLPLAY */}
        <div style={row(2)}>
          <div style={{position: 'absolute', left: BAR.x, top: pill.y - 48, fontFamily: TEXT, fontWeight: 800, fontSize: 30, color: C.ink}}>VSLPLAY <span style={{fontWeight: 600, opacity: 0.55}}>no plano anual</span></div>
          <div style={{position: 'absolute', left: BAR.x, top: ROW_Y[1], width: vLen, height: BAR.h, borderRadius: 8, background: C.coral}} />
          <div style={{position: 'absolute', left: BAR.x, top: pill.y + pill.h + 16, fontFamily: TEXT, fontWeight: 500, fontSize: 26, color: C.ink, opacity: 0.55 * noteIn, transform: `translateY(${(1 - noteIn) * 12}px)`}}>
            R$ 0,00 de custo extra
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translate(${pc.x}px, ${pc.y}px) scale(${press}) translate(${-pc.x}px, ${-pc.y}px)`, transformOrigin: '0 0'}}>
            {f >= STAMP && (
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <path d={pillPath} fill={C.coral} fillOpacity={fillA} stroke={C.coral} strokeWidth={5} strokeDasharray={`${perim} ${perim}`} strokeDashoffset={perim * (1 - draw)} strokeLinecap="round" />
              </svg>
            )}
            <div style={{position: 'absolute', left: pill.x, top: cy[1] - VAL * 0.5}}>
              <Price$ v="R$ 48,50" color={valColor} width={pill.w} />
            </div>
          </div>
          {f >= STAMP + 3 && (
            <div style={LAYOUT.vertical ? {position: 'absolute', left: BAR.x, top: pill.y + pill.h + 64} : {position: 'absolute', left: pill.x + pill.w + 44, top: cy[1] - 54 * 0.61}}>
              <WordsLine f={f} text="Sem cobrança por plays ou banda." start={STAMP + 3} size={54} weight={700} color={C.ink} stagger={2} maxWidth={LAYOUT.vertical ? 900 : 1180} />
            </div>
          )}
        </div>

        <div style={row(3)}>
          <div style={{position: 'absolute', left: BAR.x, top: LAYOUT.vertical ? 980 : 962, width: LAYOUT.vertical ? 900 : undefined, fontFamily: TEXT, fontWeight: 500, fontSize: 23, lineHeight: 1.35, color: C.ink, opacity: 0.45}}>
            Comparativo em vslplay.com, cenário real com 100.000 plays/ano. VSLPLAY: plano Pro anual, R$ 582 à vista.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================================================
// E MUITO MAIS · black. The site's own "E muito mais" as a big two-line title on the left; the six new
// features from the Pro plan land one per eighth note in the right column, each wearing its NOVO tag.
// Earlier lines step back while the next lands; once the list is complete, all of it comes back to full.
// ================================================================================================
const MORE = ['Teste A/B de Vídeo', 'Teste A/B de Headline', 'Análise de Pitch', 'Simulador de Views ao Vivo', 'Filtro de Tráfego', 'Pixel'];
const M0 = T.more; // 1078
const LINE0 = 1092;
const LSTEP = 7;
const ALL_BACK = LINE0 + 5 * LSTEP + 12; // 1139

export const More: React.FC<{f: number}> = ({f}) => {
  if (f < M0 || f >= T.integr) return null;
  const LX = 790;
  const LH = 92;
  const L0 = 540 - (5 * LH + 72) / 2;
  return (
    <AbsoluteFill style={{background: C.black}}>
      <AbsoluteFill style={{transform: pushIn(f, M0, 0.0003, 960, 540), transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', left: 96, top: 540 - 160}}>
          {['E MUITO', 'MAIS'].map((w, li) => (
            <div key={w}>
              <RiseText f={f} text={w} size={170} stretch={64} weight={900} color="#FFFFFF" tracking={-0.01} lineHeight={0.94} opts={{start: M0 - 2 + li * 3, stagger: 1, k: 0.2, rise: 1, rot: -6}} />
            </div>
          ))}
        </div>
        {MORE.map((txt, i) => {
          const at = LINE0 + i * LSTEP;
          if (f < at - 1) return null;
          const back = i < MORE.length - 1 ? arrive(f, at + LSTEP, 0.25) * (1 - arrive(f, ALL_BACK + i * 1.5, 0.22)) : 0;
          const tagA = spring(f, at + 3, 0.45, 0.55);
          return (
            <div key={i} style={{position: 'absolute', left: LX, top: L0 + i * LH, display: 'flex', alignItems: 'center', gap: 20, opacity: 1 - 0.58 * back}}>
              <RiseText f={f} text={txt} size={72} stretch={64} weight={900} color="#FFFFFF" tracking={-0.005} lineHeight={1} upper={false} opts={{start: at, stagger: 0.45, k: 0.24, rise: 1, rot: -5}} />
              <div
                style={{
                  padding: '6px 11px 5px',
                  borderRadius: 6,
                  background: C.sun,
                  color: C.ink,
                  fontFamily: TEXT,
                  fontWeight: 800,
                  fontSize: 19,
                  letterSpacing: '0.08em',
                  transform: `scale(${tagA})`,
                  transformOrigin: '0% 50%',
                  marginTop: 6,
                }}
              >
                NOVO
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================================================================================================
// INTEGRAÇÕES · paper. First the line the site puts under its hero, "Compatível com links do YouTube e
// arquivos MP4.", with the two sources plugging into the icon; then the sources fold into it and the 14
// real integration logos from the site shoot out of it to a 5 x 3 grid, nearest ring first.
// ================================================================================================
const LOGOS = [
  'hotmart', 'edduz', 'wordpress', 'elementor', 'great-pages', 'webflow', 'wix',
  'cademi', 'memberkit', 'astron-members', 'builderal', 'leadlovers', 'ticto', 'typebot',
];
const I0 = T.integr; // 1162
const G0 = T.integrGrid; // 1204
const HUB = {x: 960, y: 612};
const SRC = {yt: {x: 540, y: HUB.y}, mp4: {x: 1380, y: HUB.y}};
const PLUG = I0 + 12; // the connectors draw
const PULSE = {a: I0 + 20, b: I0 + 32}; // a dot runs along each connector into the icon
const FOLD = {a: G0 - 6, d: 9}; // the sources fold into the icon
const GRID_H = {x0: HUB.x - 2 * 280, y0: HUB.y - 138, dx: 280, dy: 138};
const GRID_V = {x0: HUB.x - 300, y0: HUB.y - 2 * 150, dx: 300, dy: 150};
const cellsOf = (cols: number, rows: number) => {
  const cells: {c: number; r: number}[] = [];
  const cc = (cols - 1) / 2;
  const cr = (rows - 1) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!(r === cr && c === cc)) cells.push({c, r});
  // nearest ring first
  const w = cols > rows ? [2, 1] : [1, 1.5];
  return cells.sort((a, b) => Math.hypot((a.c - cc) * w[0], (a.r - cr) * w[1]) - Math.hypot((b.c - cc) * w[0], (b.r - cr) * w[1]));
};
const CELLS_H = cellsOf(5, 3);
const CELLS_V = cellsOf(3, 5);
const BURST = G0 + 2; // one logo per frame, so the full grid holds for about a second before the finale

const YouTubeMark: React.FC<{s: number}> = ({s}) => (
  <svg width={120} height={84} viewBox="0 0 120 84" style={{display: 'block', transform: `scale(${s})`}}>
    <rect x={0} y={0} width={120} height={84} rx={22} fill="#FF0033" />
    <path d="M48 24 L48 60 L80 42 Z" fill="#FFFFFF" />
  </svg>
);
const Mp4Mark: React.FC<{s: number}> = ({s}) => (
  <svg width={92} height={112} viewBox="0 0 92 112" style={{display: 'block', transform: `scale(${s})`, overflow: 'visible'}}>
    <path d="M10 4 H60 L88 32 V100 Q88 108 80 108 H12 Q4 108 4 100 V12 Q4 4 12 4 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M60 4 V26 Q60 32 66 32 H88" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <text x={46} y={80} textAnchor="middle" fontFamily={TEXT} fontWeight={800} fontSize={25} letterSpacing="0.02em" fill={C.ink}>
      MP4
    </text>
  </svg>
);

export const Integr: React.FC<{f: number}> = ({f}) => {
  if (f < I0 || f >= T.final) return null;
  const iconS = spring(f, I0, 0.4, 0.6);
  // the icon takes each pulse and the fold with a small bump
  const bump = 1 + 0.06 * Math.max(0, Math.sin(Math.PI * clamp((f - PULSE.b) / 6))) + 0.05 * Math.max(0, Math.sin(Math.PI * clamp((f - (FOLD.a + FOLD.d)) / 6)));
  const place = {cx: HUB.x, cy: HUB.y, s: (116 / 785) * iconS * bump};
  const dot = dotSocket(place);
  const V = LAYOUT.vertical;
  const GRID = V ? GRID_V : GRID_H;
  const CELLS = V ? CELLS_V : CELLS_H;
  const SRCX = V ? {yt: 700, mp4: 1220} : {yt: SRC.yt.x, mp4: SRC.mp4.x};
  const logoAt = (ff: number, i: number) => {
    const cell = CELLS[i];
    const tx = GRID.x0 + cell.c * GRID.dx;
    const ty = GRID.y0 + cell.r * GRID.dy;
    const s0 = BURST + i;
    const p = spring(ff, s0, 0.4, 0.62);
    return {x: lerp(HUB.x, tx, p), y: lerp(HUB.y, ty, p), s: lerp(0.35, 1, clamp(p * 1.4)), op: clamp((ff - s0 + 1) / 3), rot: (cell.c < (V ? 1 : 2) ? -1 : 1) * 10 * (1 - clamp(p))};
  };
  // logos sampled so that no two samples of one logo sit more than 4 px apart
  const LSH = 0.5;
  let disp = 0;
  if (f >= BURST && f < BURST + 14 + 20) {
    for (let i = 0; i < LOGOS.length; i++) {
      const a = logoAt(f - LSH / 2, i);
      const b = logoAt(f + LSH / 2, i);
      if (b.op > 0) disp = Math.max(disp, Math.hypot(b.x - a.x, b.y - a.y) + 91 * Math.abs(b.s - a.s) + (91 * Math.PI * Math.abs(b.rot - a.rot)) / 180);
    }
  }
  const n = nSamples(disp, 4, 16);
  // sources: pop in, plug in, then fold into the icon
  const fold = E.exit(prog(f, FOLD.a, FOLD.d));
  const srcIn = (at: number) => spring(f, at, 0.42, 0.6);
  const sources = [
    {k: 'yt', p: {x: SRCX.yt, y: HUB.y}, s: srcIn(I0 + 4), side: -1, edge: 104},
    {k: 'mp4', p: {x: SRCX.mp4, y: HUB.y}, s: srcIn(I0 + 6), side: 1, edge: 88},
  ];
  const plug = E.prod(prog(f, PLUG, 8));
  const pulse = E.expr(prog(f, PULSE.a, PULSE.b - PULSE.a));
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: pushIn(f, I0, 0.00025, 960, 560), transformOrigin: '0 0'}}>
        {/* sources + connectors */}
        {f < FOLD.a + FOLD.d && (
          <>
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              {sources.map(({k, p, side, edge}) => {
                const x0 = lerp(p.x - side * edge, HUB.x, fold);
                const x1 = HUB.x + side * 78;
                const xe = lerp(x0, x1, plug);
                const px = lerp(x0, x1, pulse);
                return (
                  <g key={k} opacity={1 - fold}>
                    {plug > 0 && <line x1={x0} y1={HUB.y} x2={xe} y2={HUB.y} stroke={C.ink} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="2 8" strokeLinecap="round" />}
                    {pulse > 0 && pulse < 1 && <circle cx={px} cy={HUB.y} r={7} fill={k === 'yt' ? '#FF0033' : C.ink} />}
                  </g>
                );
              })}
            </svg>
            {sources.map(({k, p, s: sc}) => {
              const x = lerp(p.x, HUB.x, fold);
              return (
                <div key={k} style={{position: 'absolute', left: x, top: p.y, transform: `translate(-50%, -50%) scale(${1 - 0.8 * fold})`, opacity: clamp(sc * 3) * (1 - fold)}}>
                  {k === 'yt' ? <YouTubeMark s={1.35 * sc} /> : <Mp4Mark s={1.35 * sc} />}
                </div>
              );
            })}
          </>
        )}
        <Samples
          f={f}
          n={n}
          shutter={LSH}
          render={(ff) => (
            <>
              {/* no ground: an opaque paper sample per layer drifted by 2 levels in 8-bit over part of the frame */}
              {f >= BURST - 1 &&
                LOGOS.map((name, i) => {
                  const l = logoAt(ff, i);
                  if (l.op <= 0) return null;
                  return (
                    <Img
                      key={name}
                      src={staticFile(`logos/${name}.webp`)}
                      style={{
                        position: 'absolute',
                        left: l.x - 91,
                        top: l.y - 33.5,
                        width: 182,
                        height: 67,
                        opacity: l.op,
                        transform: `rotate(${l.rot}deg) scale(${l.s})`,
                      }}
                    />
                  );
                })}
            </>
          )}
        />
        {f < G0 + 2 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: V ? 330 : 206, display: 'flex', justifyContent: 'center', textAlign: 'center'}}>
            <WordsLine f={f} text="Compatível com links do YouTube e arquivos MP4." start={I0 + 2} size={V ? 56 : 46} weight={700} color={C.ink} stagger={2} exitAt={FOLD.a - 2} maxWidth={V ? 760 : undefined} />
          </div>
        )}
        {f >= G0 - 2 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: V ? 170 : 206, display: 'flex', justifyContent: 'center'}}>
            <WordsLine f={f} text="Integrações" start={G0} size={46} weight={700} color={C.ink} />
          </div>
        )}
        {iconS > 0.01 && (
          <>
            <Lockup place={place} icon={{cool: {}, warm: {}, purple: {}, tri: {fill: 'none', op: 0}, assembled: true}} word={null} uid="intg" stage={C.paper} />
            <div style={{position: 'absolute', left: dot.x - dot.r, top: dot.y - dot.r, width: dot.r * 2, height: dot.r * 2, borderRadius: '50%', background: '#fff'}} />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
