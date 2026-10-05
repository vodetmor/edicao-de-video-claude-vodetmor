import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, TEXT} from '../theme';
import {T} from '../timeline';
import {approach, arrive, clamp, E, lerp, nSamples, prog, spring, tween, vel, Samples, WordsLine} from '../kit';
import {buildWord, dotSocket, ICON_C, IconState, Lockup, Place, TRI_C} from '../Logo';
import {flapAngle, flapBed, flapOp, flapSpeed, Flaps, FoldIcon} from '../FoldIcon';
import {DOT, ICON} from '../logoData';

// ---- places -------------------------------------------------------------
export const S_BIG = 795 / ICON; // dot = 94 px, exactly the bouncing ball
export const P_BIG: Place = {cx: 960, cy: 540, s: S_BIG};
export const S_LOCK = 1300 / 3324;
export const P_LOCK: Place = {cx: 310 + 392.5 * S_LOCK, cy: 492, s: S_LOCK};
const P_SPLIT: Place = {cx: 960, cy: 540, s: 560 / ICON};

export const camBetween = (a: Place, b: Place, t: number): Place => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  s: a.s * Math.pow(b.s / a.s, t),
});

// ---- the bouncing dot (measured on ref-brain) -----------------------------
const GROUND = 770;
const D = 94; // ball diameter
const Y_REST = GROUND - D / 2; // 723
const SOCKET = dotSocket(P_BIG); // (1178, 319.8)
const X1 = SOCKET.x;
const HEIGHTS = [383.7, 269, 174]; // each bounce 0.68-0.70 of the previous
// horizontal speed per arc (px/frame): ref-brain crosses ~68% of the width at 21-28 px/frame; each impact
// takes a little speed off, and the last arc ends exactly under the socket
const XSPEED = [26, 24, 20, 14]; // the fall 4-14, then the three arcs
const XK = (() => {
  const keys = [T.dropStart, 14, 28, 42, 56];
  const xs = [X1];
  for (let i = 3; i >= 0; i--) xs.unshift(xs[0] - XSPEED[i] * (keys[i + 1] - keys[i]));
  return keys.map((f, i) => ({f, x: xs[i]}));
})();

export const ballX = (f: number) => {
  if (f <= XK[0].f) return XK[0].x;
  for (let i = 1; i < XK.length; i++) if (f <= XK[i].f) return lerp(XK[i - 1].x, XK[i].x, (f - XK[i - 1].f) / (XK[i].f - XK[i - 1].f));
  return X1;
};
export const ballY = (f: number) => {
  if (f <= 14) {
    const u = clamp((f - T.dropStart) / 10);
    return Y_REST - 783 * (1 - u * u);
  }
  for (let i = 0; i < 3; i++) {
    const a = 14 + 14 * i;
    if (f <= a + 14) {
      const u = (f - a) / 14;
      return Y_REST - 4 * HEIGHTS[i] * u * (1 - u);
    }
  }
  if (f <= T.launch) return Y_REST;
  const t = f - T.launch;
  return Y_REST - 22 * t - 0.5 * 14 * t * t;
};
// aspect = width / height (area preserved). Measured: 2.6 on the impact frame, 0.98 then 0.74 after it,
// 0.60 at top speed, 1.16 flattening at the apex.
const ballAspect = (f: number) => {
  const imp = [14, 28, 42];
  if (imp.includes(f)) return 2.6;
  if (f === 56 || f === 57) return 2.85; // anticipation: heavier squash held 2 frames
  if (imp.includes(f - 1)) return 0.98;
  if (f === 58) return 0.8;
  const vy = vel(ballY, f);
  const sp = clamp(Math.abs(vy) / 130);
  let a = lerp(1, 0.6, Math.pow(sp, 0.9));
  // at the apex the ball is rotated to its (horizontal) velocity, so a screen-wide 1.16 is 1/1.16 locally
  if (Math.abs(vy) < 14 && f > 14 && f < 56) a = lerp(1 / 1.16, a, clamp(Math.abs(vy) / 14));
  if (f > 58) a = lerp(0.5, 0.45, clamp((f - 58) / 8));
  return a;
};

export const Ball: React.FC<{x: number; y: number; aspect: number; angle: number; d?: number; color?: string}> = ({
  x,
  y,
  aspect,
  angle,
  d = D,
  color = '#FFFFFF',
}) => {
  const w = d * Math.sqrt(aspect);
  const h = d / Math.sqrt(aspect);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: '50%',
        background: color,
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
};

const IMPACTS = [14, 28, 42, 56];
const ballState = (f: number) => {
  const fi = Math.round(f);
  const sharp = Math.abs(f - fi) < 1e-6;
  const x = ballX(f);
  const a = ballAspect(sharp ? fi : f);
  const impact = sharp && [14, 28, 42, 56, 57].includes(fi);
  const h = D / Math.sqrt(a);
  const y = impact ? GROUND - h / 2 : ballY(f);
  const vx = vel(ballX, f);
  const vy = vel(ballY, f);
  const angle = impact ? 0 : (Math.atan2(vy, vx) * 180) / Math.PI - 90;
  return {x, y, a, angle};
};
const BALL_SHUTTER = 0.5;

const BounceDot: React.FC<{f: number}> = ({f}) => {
  if (f < T.dropStart || f > 70) return null;
  // onion skins trace only the arc in flight (earlier arcs piled into a tangle)
  const arcStart = Math.max(T.dropStart, ...IMPACTS.filter((i) => i <= f));
  const onion: React.ReactNode[] = [];
  for (let g = Math.max(arcStart, f - 22); g < f; g += 2) {
    if (g > T.launch + 2) continue;
    const age = (f - g) / 22;
    // they are gone by f66, before the triangle outline closes on the vertex they would sit on at the SNAP
    const clear = clamp((66 - f) / 6);
    if (clear <= 0) continue;
    onion.push(
      <div
        key={g}
        style={{
          position: 'absolute',
          left: ballX(g) - D / 2,
          top: ballY(g) - D / 2,
          width: D,
          height: D,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,1)',
          boxSizing: 'border-box',
          opacity: 0.42 * (1 - age) * clear,
        }}
      />,
    );
  }
  // above 60 px/frame the ball smears along its path (ref-brain); impact frames and their neighbours stay
  // crisp so the squash reads for exactly one frame
  const speed = Math.hypot(vel(ballX, f), vel(ballY, f));
  const nearImpact = IMPACTS.some((i) => Math.abs(f - i) <= 1) || f === 57;
  const n = speed > 60 && !nearImpact ? nSamples(speed * BALL_SHUTTER, 3, 24) : 1;
  return (
    <>
      {onion}
      <Samples
        f={f}
        n={n}
        shutter={BALL_SHUTTER}
        render={(ff) => {
          const b = ballState(n > 1 ? ff : f);
          return <Ball x={b.x} y={b.y} aspect={b.a} angle={b.angle} />;
        }}
      />
    </>
  );
};

// ---- icon build ----------------------------------------------------------------
// After the SNAP the three ribbons fall onto the icon as paper flaps hinged on its outer edges (cool on the
// left edge, warm on the top edge, purple on the bottom edge), each landing on a sixteenth of the beat and
// bouncing twice; the icon gives a little under each landing. Then the play button is pressed on the beat
// and the dot drops into its socket on the downbeat.
export const FLAP = {cool: 74, warm: 78, purple: 81}; // released; each lands 10 frames later (84, 88, 91)
export const FLAP_D = 10;
export const FLAPS_DONE = FLAP.purple + FLAP_D + 10; // 101: the last bounce has settled
export const flapsAt = (ff: number, t0 = FLAP): Flaps => ({
  cool: {ang: flapAngle(ff, t0.cool, FLAP_D), op: flapOp(ff, t0.cool), bed: flapBed(ff, t0.cool, FLAP_D)},
  warm: {ang: flapAngle(ff, t0.warm, FLAP_D), op: flapOp(ff, t0.warm), bed: flapBed(ff, t0.warm, FLAP_D)},
  purple: {ang: flapAngle(ff, t0.purple, FLAP_D), op: flapOp(ff, t0.purple), bed: flapBed(ff, t0.purple, FLAP_D)},
});
// the icon gives under each landing: down 2 frames, back up over 6
export const landGive = (ff: number, lands: number[], amps: number[]) =>
  1 -
  lands.reduce((acc, l, i) => {
    const t = ff - l;
    const k = t <= 0 ? 0 : t < 2 ? t / 2 : Math.max(0, 1 - (t - 2) / 6);
    return acc + amps[i] * E.expr(k);
  }, 0);
// far edge of a flap: about 420 logo units from its hinge
export const flapsDisp = (f: number, s: number, t0 = FLAP, shutter = 0.55) => {
  let d = 0;
  for (const k of ['cool', 'warm', 'purple'] as const) {
    d = Math.max(d, flapSpeed((ff) => flapAngle(ff, t0[k], FLAP_D), f, 420 * s * 1.35) * shutter);
  }
  return d;
};

export const buildIcon = (f: number, t0: {snap: number; press: number}) => {
  const outline = E.prod(prog(f, t0.snap - 12, 11));
  const snapped = f >= t0.snap;
  // SNAP: no easing, 4% overscale for exactly one frame
  let ts = f === t0.snap ? 1.04 : 1;
  // press: down to 0.97 (it bottoms out fast), the wall of its socket showing around it, then a quick
  // recovery; at the bottom the white turns into the stage (negative space)
  const pd = f - t0.press;
  if (pd >= 0) ts = pd <= 3 ? lerp(1, 0.97, 1 - (1 - pd / 3) ** 2) : lerp(0.97, 1, spring(f, t0.press + 3, 0.45, 0.8));
  const cut = f >= t0.press + 3; // at the bottom of the press the white triangle becomes the stage, on one frame
  const off = {op: 0};
  const icon: IconState = {
    cool: off,
    warm: off,
    purple: off,
    tri: {
      fill: '#FFFFFF',
      op: snapped && !cut ? 1 : 0,
      s: ts,
      outline: snapped ? 0 : outline,
      outlineOp: 1,
      outlineW: 3 / S_BIG,
      well: pd > 0 && !cut ? '#C4C4C4' : undefined,
    },
    assembled: f >= FLAPS_DONE,
  };
  return icon;
};

export const Guides: React.FC<{f: number; place: Place; at: number}> = ({f, place, at}) => {
  if (f < at || f > at + 4) return null;
  const o = 0.32 * (1 - (f - at) / 4); // linear: "no ease, on purpose"
  const X = (u: number) => place.cx + (u - ICON_C) * place.s;
  const Y = (u: number) => place.cy + (u - ICON_C) * place.s;
  const xs = [X(191), X(592)];
  const ys = [Y(165.9), Y(617.4)];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {xs.map((x) => (
        <line key={'x' + x} x1={x} y1={0} x2={x} y2={1080} stroke="#fff" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={'y' + y} x1={0} y1={y} x2={1920} y2={y} stroke="#fff" strokeWidth={1} />
      ))}
      {xs.flatMap((x) => ys.map((y) => <circle key={x + '-' + y} cx={x} cy={y} r={7} fill="none" stroke="#fff" strokeWidth={1.2} />))}
      <circle cx={X(TRI_C.x)} cy={Y(TRI_C.y)} r={5} fill="#fff" />
    </svg>
  );
};

// ---- dot after the launch -------------------------------------------------------
export const socketDot = (f: number, place: Place, landAt: number, dropFrom = -70) => {
  const sk = dotSocket(place);
  const u = clamp((f - (landAt - 14)) / 14);
  const yFall = (ff: number) => lerp(dropFrom, sk.y, Math.pow(clamp((ff - (landAt - 14)) / 14), 2));
  if (f < landAt) {
    const vy = vel(yFall, f);
    const a = lerp(1, 0.62, clamp(vy / 60));
    return {x: sk.x, y: yFall(f), d: sk.r * 2, aspect: u <= 0 ? 1 : a, visible: f >= landAt - 14};
  }
  const d = f - landAt;
  const aspect = d === 0 ? 1.9 : d === 1 ? 0.92 : d === 2 ? 1.05 : 1;
  return {x: sk.x, y: sk.y + (d === 0 ? sk.r * (1 - 1 / Math.sqrt(1.9)) : 0), d: sk.r * 2, aspect, visible: true};
};

// icon state for the opening at time ff; SNAP / press / outline stay exact to the current frame
const openingIcon = (ff: number, place: Place, fSharp: number, decon = true): IconState => {
  const times = {snap: T.snap, press: T.press};
  const icon = buildIcon(ff, times);
  icon.tri = buildIcon(fSharp, times).tri;
  if (decon && ff >= T.split) {
    // deconstruction: cool left, purple down, warm grows toward camera into the Coral field
    icon.assembled = false;
    const t = (d: number) => E.exit(prog(ff, T.split, d));
    icon.cool = {x: -1500 * t(13), rot: -14 * t(13), op: 1};
    icon.purple = {y: 1300 * t(13), rot: 10 * t(13), op: 1};
    const g = E.expr(prog(ff, T.split + 1, 15));
    const sc = Math.pow(26, g);
    const pivScreen = {x: place.cx + (DOT.cx - ICON_C) * place.s, y: place.cy + (DOT.cy - ICON_C) * place.s};
    const dx = ((960 - pivScreen.x) / place.s) * g;
    const dy = ((540 - pivScreen.y) / place.s) * g;
    icon.warm = {s: sc, px: DOT.cx, py: DOT.cy, x: dx, y: dy, flat: clamp((sc - 1.2) / 1.6), op: 1};
    icon.tri.op = 0;
  }
  return icon;
};

// How far the fastest edge travels during the shutter, so the samples stay <= 4 px apart: the flaps, and in
// the deconstruction the cool/purple exits and the warm field's visible edges (up to ~1100 px from its pivot).
const ICON_SHUTTER = 0.55;
const iconDisp = (f: number, s: number) => {
  const a = f - ICON_SHUTTER / 2;
  const b = f + ICON_SHUTTER / 2;
  let d = f < FLAPS_DONE ? flapsDisp(f, s, FLAP, ICON_SHUTTER) : 0;
  const t = (ff: number) => E.exit(prog(ff, T.split, 13));
  const g = (ff: number) => E.expr(prog(ff, T.split + 1, 15));
  d = Math.max(d, 1500 * s * Math.abs(t(b) - t(a)), 1100 * Math.log(26) * Math.abs(g(b) - g(a)));
  return d;
};

// a slow push while the mark builds (the pull back at the downbeat answers it), and the give under each flap
const LANDS = [FLAP.cool + FLAP_D, FLAP.warm + FLAP_D, FLAP.purple + FLAP_D];
const buildPlace = (f: number): Place => {
  const k = (1 + 0.035 * E.expr(prog(f, T.snap, 42))) * landGive(f, LANDS, [0.007, 0.007, 0.011]);
  return {cx: P_BIG.cx, cy: P_BIG.cy, s: P_BIG.s * k};
};

// ---- the button: the dot's last small hop in its socket ------------------------------------------------
// A 2-frame crouch, up `h` px and down onto the icon in `d` frames with a squash; the icon gives under it.
export const makeWink = (at: number, d = 12, h = 40) => {
  const dy = (f: number) => {
    if (f < at || f > at + d) return 0;
    const u = (f - at) / d;
    return -h * 4 * u * (1 - u);
  };
  const aspect = (f: number) => {
    const k = f - at;
    if (k === -2 || k === -1) return 1.28; // crouch
    if (k === d) return 1.7; // squash on landing
    if (k === d + 1) return 0.9;
    if (k === d + 2) return 1.05;
    if (k > 0 && k < d) return lerp(1, 0.78, clamp(Math.abs(vel(dy, f)) / 12));
    return 1;
  };
  return {at, d, dy, aspect, land: at + d, active: (f: number) => f >= at - 2 && f <= at + d + 2};
};

// ---- scene ---------------------------------------------------------------
// `sting`: the standalone logo animation. Same build; the lockup settles in the center of the frame, no tagline
// and no deconstruction, and the dot gives its last hop at `wink`.
export type StingOpts = {cy: number; wink: number; transparent?: boolean};
export const Opening: React.FC<{f: number; sting?: StingOpts}> = ({f, sting}) => {
  if (!sting && f >= T.cardA + 2) return null;
  const LOCK: Place = sting ? {...P_LOCK, cy: sting.cy} : P_LOCK;
  const decon = !sting;

  // camera
  let place: Place = buildPlace(Math.min(f, T.pullback));
  if (f >= T.pullback) place = camBetween(buildPlace(T.pullback), LOCK, E.cam(prog(f, T.pullback, T.pullbackDur)));
  if (decon && f >= T.decon + 2) place = camBetween(P_LOCK, P_SPLIT, E.cam(prog(f, T.decon + 2, 22)));
  // gentle push-in during the lockup hold (nothing freezes)
  if (f >= T.pullback + T.pullbackDur && (!decon || f < T.decon + 2)) {
    const k = 1 + 0.0009 * (f - (T.pullback + T.pullbackDur));
    const oy = sting ? sting.cy : 520;
    place = {cx: 960 + (place.cx - 960) * k, cy: oy + (place.cy - oy) * k, s: place.s * k};
  }
  const wk = sting ? makeWink(sting.wink) : null;
  // the icon (and its dot) give under the dot's last landing; the wordmark does not move
  const iconPlace: Place = wk ? {...place, s: place.s * landGive(f, [wk.land], [0.008])} : place;

  const word = f >= T.vsl ? buildWord(f, T.vsl, T.play, decon && f >= T.decon ? T.decon : undefined) : null;
  const fieldIn = decon ? prog(f, T.cardA - 3, 3) : 0;

  // dot
  let dot: React.ReactNode = null;
  if (f >= T.dotLand - 14 && (!decon || f < T.split + 14)) {
    const sd = socketDot(f, iconPlace, T.dotLand);
    let {x, y} = sd;
    let aspect = sd.aspect;
    if (decon && f >= T.split) {
      const up = (ff: number) => -900 * E.exit(prog(ff, T.split, 12));
      y += up(f);
      aspect = lerp(1, 0.5, clamp(Math.abs(vel(up, f)) / 60));
    }
    if (wk && wk.active(f)) {
      aspect = wk.aspect(f);
      // squashed on the landing frame, the dot sits on the icon: its center drops by the lost height
      y += wk.dy(f) + (f === wk.land ? (sd.d / 2) * (1 - 1 / Math.sqrt(aspect)) : 0);
    }
    if (sd.visible) dot = <Ball x={x} y={y} aspect={aspect} angle={0} d={sd.d} />;
  }

  const lineL = f < T.lineRetract ? lerp(960, 200, E.prod(prog(f, 0, 12))) : lerp(200, 960, E.exit(prog(f, T.lineRetract, 10)));
  const lineR = f < T.lineRetract ? lerp(960, 1720, E.prod(prog(f, 0, 12))) : lerp(1720, 960, E.exit(prog(f, T.lineRetract, 10)));
  const ribbonsMoving = f >= FLAP.cool && f < FLAPS_DONE;
  const splitMoving = decon && f >= T.split && f < T.cardA;

  return (
    <AbsoluteFill style={{background: sting?.transparent ? undefined : C.black}}>
      {lineR - lineL > 1 && (
        <div style={{position: 'absolute', left: lineL, top: GROUND, width: lineR - lineL, height: 1.5, background: 'rgba(255,255,255,.3)'}} />
      )}
      <BounceDot f={f} />
      {f >= T.snap - 12 && (
        <Samples
          f={f}
          n={splitMoving || ribbonsMoving ? nSamples(iconDisp(f, place.s), 4, 48) : 1}
          shutter={ICON_SHUTTER}
          render={(ff, i) => {
            const pl = f < T.pullback ? buildPlace(ff) : iconPlace;
            return (
              <>
                <Lockup place={pl} icon={openingIcon(ff, pl, f, decon)} word={null} uid={`op${i}`} stage={C.black} />
                {ff >= FLAP.cool - 1 && ff < FLAPS_DONE && (
                  // the white card under the flaps until the press, where the socket's wall shows around the button
                  <FoldIcon place={pl} flaps={flapsAt(ff)} uid={`fo${i}`} band={ff < T.press + 0.5 ? '#FFFFFF' : undefined} />
                )}
              </>
            );
          }}
        />
      )}
      {word && <Lockup place={place} icon={null} word={word} uid="opw" stage={C.black} />}
      <Guides f={f} place={P_BIG} at={T.snap} />
      {dot}
      {decon && f >= T.tagline && f < T.decon + 14 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center'}}>
          <WordsLine
            f={f}
            text="Banda e cliques ilimitados."
            start={T.tagline}
            size={56}
            weight={700}
            color="rgba(255,255,255,.9)"
            stagger={3}
            exitAt={T.decon}
          />
        </div>
      )}
      {fieldIn > 0 && <AbsoluteFill style={{background: C.coral, opacity: fieldIn}} />}
    </AbsoluteFill>
  );
};
