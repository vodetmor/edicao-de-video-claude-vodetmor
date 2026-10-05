import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, DISPLAY, TEXT} from '../theme';
import {T} from '../timeline';
import {arrive, clamp, E, lerp, nSamples, prog, Samples, WordsLine} from '../kit';
import {buildWord, ICON_C, IconState, Lockup, Place} from '../Logo';
import {DOT} from '../logoData';
import {Ball, camBetween, FLAP_D, flapsDisp, Guides, landGive, makeWink, P_BIG, P_LOCK, socketDot} from './Opening';
import {flapAngle, flapBed, flapOp, FoldIcon} from '../FoldIcon';

// THE MARK REBUILDS · black. A dial fills while +2.000 counts up with the dot riding its edge; the dial
// collapses into the dot, which compresses in near silence (anticipation), then launches: the ribbons
// return from the sides they left from, the play triangle snaps, the dot lands in its socket, the
// camera pulls back and the wordmark builds exactly as in the opening. Then the offer.
const F0 = T.final; // 1260
const DIAL = {cx: 960, cy: 500, R: 300};
const FILL = {a: F0 + 4, b: F0 + 20}; // then +2.000 holds 14 frames before the collapse
const COLLAPSE = {a: F0 + 34, d: 10}; // after the hold on +2.000, everything spirals into the dot
const ANT = COLLAPSE.a + COLLAPSE.d; // 1304 = T.anticip: the dot is home, the anticipation starts
const REL = T.release; // 1316
// 1332: the mark locks (the guides flash). The play triangle stays negative space all through the rebuild:
// a white SNAP here, a press and a cut back to black read as a 7-frame flicker (v4 critique)
const SNAP = REL + 16;
// the cool and purple ribbons come back the way they built the mark in the opening: paper flaps that fall
// onto the icon from its left and bottom edges, the purple one landing a frame before the SNAP
const FLAPS = {cool: REL + 3, warm: 0, purple: REL + 5}; // 1319 -> 1329, 1321 -> 1331
const ASSEMBLED = FLAPS.purple + FLAP_D + 10; // 1341
const LAND = T.rebuildLand; // 1344
const PULL = {a: LAND, d: 30};
const WORD = T.wordmark2; // 1354
const CTA = T.cta; // 1376

const collapseC = (f: number) => prog(f, COLLAPSE.a, COLLAPSE.d);
// the dial's scale: 1 while it fills, then it contracts into the center, accelerating (sucked in)
const dialK = (f: number) => 1 - E.exit(collapseC(f));
// a slow push while it fills and holds, so the +2.000 hold never freezes; the contraction multiplies it
const dialS = (f: number) => (1 + 0.0008 * Math.max(0, f - F0)) * dialK(f);
const fillP = (f: number) => E.prod(prog(f, FILL.a, FILL.b - FILL.a));

const Dial: React.FC<{f: number}> = ({f}) => {
  const k = dialS(f);
  if (k <= 0.01) return null;
  const R = DIAL.R * k;
  const draw = E.prod(prog(f, F0, 12));
  const p = fillP(f);
  const circ = 2 * Math.PI * R;
  const fade = clamp(dialK(f) / 0.35); // hairlines and ticks dissolve in the last third of the contraction
  const ticks: React.ReactNode[] = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    const passed = i / N <= p;
    const show = clamp((draw - i / N) * 6) * fade;
    if (show <= 0) continue;
    const r0 = R + 10 * k;
    const r1 = R + (i % 5 === 0 ? 30 : 20) * k;
    ticks.push(
      <line
        key={i}
        x1={DIAL.cx + Math.cos(a) * r0}
        y1={DIAL.cy + Math.sin(a) * r0}
        x2={DIAL.cx + Math.cos(a) * r1}
        y2={DIAL.cy + Math.sin(a) * r1}
        stroke="#fff"
        strokeOpacity={(passed ? 0.75 : 0.2) * show}
        strokeWidth={2 * Math.max(0.5, k)}
      />,
    );
  }
  const R2 = R + 46 * k;
  const circ2 = 2 * Math.PI * R2;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={DIAL.cx} cy={DIAL.cy} r={R} fill="none" stroke="#fff" strokeOpacity={0.16 * fade} strokeWidth={2} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${DIAL.cx} ${DIAL.cy})`} />
      <circle cx={DIAL.cx} cy={DIAL.cy} r={R2} fill="none" stroke="#fff" strokeOpacity={0.08 * fade} strokeWidth={1.5} strokeDasharray={`${circ2} ${circ2}`} strokeDashoffset={circ2 * (1 - draw)} transform={`rotate(-90 ${DIAL.cx} ${DIAL.cy})`} />
      {ticks}
      {p > 0 && (
        <circle cx={DIAL.cx} cy={DIAL.cy} r={R} fill="none" stroke="#fff" strokeWidth={4 * Math.max(0.6, k)} strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - p)} transform={`rotate(-90 ${DIAL.cx} ${DIAL.cy})`} />
      )}
    </svg>
  );
};

// the protagonist dot: rides the dial head, spirals in with the contraction (one turn, angular speed rising
// as the radius falls), compresses in the center, then launches
const dotAt = (f: number) => {
  const d0 = 44;
  if (f < ANT) {
    const c = collapseC(f);
    const a = f < COLLAPSE.a ? fillP(f) * 2 * Math.PI - Math.PI / 2 : -Math.PI / 2 + 2 * Math.PI * E.inQuad(c);
    const R = DIAL.R * dialS(f);
    return {x: DIAL.cx + Math.cos(a) * R, y: DIAL.cy + Math.sin(a) * R, d: d0, aspect: 1, show: arrive(f, F0 + 2, 0.3)};
  }
  if (f < REL) {
    // anticipation: slow build, it grows to the ball size, squashes and draws back
    const u = E.inQuad(prog(f, ANT, REL - ANT));
    return {x: DIAL.cx, y: DIAL.cy + 26 * u, d: lerp(d0, 94, E.expr(prog(f, ANT, 8))), aspect: 1 + 0.75 * u, show: 1};
  }
  // release: straight up out of frame, stretched
  const t = f - REL;
  const y = DIAL.cy + 26 - (30 * t + 9 * t * t);
  return {x: DIAL.cx, y, d: 94, aspect: t === 0 ? 0.62 : 0.48, show: y > -120 ? 1 : 0};
};

const Counter: React.FC<{f: number}> = ({f}) => {
  const k = dialS(f);
  if (dialK(f) <= 0.15) return null;
  const p = fillP(f);
  const n = Math.round(2000 * p);
  const inA = arrive(f, F0 + 4, 0.2);
  // it rides the contraction: scaled about the dial center with the ring, fading as it gets small
  const op = clamp(inA * 1.5) * clamp((dialK(f) - 0.15) / 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${DIAL.cx}px, ${DIAL.cy}px) scale(${k}) translate(${-DIAL.cx}px, ${-DIAL.cy}px)`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: DIAL.cy - 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op, transform: `translateY(${(1 - inA) * 30}px)`}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontStretch: '64%', fontSize: 190, lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>+{n.toLocaleString('pt-BR')}</div>
        <div style={{fontFamily: TEXT, fontWeight: 500, fontSize: 36, color: '#fff', opacity: 0.7, marginTop: 6}}>usuários satisfeitos</div>
      </div>
    </div>
  );
};

// ---- the rebuild ------------------------------------------------------------------------------
const rebuildIcon = (ff: number, place: Place): IconState => {
  // warm returns from the camera (reverse of the deconstruction); cool and purple fall back in as flaps
  const g = E.outCubic(prog(ff, REL, 16));
  const sc = Math.pow(26, 1 - g);
  const piv = {x: place.cx + (DOT.cx - ICON_C) * place.s, y: place.cy + (DOT.cy - ICON_C) * place.s};
  const dx = ((960 - piv.x) / place.s) * (1 - g);
  const dy = ((540 - piv.y) / place.s) * (1 - g);
  const off = {op: 0};
  return {
    cool: off,
    warm: {s: sc, px: DOT.cx, py: DOT.cy, x: dx, y: dy, flat: clamp((sc - 1.2) / 1.6), op: ff >= REL ? 1 : 0},
    purple: off,
    tri: {fill: '#FFFFFF', op: 0},
    assembled: ff >= ASSEMBLED,
    noHole: false,
  };
};

// How far the fastest visible edge travels during the shutter: the warm ribbon's scale (edges up to ~1100 px
// from its pivot), the cool ribbon along x and the purple one along y (with their small rotations).
const SHUTTER = 0.55;
const rebuildDisp = (f: number) => {
  const a = f - SHUTTER / 2;
  const b = f + SHUTTER / 2;
  const g = (ff: number) => E.outCubic(prog(ff, REL, 16));
  const warm = 1100 * Math.log(26) * Math.abs(g(b) - g(a));
  return Math.max(warm, flapsDisp(f, P_BIG.s, {cool: FLAPS.cool, warm: -99, purple: FLAPS.purple}, SHUTTER));
};
const flapsAt = (ff: number) => ({
  cool: {ang: flapAngle(ff, FLAPS.cool, FLAP_D), op: flapOp(ff, FLAPS.cool), bed: flapBed(ff, FLAPS.cool, FLAP_D)},
  warm: {ang: 0, op: 0},
  purple: {ang: flapAngle(ff, FLAPS.purple, FLAP_D), op: flapOp(ff, FLAPS.purple), bed: flapBed(ff, FLAPS.purple, FLAP_D)},
});

// THE BUTTON: once the offer has landed, the dot gives one last small hop in its socket, the way it bounced
// in the opening (on the bar line), and the icon gives under it
export const WINK = 1400;
const wink = makeWink(WINK);

export const Finale: React.FC<{f: number}> = ({f}) => {
  if (f < F0) return null;
  let place: Place = P_BIG;
  if (f >= PULL.a) place = camBetween(P_BIG, P_LOCK, E.cam(prog(f, PULL.a, PULL.d)));
  if (f >= PULL.a + PULL.d) {
    const k = 1 + 0.0009 * (f - (PULL.a + PULL.d));
    place = {cx: 960 + (place.cx - 960) * k, cy: 520 + (place.cy - 520) * k, s: place.s * k};
  }
  // the icon gives under the flaps, the SNAP and the dot's last landing (about its center)
  const give = landGive(f, [FLAPS.cool + FLAP_D, FLAPS.purple + FLAP_D, wink.land], [0.007, 0.01, 0.008]);
  const iconPlace: Place = {...place, s: place.s * give};
  const rebuilding = f >= REL;
  const n = f >= REL && f < ASSEMBLED ? nSamples(rebuildDisp(f), 4, 48) : 1;
  const d = dotAt(f);
  const word = f >= WORD ? buildWord(f, WORD, WORD + 8) : null;
  let socket: React.ReactNode = null;
  if (f >= LAND - 14) {
    const sd = socketDot(f, iconPlace, LAND, -80);
    const wa = wink.active(f) ? wink.aspect(f) : sd.aspect;
    // squashed on the landing frame, the dot sits on the icon: its center drops by the lost height
    const settle = f === wink.land ? (sd.d / 2) * (1 - 1 / Math.sqrt(wa)) : 0;
    if (sd.visible) socket = <Ball x={sd.x} y={sd.y + wink.dy(f) + settle} aspect={wa} angle={0} d={sd.d} />;
  }
  return (
    <AbsoluteFill style={{background: C.black}}>
      <Dial f={f} />
      <Counter f={f} />
      {rebuilding && (
        <Samples
          f={f}
          n={n}
          shutter={SHUTTER}
          render={(ff, i) => (
            <>
              {/* the coral field comes back from the camera and lands last (f1332): until then it is in front of
                  the flaps, so it uncovers them as it recedes instead of a flap being drawn over it */}
              {ff >= FLAPS.cool - 1 && ff < ASSEMBLED && <FoldIcon place={iconPlace} flaps={flapsAt(ff)} uid={`ff${i}`} />}
              <Lockup place={iconPlace} icon={rebuildIcon(ff, iconPlace)} word={null} uid={`fn${i}`} stage={C.black} />
            </>
          )}
        />
      )}
      {word && <Lockup place={place} icon={null} word={word} uid="fnw" stage={C.black} />}
      <Guides f={f} place={P_BIG} at={SNAP} />
      {d.show > 0 && f < REL + 10 && <Ball x={d.x} y={d.y} aspect={d.aspect} angle={0} d={d.d} />}
      {socket}
      {f >= CTA && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          <WordsLine f={f} text="Teste por 7 dias grátis." start={CTA} size={56} weight={700} color="#FFFFFF" stagger={3} />
          <WordsLine f={f} text="vslplay.com" start={CTA + 12} size={34} weight={500} color="rgba(255,255,255,.62)" stagger={2} />
        </div>
      )}
    </AbsoluteFill>
  );
};

