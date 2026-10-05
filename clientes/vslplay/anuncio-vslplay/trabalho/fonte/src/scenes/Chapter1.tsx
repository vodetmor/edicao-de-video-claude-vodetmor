import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, PL, TEXT} from '../theme';
import {T} from '../timeline';
import {arrive, E, lerp, nSamples, prog, Samples, spring, vel} from '../kit';
import {PlayerState, r} from '../Player';
import {CamStage} from '../CamStage';
import {
  Cam,
  camDispOf,
  camLerp,
  ChapterWord,
  ClickRing,
  CursorTrack,
  FeatureText,
  FULL,
  lerpRect,
  pressAt,
  pushCam,
  pushIn,
  timeStr,
  WIN,
} from './Common';
import {RibbonField} from './Ribbon';

// Chapter 1 · ATENÇÃO (Coral): Smart AutoPlay, Thumbnails, Continue Assistindo
const CS = 286; // the Coral field starts collapsing into the Smart AutoPlay box
const C0 = 4.6; // camera scale at which the box covers the frame
const BOX = {x: PL.x + PL.w / 2, y: PL.y + PL.h / 2};
const DUR = 1110; // 18:30
const SEEK_Y = PL.y + PL.h - 11 - r(3.5) - r(1) / 2;

const CLICK_SMART = T.smartClick; // 336
const CLICK_PAUSE = T.thumbsClick; // 392
const CLICK_CONT = T.contClick; // 462
const RESUME = CLICK_CONT + 2;
const T_PAUSE = (CLICK_PAUSE - CLICK_SMART) / 30; // where the viewer paused
const T_RESUME = 7 * 60 + 42; // 07:42, where the returning viewer picks up

const P_SMART = {x: 1335, y: 575};
const P_PAUSE = {x: 1160, y: 470};
const P_CONT = {x: 1000, y: 596};

// ---- feature camera ----------------------------------------------------------------------------
// Smart AutoPlay: the field collapse lands on the box at 1.6x and holds through the click, then pulls
// back. Thumbnails: a short punch-in on the pause click (the cover is there "na hora"), a drift, a pull
// back before the title swap. Continue assistindo: a push that frames the two buttons, the seek bar and
// the time readout; once the viewer resumes, it leans in on the knob as it jumps to 07:42.
const WC = {x: (WIN.l + WIN.r) / 2, y: (WIN.t + WIN.b) / 2}; // (1236, 540)
const REST: Cam = {ax: BOX.x, ay: BOX.y, cx: BOX.x, cy: BOX.y, s: 1};
const S_SMART = 1.6;
const PULL_S = {a: CLICK_SMART + 8, d: 14}; // 344 -> 358
const PUNCH = {d: 6, s: 1.1};
const PULL_T = {a: T.thumbs + 58, d: 12}; // 422 -> 434
const CONT_A = {x: 1130, y: 620};
const PUSH_K = {a: T.cont + 4, d: 18, s: 1.3}; // 438 -> 456

const thumbCam = (ff: number) => {
  const c = pushCam(BOX, WC, PUNCH.s, E.outCubic(prog(ff, CLICK_PAUSE, PUNCH.d)));
  const drift = 1 + 0.0012 * Math.max(0, ff - (CLICK_PAUSE + PUNCH.d));
  return {...c, s: c.s * drift};
};

const camAt = (ff: number): Cam => {
  if (ff < PULL_S.a) {
    const a = arrive(ff, CS, 0.2);
    return {ax: BOX.x, ay: BOX.y, cx: lerp(960, WC.x, a), cy: BOX.y, s: lerp(C0, S_SMART, a)};
  }
  if (ff < CLICK_PAUSE) return camLerp({ax: BOX.x, ay: BOX.y, cx: WC.x, cy: BOX.y, s: S_SMART}, REST, E.cam(prog(ff, PULL_S.a, PULL_S.d)));
  if (ff < PULL_T.a) return thumbCam(ff);
  if (ff < PUSH_K.a) return camLerp(thumbCam(PULL_T.a), REST, E.cam(prog(ff, PULL_T.a, PULL_T.d)));
  const c = pushCam(CONT_A, WC, PUSH_K.s, E.cam(prog(ff, PUSH_K.a, PUSH_K.d)));
  if (ff < RESUME) return c;
  // lean in on the knob's landing spot (07:42), slowly, until the wipe
  const lean = LEAN * E.cam(prog(ff, RESUME, 26));
  const k = {x: PL.x + r(1) + (PL.w - 2 * r(1)) * (T_RESUME / DUR), y: SEEK_Y};
  const ks = {x: c.cx + c.s * (k.x - c.ax), y: c.cy + c.s * (k.y - c.ay)};
  return {ax: k.x, ay: k.y, cx: ks.x, cy: ks.y, s: c.s * (1 + lean)};
};
const LEAN = 0.08;
// the frame closes in from the full Coral field to the stage window as the field collapses
const collapseK = (ff: number) => arrive(ff, CS, 0.2);

const playerAt = (f: number): PlayerState => {
  const base = {x: PL.x, y: PL.y, w: PL.w, h: PL.h, primary: C.coral, radius: 12};
  // 1) smart autoplay (muted, looks like it is already playing)
  if (f < CLICK_SMART) {
    const content = arrive(f, CS + 12, 0.2);
    const cyc = f - (CS + 16);
    const ph = cyc >= 0 ? (cyc % 45) / 45 : 0;
    const ping = ph > 0 && ph < 0.75 ? E.enter(ph / 0.75) : 0;
    const press = pressAt(f, CLICK_SMART);
    return {
      ...base,
      videoT: 2 + (f - CS) / 30,
      smart: {box: 1, content, ping: f < CS + 16 ? 0 : ping, collapse: -0.2 * press},
    };
  }
  // 2) click: overlay collapses, the video restarts from 00:00 with sound, controls slide up
  const tPlay = (f - CLICK_SMART) / 30;
  const controlsIn = arrive(f, CLICK_SMART + 1, 0.22);
  if (f < CLICK_PAUSE) {
    return {
      ...base,
      videoT: tPlay,
      smart: f < CLICK_SMART + 8 ? {box: 1, content: 1, ping: 0, collapse: E.exit(prog(f, CLICK_SMART, 7))} : undefined,
      controls: {show: controlsIn, paused: false, time: timeStr(tPlay), dur: '18:30', seek: tPlay / DUR, fake: 0},
    };
  }
  // 3) pause: the thumbnail is on screen the same frame
  const paused: PlayerState = {
    ...base,
    videoT: T_PAUSE,
    cover: {show: 1, settle: arrive(f, CLICK_PAUSE, 0.25)},
    bigPlay: spring(f, CLICK_PAUSE, 0.5, 0.55),
    controls: {show: 1, paused: true, time: timeStr(T_PAUSE), dur: '18:30', seek: T_PAUSE / DUR, fake: 0},
  };
  if (f < T.cont) return paused;
  // 4) later visit: the keep-watching cover in the primary color
  const enter = (ff: number) => {
    const v = -(1 - arrive(ff, T.cont, 0.25));
    return v > -0.0015 ? 0 : v;
  };
  if (f < RESUME) {
    const lift = enter(f);
    return {...paused, keep: {show: 1, lift, blur: Math.abs(vel(enter, f)) * PL.h * 0.18, pressA: pressAt(f, CLICK_CONT)}};
  }
  // 5) resume at 07:42
  const tRes = T_RESUME + (f - RESUME) / 30;
  const liftOut = (ff: number) => E.exit(prog(ff, RESUME, 11));
  return {
    ...base,
    videoT: 8.2 + (f - RESUME) / 30,
    keep: f < RESUME + 12 ? {show: 1, lift: liftOut(f), blur: Math.abs(vel(liftOut, f)) * PL.h * 0.18} : undefined,
    controls: {show: 1, paused: false, time: timeStr(tRes), dur: '18:30', seek: resumeSeek(f), fake: 0, knob: arrive(f, RESUME + 1, 0.3)},
  };
};
const resumeU = (f: number) => E.expr(prog(f, RESUME + 1, 12));
const resumeSeek = (f: number) => lerp(T_PAUSE / DUR, T_RESUME / DUR, resumeU(f));

// the hover tooltip rides the knob as it jumps to where the viewer left off, counting as it goes
const KnobTip: React.FC<{f: number}> = ({f}) => {
  if (f < RESUME + 1) return null;
  const x = PL.x + r(1) + (PL.w - 2 * r(1)) * resumeSeek(f);
  const a = arrive(f, RESUME + 1, 0.3);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 44,
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
        opacity: a,
        transform: `translateY(${(1 - a) * 10}px)`,
        boxShadow: '0 4px 10px rgba(0,0,0,.18)',
      }}
    >
      {timeStr(lerp(T_PAUSE, T_RESUME, resumeU(f)))}
    </div>
  );
};

const Hand: React.FC<{f: number}> = ({f}) => (
  <>
    <ClickRing f={f} at={CLICK_SMART} x={P_SMART.x} y={P_SMART.y} />
    <ClickRing f={f} at={CLICK_PAUSE} x={P_PAUSE.x} y={P_PAUSE.y} />
    <ClickRing f={f} at={CLICK_CONT} x={P_CONT.x} y={P_CONT.y} />
    <CursorTrack
      f={f}
      show={[306, 486]}
      clicks={[CLICK_SMART, CLICK_PAUSE, CLICK_CONT]}
      keys={[
        {at: 0, x: 1800, y: 1010},
        {at: 308, ...P_SMART, dur: 20},
        {at: CLICK_SMART + 8, x: 1420, y: 700, dur: 18},
        {at: 368, ...P_PAUSE, dur: 18},
        {at: T.cont + 4, ...P_CONT, dur: 20},
        {at: RESUME + 6, x: 1360, y: 640, dur: 20},
      ]}
    />
  </>
);

// one motion-blur sample: paper, the player through the camera at the sub-frame time, the hand
const Stage: React.FC<{f: number; ff: number}> = ({f, ff}) => {
  const cam = camAt(ff);
  const k = collapseK(ff);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: C.paper}} />
      <CamStage cam={cam} st={playerAt(f)} win={lerpRect(FULL, WIN, k)} radius={12 * cam.s * k} around={<KnobTip f={f} />} hand={<Hand f={f} />} />
    </AbsoluteFill>
  );
};

const SHUTTER = 0.5;

export const Chapter1: React.FC<{f: number}> = ({f}) => {
  if (f < T.cardA - 7 || f > T.cardB + 1) return null;
  const push = pushIn(f, CS + 16, 0.00022, 960, 560);
  const n = nSamples(camDispOf(camAt, f, SHUTTER, PL), 4, 32);
  return (
    <AbsoluteFill>
      {f < CS ? (
        f >= T.cardA - 3 && <AbsoluteFill style={{background: C.coral}} />
      ) : (
        <AbsoluteFill style={{transform: push, transformOrigin: '0 0'}}>
          <Samples f={f} n={n} shutter={SHUTTER} render={(ff) => <Stage f={f} ff={ff} />} />
          <FeatureText
            f={f}
            tag="Atenção"
            tagColor={C.coral}
            items={[
              {at: 296, until: 362, lines: ['SMART', 'AUTOPLAY'], support: 'O vídeo parece já estar em andamento.'},
              {at: 366, until: 432, lines: ['THUMBNAILS'], support: 'Pausou? Uma thumbnail persuasiva aparece na hora.'},
              {at: 436, until: 486, lines: ['CONTINUE', 'ASSISTINDO'], support: 'Continue de onde parou ou reinicie do começo.'},
            ]}
          />
        </AbsoluteFill>
      )}
      <ChapterWord f={f} word="ATENÇÃO" start={T.cardA - 6} exitAt={T.collapseA} color={C.ink} dotAt={T.cardA + 14} />
      <RibbonField f={f} kind="cool" start={T.wipeB - 2} growAt={T.wipeB + 4} full={T.cardB} />
    </AbsoluteFill>
  );
};
