import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, COL, PL, TEXT} from '../theme';
import {T} from '../timeline';
import {arrive, clamp, E, lerp, nSamples, prog, RiseText, Samples, spring, WordsLine} from '../kit';
import {ControlItems, PlayerState, r} from '../Player';
import {CamStage} from '../CamStage';
import {Cam, camDispOf, ChapterWord, CH_STRETCH, fakeOf, FeatureText, pushCam, pushIn, TITLE_SIZE, timeStr} from './Common';

// Chapter 3 · CONVERSÃO (Violet): Botão Delay, Controles, Aparência
const DUR = 1110; // 18:30
const MARK_T = 750; // 12:30
const MARK = MARK_T / DUR;
const SEEK_X = (u: number) => PL.x + r(1) + (PL.w - 2 * r(1)) * u;
const SEEK_Y = PL.y + PL.h - 11 - r(3.5) - r(1) / 2;
const CS3 = 758; // the Violet field collapses into the 12:30 marker
const HIT = T.delayHit; // 798: the playhead touches the marker
const FLY = {a: HIT + 3, b: HIT + 13}; // the diamond drops into the button slot
const CTA_C = {x: PL.x + PL.w / 2, y: PL.y + PL.h + r(0.9) + r(3) / 2};

// ---- feature camera ----------------------------------------------------------------------------
// Botão Delay: a push that frames the playhead reaching 12:30 and the button landing under the player,
// held on the button, pulled back before the title swap. Controles: a push on the right half of the
// bar, where every toggle lands. Aparência stays wide: the player needs the room to swing to 9:16.
const DELAY_A = {x: 1325, y: 860};
const DELAY_C = {x: 1236, y: 640};
const S_DELAY = 1.8;
const PUSH_D = {a: 776, d: 18}; // 776 -> 794
const PULL_D = {a: 818, d: 14}; // 818 -> 832
const CTRL_A = {x: 1480, y: 700};
const CTRL_C = {x: 1236, y: 560};
const S_CTRL = 1.5;
const PUSH_C = {a: 838, d: 16}; // 838 -> 854
const PULL_C = {a: 876, d: 14}; // 876 -> 890
const camAt = (ff: number): Cam => {
  if (ff < PULL_D.a) return pushCam(DELAY_A, DELAY_C, S_DELAY, E.cam(prog(ff, PUSH_D.a, PUSH_D.d)));
  if (ff < PUSH_C.a) return pushCam(DELAY_A, DELAY_C, S_DELAY, 1 - E.cam(prog(ff, PULL_D.a, PULL_D.d)));
  if (ff < PULL_C.a) return pushCam(CTRL_A, CTRL_C, S_CTRL, E.cam(prog(ff, PUSH_C.a, PUSH_C.d)));
  return pushCam(CTRL_A, CTRL_C, S_CTRL, 1 - E.cam(prog(ff, PULL_C.a, PULL_C.d)));
};

// ---- clock: 09:10, scrub to 12:30, then plays --------------------------------------------------
const clock = (f: number) => {
  const t0 = 550;
  if (f < 772) return t0 + (f - CS3) / 30;
  if (f < HIT) return lerp(t0 + 14 / 30, MARK_T, E.prod(prog(f, 772, HIT - 772)));
  if (f < T.aparencia + 2) return MARK_T + (f - HIT) / 30;
  return MARK_T + (T.aparencia + 2 - HIT) / 30; // paused for Aparência
};

// ---- Controles: toggles on eighth notes --------------------------------------------------------
const ROWS: {k: keyof ControlItems; label: string}[] = [
  {k: 'play', label: 'Play/Pause'},
  {k: 'seek', label: 'Barra de progresso'},
  {k: 'current', label: 'Tempo percorrido'},
  {k: 'duration', label: 'Duração do vídeo'},
  {k: 'volume', label: 'Botão de volume'},
  {k: 'volumeBar', label: 'Barra de volume'},
  {k: 'speed', label: 'Velocidade'},
  {k: 'fullscreen', label: 'Fullscreen'},
];
// every toggle lands inside the Controles framing (the right half of the bar)
const TOGGLES: {at: number; k: keyof ControlItems; on: boolean}[] = [
  {at: 852, k: 'seek', on: false},
  {at: 859, k: 'volumeBar', on: false},
  {at: 866, k: 'speed', on: false},
  {at: 873, k: 'volume', on: false},
  {at: 880, k: 'seek', on: true},
  {at: 887, k: 'speed', on: true},
];
// 0..1 state of a control (checkbox and bar share the same curve)
const ctrl = (f: number, k: keyof ControlItems) => {
  let v = 1;
  for (const t of TOGGLES) {
    if (t.k !== k || f < t.at) continue;
    const a = arrive(f, t.at, 0.3);
    v = t.on ? lerp(v, 1, a) : lerp(v, 0, a);
  }
  return v;
};
// the control lights up on the frame it switches off (full, then half), and two frames after it switches
// back on, once it has grown back enough to be seen
const flashOf = (f: number): Partial<ControlItems> => {
  const out: Partial<ControlItems> = {};
  for (const t of TOGGLES) {
    const d = Math.floor(f - (t.at + (t.on ? 2 : 0)));
    if (d === 0 || d === 1) out[t.k] = Math.max(out[t.k] ?? 0, d === 0 ? 1 : 0.5);
  }
  return out;
};
const items = (f: number): ControlItems => ({
  play: ctrl(f, 'play'),
  seek: ctrl(f, 'seek'),
  current: ctrl(f, 'current'),
  duration: ctrl(f, 'duration'),
  volume: ctrl(f, 'volume'),
  volumeBar: ctrl(f, 'volumeBar'),
  speed: ctrl(f, 'speed'),
  fullscreen: ctrl(f, 'fullscreen'),
});

// ---- Aparência ----------------------------------------------------------------------------------
const SW = [
  {c: C.violet, at: 0},
  {c: C.coral, at: 904},
  {c: C.cyan, at: 911},
  {c: C.sun, at: 918},
  {c: C.violet, at: 925},
];
const SW_COLORS = [C.violet, C.coral, C.cyan, C.sun];
const swIndex = (i: number) => (i === 4 ? 0 : i);
const primaryAt = (f: number): {primary: string; wipe?: {color: string; p: number}} => {
  // the latest change wipes in over 6 frames (it always completes before the next one starts)
  let last = 0;
  for (let i = 1; i < SW.length; i++) if (f >= SW[i].at) last = i;
  if (last === 0) return {primary: SW[0].c};
  const p = E.expr(prog(f, SW[last].at, 6));
  if (p >= 1) return {primary: SW[last].c};
  return {primary: SW[last - 1].c, wipe: {color: SW[last].c, p}};
};
const RADIUS_AT = 925;
const STRETCH = T.stretch; // 930: anticipation, release at +3
const V = {w: 430, h: 764}; // 9:16
const stretchP = (f: number) => spring(f, STRETCH + 3, 0.3, 0.42);
const playerGeom = (f: number) => {
  const cx = PL.x + PL.w / 2;
  const cy = PL.y + PL.h / 2;
  let w = PL.w;
  let h = PL.h;
  if (f >= STRETCH) {
    // anticipation: 3 frames of widening, then the elastic swing to 9:16
    const ant = f < STRETCH + 3 ? E.inQuad((f - STRETCH) / 3) : 1 - clamp((f - STRETCH - 3) / 2);
    const p = stretchP(f);
    w = lerp(PL.w, V.w, p) * (1 + 0.05 * ant);
    h = lerp(PL.h, V.h, p) * (1 - 0.05 * ant);
  }
  return {x: cx - w / 2, y: cy - h / 2, w, h};
};

const playerAt = (f: number): PlayerState => {
  const g = playerGeom(f);
  const t = clock(f);
  const pr = primaryAt(f);
  const radius = lerp(12, 40, arrive(f, RADIUS_AT, 0.25));
  const paused = f >= T.aparencia + 2;
  const flying = f >= FLY.a;
  const markerShow = f >= CS3 + 16 && !flying ? 1 : 0;
  const squash = f >= HIT && f < FLY.a ? [1, 0.8, 0.4][f - HIT] ?? 0 : 0;
  const ctaGrow = spring(f, FLY.b - 1, 0.34, 0.5);
  return {
    ...g,
    radius,
    primary: pr.primary,
    primaryWipe: pr.wipe,
    videoT: 4.5 + (paused ? (T.aparencia + 2 - CS3) / 30 : (f - CS3) / 30),
    bigPlay: paused ? spring(f, T.aparencia + 2, 0.45, 0.55) : 0,
    controls: {
      show: 1,
      paused,
      time: timeStr(t),
      dur: '18:30',
      seek: t / DUR,
      fake: fakeOf(t / DUR),
      items: items(f),
      flash: flashOf(f),
      knob: f >= 770 && f < T.controles ? arrive(f, 770, 0.3) * (1 - prog(f, T.controles - 6, 6)) : 0,
      marker: {at: MARK, show: markerShow, squash},
    },
    cta: f >= FLY.b - 1 ? {show: 1, grow: ctaGrow} : undefined,
  };
};

// ---- the diamond: field -> marker, then marker -> button ----------------------------------------
const COLLAPSE_SHUTTER = 0.5;
const collapseAt = (ff: number) => {
  const a = arrive(ff, CS3, 0.2);
  return {
    a,
    cx: lerp(960, SEEK_X(MARK), a),
    cy: lerp(540, SEEK_Y, a),
    w: lerp(1920 * 1.5, 18, a),
    h: lerp(1080 * 1.5, 18, a),
    rot: 45 * E.expr(prog(ff, CS3 + 3, 10)),
  };
};
// how far the field's visible edges travel during the shutter (corners clamped to the frame)
const collapseDisp = (f: number) => {
  const pts = (ff: number) => {
    const {cx, cy, w, h, rot} = collapseAt(ff);
    const c = Math.cos((rot * Math.PI) / 180);
    const sn = Math.sin((rot * Math.PI) / 180);
    return [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([u, v]) => {
      const x = (u * w) / 2;
      const y = (v * h) / 2;
      return {x: clamp(cx + x * c - y * sn, -200, 2120), y: clamp(cy + x * sn + y * c, -200, 1280)};
    });
  };
  const a = pts(f - COLLAPSE_SHUTTER / 2);
  const b = pts(f + COLLAPSE_SHUTTER / 2);
  return Math.max(...a.map((p, i) => Math.hypot(b[i].x - p.x, b[i].y - p.y)));
};
const FLY_SHUTTER = 0.6;
const flyAt = (ff: number) => {
  const u = E.inQuad(clamp((ff - FLY.a) / (FLY.b - FLY.a)));
  const p0 = {x: SEEK_X(MARK), y: SEEK_Y};
  const p2 = CTA_C;
  const p1 = {x: p0.x + 30, y: p0.y - 90}; // pops up first, then falls into the slot
  return {
    x: (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x,
    y: (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y,
    s: lerp(18, 26, u),
    rot: 45 + 90 * u,
  };
};
const Diamond: React.FC<{f: number}> = ({f}) => {
  // 1) collapse of the Violet field into the 12:30 marker
  if (f >= CS3 && f < CS3 + 16) {
    return (
      <Samples
        f={f}
        n={nSamples(collapseDisp(f), 4, 32)}
        shutter={COLLAPSE_SHUTTER}
        render={(ff) => {
          const {cx, cy, w, h, rot, a} = collapseAt(ff);
          return (
            <div
              style={{
                position: 'absolute',
                left: cx - w / 2,
                top: cy - h / 2,
                width: w,
                height: h,
                background: C.violet,
                borderRadius: lerp(0, 3, a),
                transform: `rotate(${rot}deg)`,
              }}
            />
          );
        }}
      />
    );
  }
  // 2) flight from the marker to the button slot under the player, along an arc. A sample every 2 px of the
  // diamond's travel on screen (camera scale included): 8 fixed samples strobed into ~7 copies on f809-810
  if (f >= FLY.a && f < FLY.b) {
    const a = flyAt(f - FLY_SHUTTER / 2);
    const b = flyAt(f + FLY_SHUTTER / 2);
    const disp = camAt(f).s * (Math.hypot(b.x - a.x, b.y - a.y) + (b.s - a.s) + (Math.abs(b.rot - a.rot) * Math.PI * b.s) / 360);
    return (
      <Samples
        f={f}
        n={nSamples(disp, 2, 40)}
        shutter={FLY_SHUTTER}
        render={(ff) => {
          const {x, y, s, rot} = flyAt(ff);
          return (
            <div
              style={{
                position: 'absolute',
                left: x - s / 2,
                top: y - s / 2,
                width: s,
                height: s,
                background: C.violet,
                borderRadius: 3,
                transform: `rotate(${rot}deg)`,
                boxShadow: '0 0 0 2.5px #fff',
              }}
            />
          );
        }}
      />
    );
  }
  return null;
};

// ---- the 12:30 hover tooltip on the seek bar ------------------------------------------------------
const Tooltip: React.FC<{f: number}> = ({f}) => {
  const a0 = CS3 + 14;
  if (f < a0 || f > FLY.a + 4) return null;
  const a = arrive(f, a0, 0.25);
  const out = prog(f, FLY.a - 1, 4);
  return (
    <div
      style={{
        position: 'absolute',
        left: SEEK_X(MARK) - 44,
        top: SEEK_Y - 64,
        width: 88,
        height: 40,
        borderRadius: 8,
        background: '#FFFFFF',
        color: C.ink,
        fontFamily: TEXT,
        fontWeight: 700,
        fontSize: 22,
        fontVariantNumeric: 'tabular-nums',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: a * (1 - out),
        transform: `translateY(${(1 - a) * 10}px)`,
        boxShadow: '0 4px 10px rgba(0,0,0,.18)',
      }}
    >
      12:30
    </div>
  );
};

// ---- Controles checklist ----------------------------------------------------------------------
const Check: React.FC<{v: number; color: string}> = ({v, color}) => (
  <svg width={30} height={30} viewBox="0 0 30 30" style={{display: 'block'}}>
    <rect x={1.5} y={1.5} width={27} height={27} rx={7} fill="none" stroke={C.ink} strokeOpacity={0.28} strokeWidth={2} />
    <g transform={`translate(15 15) scale(${0.55 + 0.45 * v}) translate(-15 -15)`} opacity={clamp(v * 3)}>
      <rect x={0} y={0} width={30} height={30} rx={8} fill={color} />
    </g>
    <path d="M8.5 15.5 L13 20 L22 10.5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 22" strokeDashoffset={22 * (1 - clamp(v * 1.4 - 0.3))} />
  </svg>
);

const Checklist: React.FC<{f: number; top: number}> = ({f, top}) => {
  const a0 = T.controles + 8;
  const out0 = T.aparencia - 6;
  if (f < a0 || f > out0 + 12) return null;
  return (
    <div style={{position: 'absolute', left: COL.x, top}}>
      {ROWS.map((row, i) => {
        const a = arrive(f, a0 + i * 2, 0.22);
        const o = E.exit(prog(f, out0 + i * 0.8, 8));
        return (
          <div
            key={row.k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              height: 46,
              opacity: clamp(a * 1.6) * (1 - o),
              transform: `translateY(${(1 - a) * 18 - o * 18}px)`,
            }}
          >
            <Check v={ctrl(f, row.k)} color={C.violet} />
            <span style={{fontFamily: TEXT, fontWeight: 500, fontSize: 28, color: C.ink, letterSpacing: '-0.005em'}}>{row.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---- Aparência column: stretching title + swatches -----------------------------------------------
const AparenciaText: React.FC<{f: number}> = ({f}) => {
  const a0 = T.aparencia;
  if (f < a0 - 2 || f > T.price + 2) return null;
  const p = stretchP(f);
  // the title stretches wide while the player swings to 9:16, overshoots narrow, and settles
  const wd = clamp(CH_STRETCH + 150 * p * (1 - p) * (f >= STRETCH + 3 ? 1 : 0), 62, 125);
  const sel = (() => {
    let idx = 0;
    let from = 0;
    let at = -1;
    for (let i = 1; i < SW.length; i++) {
      if (f >= SW[i].at) {
        from = swIndex(idx);
        idx = i;
        at = SW[i].at;
      }
    }
    const to = swIndex(idx);
    const u = at < 0 ? 1 : arrive(f, at, 0.3);
    return lerp(from, to, u);
  })();
  const tagIn = arrive(f, a0, 0.2);
  return (
    <div style={{position: 'absolute', left: COL.x, top: 352}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 30, fontFamily: TEXT, fontWeight: 600, fontSize: 23, color: C.ink, opacity: 0.62 * clamp(tagIn * 1.5), transform: `translateY(${(1 - tagIn) * 16}px)`}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.violet, opacity: 1 / 0.62}} />
        Conversão
      </div>
      <div style={{marginTop: 20}}>
        <RiseText f={f} text="APARÊNCIA" size={TITLE_SIZE} stretch={wd} weight={900} color={C.ink} tracking={-0.008} lineHeight={0.94} opts={{start: a0, stagger: 1, k: 0.2, rise: 1, rot: -6}} />
      </div>
      <div style={{marginTop: 26}}>
        <WordsLine f={f} text="Personalize cor, bordas e formato." start={a0 + 7} size={34} weight={500} color="#4A4A50" stagger={1.6} maxWidth={COL.w} />
      </div>
      <div style={{position: 'relative', marginTop: 40, display: 'flex', gap: 22, height: 56, alignItems: 'center'}}>
        {SW_COLORS.map((c, i) => {
          const a = spring(f, a0 + 6 + i * 2, 0.4, 0.6);
          return <div key={i} style={{width: 44, height: 44, borderRadius: 22, background: c, transform: `scale(${a})`}} />;
        })}
        {f >= a0 + 10 && (
          <div
            style={{
              position: 'absolute',
              left: -6 + sel * 66,
              top: 0,
              width: 56,
              height: 56,
              borderRadius: 28,
              boxShadow: `inset 0 0 0 2.5px ${C.ink}`,
              opacity: arrive(f, a0 + 10, 0.3),
            }}
          />
        )}
      </div>
    </div>
  );
};

// ---- scene -----------------------------------------------------------------------------------
// one motion-blur sample: paper, then the player through the camera at the sub-frame time
const Stage: React.FC<{f: number; ff: number}> = ({f, ff}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: C.paper}} />
    <CamStage
      cam={camAt(ff)}
      st={playerAt(f)}
      around={
        <>
          <Tooltip f={f} />
          <Diamond f={f} />
        </>
      }
    />
  </AbsoluteFill>
);

const SHUTTER = 0.5;

export const Chapter3: React.FC<{f: number}> = ({f}) => {
  if (f < T.cardC - 8 || f > T.price + 12) return null;
  const n = nSamples(camDispOf(camAt, f, SHUTTER, PL), 4, 32);
  return (
    <AbsoluteFill>
      {f < CS3 ? (
        f >= T.cardC && <AbsoluteFill style={{background: C.violet}} />
      ) : (
        <AbsoluteFill style={{transform: pushIn(f, CS3 + 18, 0.00018, 1100, 560), transformOrigin: '0 0'}}>
          <Samples f={f} n={n} shutter={SHUTTER} render={(ff) => <Stage f={f} ff={ff} />} />
          <FeatureText f={f} tag="Conversão" tagColor={C.violet} items={[{at: 764, until: 822, lines: ['BOTÃO', 'DELAY'], support: 'Surge no minuto que você escolher.'}]} />
          <FeatureText f={f} tag="Conversão" tagColor={C.violet} top={250} items={[{at: T.controles + 2, until: T.aparencia - 6, lines: ['CONTROLES'], support: 'Mostre só o que quiser.'}]} />
          <Checklist f={f} top={498} />
          <AparenciaText f={f} />
        </AbsoluteFill>
      )}
      <ChapterWord f={f} word="CONVERSÃO" start={T.cardC - 7} exitAt={T.delay} color="#FFFFFF" dotAt={T.cardC + 14} />
    </AbsoluteFill>
  );
};
