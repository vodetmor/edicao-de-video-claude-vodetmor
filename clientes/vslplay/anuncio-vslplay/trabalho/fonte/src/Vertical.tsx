import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, TEXT} from './theme';
import {mixColor} from './kit';
import {useFonts} from './Fonts';
import {E, LAYOUT, PLAYBACK, prog} from './kit';
import {rateAt, srcAt} from './warp';
import {Stage, useTextures} from './Ad';
import {NoVideo} from './Player';

// ================================================================================================
// VERTICAL 1080 x 1920. The same stage (same timing, same motion, same sound) framed as panels: each panel
// shows a rectangle of the 1920 x 1080 stage, scaled, at a place on the tall frame. A shot lists two panels
// (full-bleed shots give both the same rect); between shots the rects morph, so the frame splits into
// text-on-top / player-below and joins again on the beat of the original transitions.
// The ground is the stage's own empty corner stretched to the frame, so it always has the scene's color.
// ================================================================================================
type Panel = {sx: number; sy: number; sw: number; sh: number; s: number; dx: number; dy: number};
type Shot = {at: number; d: number; p: [Panel, Panel]};

const VW = 1080;
const VH = 1920;
// a stage rect, scaled by s, centred horizontally (or at dx) with its top at dy (or centred at cy)
const pan = (sx: number, sy: number, sw: number, sh: number, s: number, o: {dy?: number; cy?: number; dx?: number} = {}): Panel => ({
  sx, sy, sw, sh, s,
  dx: o.dx ?? (VW - sw * s) / 2,
  dy: o.dy ?? (o.cy ?? VH / 2) - (sh * s) / 2,
});
const one = (p: Panel): [Panel, Panel] => [p, p];

// full-bleed framings
const LOGO = pan(280, 0, 1360, 1080, VW / 1360, {cy: 900});
const CARD = pan(40, 0, 1840, 1080, VW / 1840, {cy: 900});
// feature scenes: the text column on top, the player window below
const TXT = (sy = 300, sh = 440, s = 1.45) => pan(60, sy, 560, sh, s, {dx: 40, dy: 470 - (sh * s) / 2});
const WINP = pan(630, 80, 1210, 920, 0.86, {dy: 860});
const FEAT: [Panel, Panel] = [TXT(), WINP];
const FEAT_TALL: [Panel, Panel] = [pan(60, 230, 560, 660, 1.12, {dx: 40, dy: 130}), WINP];
// price (vertical layout of the scene itself: see LAYOUT in kit)
const PRICE = one(pan(40, 110, 1040, 960, 1.0, {dx: 20, cy: 960}));
const MORE: [Panel, Panel] = [pan(60, 360, 620, 340, 1.3, {dx: 20, dy: 330}), pan(760, 250, 870, 560, 1.2, {dx: 18, dy: 830})];
const INTEGR = one(pan(420, 130, 1080, 900, 1.0, {cy: 940}));

// d: frames of the morph that ends at `at` (source frames)
const SHOTS: Shot[] = [
  {at: 0, d: 0, p: one(LOGO)},
  {at: 236, d: 0, p: one(CARD)},
  {at: 294, d: 12, p: FEAT},
  {at: 492, d: 8, p: one(CARD)},
  {at: 532, d: 12, p: FEAT},
  {at: 716, d: 8, p: one(CARD)},
  {at: 756, d: 12, p: FEAT},
  {at: 826, d: 8, p: FEAT_TALL},
  {at: 896, d: 8, p: FEAT},
  {at: 961, d: 0, p: PRICE}, // cut as the whip starts: the old scene slides out, the price slides in
  {at: 1078, d: 0, p: MORE},
  {at: 1162, d: 0, p: INTEGR},
  {at: 1260, d: 0, p: one(LOGO)},
];

const mix = (a: Panel, b: Panel, t: number): Panel => {
  const r = {} as Panel;
  (Object.keys(a) as (keyof Panel)[]).forEach((k) => (r[k] = a[k] + (b[k] - a[k]) * t));
  return r;
};
const panelsAt = (f: number): [Panel, Panel] => {
  let i = 0;
  while (i + 1 < SHOTS.length && f >= SHOTS[i + 1].at - SHOTS[i + 1].d) i++;
  const cur = SHOTS[i];
  if (i > 0 && cur.d > 0 && f < cur.at) {
    const t = E.expr(prog(f, cur.at - cur.d, cur.d));
    const prev = SHOTS[i - 1].p;
    return [mix(prev[0], cur.p[0], t), mix(prev[1], cur.p[1], t)];
  }
  return cur.p;
};

const View: React.FC<{p: Panel; f: number; fo: number}> = ({p, f, fo}) => (
  <div style={{position: 'absolute', left: p.dx, top: p.dy, width: p.sw * p.s, height: p.sh * p.s, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${p.s}) translate(${-p.sx}px, ${-p.sy}px)`}}>
      <Stage f={f} fo={fo} chrome={false} />
    </div>
  </div>
);

// The ground behind the panels: each scene's own field color, switching (4-frame blend) where the stage's
// field changes. (An earlier version stretched an empty corner of the stage 240x; Chrome hangs rasterizing it.)
const GROUND: [number, string][] = [
  [0, C.black], [245, C.coral], [290, C.paper], [497, C.cyan], [534, C.paper], [720, C.violet], [758, C.paper],
  [1078, C.black], [1162, C.paper], [1260, C.black],
];
const groundAt = (f: number) => {
  let i = 0;
  while (i + 1 < GROUND.length && f >= GROUND[i + 1][0]) i++;
  const t = i > 0 ? prog(f, GROUND[i][0], 4) : 1;
  return t < 1 ? mixColor(GROUND[i - 1][1], GROUND[i][1], t) : GROUND[i][1];
};

const same = (a: Panel, b: Panel) => (Object.keys(a) as (keyof Panel)[]).every((k) => Math.abs(a[k] - b[k]) < 0.01);

export const VStage: React.FC<{f: number; fo: number}> = ({f, fo}) => {
  LAYOUT.vertical = true;
  const [a, b] = panelsAt(f);
  return (
    <AbsoluteFill style={{background: groundAt(f), fontFamily: TEXT}}>
      {same(a, b) ? (
        <View p={a} f={f} fo={fo} />
      ) : (
        <>
          {/* one video decode per frame: the second copy of the stage (the text column) skips the presenter */}
          <NoVideo.Provider value>
            <View p={a} f={f} fo={fo} />
          </NoVideo.Provider>
          <View p={b} f={f} fo={fo} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const Vertical: React.FC = () => {
  useFonts();
  useTextures();
  const fo = useCurrentFrame();
  PLAYBACK.rate = rateAt(fo);
  return <VStage f={srcAt(fo)} fo={fo} />;
};

// the untimed stage (source frames), for stills
export const VerticalSrc: React.FC = () => {
  useFonts();
  useTextures();
  const f = useCurrentFrame();
  PLAYBACK.rate = 1;
  return <VStage f={f} fo={f} />;
};
