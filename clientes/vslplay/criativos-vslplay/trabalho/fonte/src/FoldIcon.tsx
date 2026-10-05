import React from 'react';
import {staticFile} from 'remotion';
import {ICON, RIBBONS, RIBBON_TRANSFORM, SQUIRCLE, TRIANGLE} from './logoData';
import {ICON_C, Place, SvgImage} from './Logo';
import {clamp} from './kit';

// The mark's three ribbons as paper flaps. Each one is hinged on an outer edge of the squircle, stands up
// toward the camera and falls onto the icon under gravity, bouncing twice like the dot did. Real ribbon
// shapes and real textures (the hole of the play triangle is cut through each flap and turns with it),
// true perspective.
export type Kind = 'cool' | 'warm' | 'purple';
// `bed`: the flap has landed once, so the icon plane under it shows (see Bed)
export type Flap = {ang: number; op?: number; bed?: boolean};
export type Flaps = Record<Kind, Flap>;

const TEX: Record<Kind, string> = {cool: 'tex_cool.png', warm: 'tex_warm.png', purple: 'tex_purple.png'};
// the darkest color of each ribbon's own texture (sampled): a tilted flap and its shadow darken toward it,
// so the paper keeps its hue (a black overlay turned the warm ribbon khaki and the cool one slate)
const DARK: Record<Kind, string> = {cool: '#015CC7', warm: '#E44E7D', purple: '#5205C3'};
// hinge line in icon units and the rotation that lifts the flap toward the camera for a positive angle
const HINGE: Record<Kind, {ox: number; oy: number; rot: (a: number) => string}> = {
  cool: {ox: 0, oy: ICON_C, rot: (a) => `rotateY(${-a}deg)`}, // left edge
  warm: {ox: ICON_C, oy: 0, rot: (a) => `rotateX(${a}deg)`}, // top edge
  purple: {ox: ICON_C, oy: ICON, rot: (a) => `rotateX(${-a}deg)`}, // bottom edge
};
export const PERSP = 1500;

// Angle of a flap released at `s`: it falls from `a0` onto the icon in `d` frames (gravity, with a small
// push), then bounces to b1 and b2 degrees. Restitution ~0.3 like a card. Released at 70 degrees it reads as
// a sheet of paper from its first frame (from 86 it was an edge-on sliver for its first frames).
export const A0 = 70;
export const flapAngle = (f: number, s: number, d = 10, a0 = A0, b1 = 11, d1 = 6, b2 = 2.5, d2 = 4) => {
  const t = f - s;
  if (t <= 0) return a0;
  if (t < d) {
    const u = t / d;
    return a0 * (1 - (0.25 * u + 0.75 * u * u));
  }
  const t1 = t - d;
  if (t1 < d1) {
    const v = t1 / d1;
    return b1 * 4 * v * (1 - v);
  }
  const t2 = t1 - d1;
  if (t2 < d2) {
    const v = t2 / d2;
    return b2 * 4 * v * (1 - v);
  }
  return 0;
};
// a flap is on screen, whole, from the frame it is released
export const flapOp = (f: number, s: number) => (f > s - 0.5 ? 1 : 0);
// the icon plane under a flap shows once the flap has landed on it (it is covered on that frame)
export const flapBed = (f: number, s: number, d = 10) => f >= s + d;

// screen speed of a flap's far edge (px per frame) at the frame f, for the motion-blur sample count
export const flapSpeed = (angle: (ff: number) => number, f: number, reach: number) =>
  (Math.abs(angle(f + 0.5) - angle(f - 0.5)) * Math.PI * reach) / 180;

// a flap turned toward the camera turns away from the light: it darkens toward its own darkest color, at
// most 25% (standing at 70 degrees), a few percent on the bounces
const tiltShade = (a: number) => 0.25 * clamp((1 - Math.cos((a * Math.PI) / 180)) / (1 - Math.cos((A0 * Math.PI) / 180)));

const Ribbon: React.FC<{k: Kind; uid: string; shade: number}> = ({k, uid, shade}) => (
  <g clipPath={`url(#fb-${k}-${uid})`}>
    <g clipPath={`url(#fr-${k}-${uid})`}>
      <SvgImage href={staticFile(TEX[k])} width={ICON} height={ICON} />
      {shade > 0.003 && <rect x={0} y={0} width={ICON} height={ICON} fill={DARK[k]} opacity={clamp(shade)} style={{mixBlendMode: 'multiply'}} />}
    </g>
  </g>
);

const Clips: React.FC<{k: Kind; uid: string}> = ({k, uid}) => (
  <defs>
    <clipPath id={`fb-${k}-${uid}`}>
      <path d={`${SQUIRCLE} ${TRIANGLE}`} clipRule="evenodd" />
    </clipPath>
    <clipPath id={`fr-${k}-${uid}`}>
      <path d={RIBBONS[k]} transform={RIBBON_TRANSFORM} />
    </clipPath>
  </defs>
);

const FlapLayer: React.FC<{k: Kind; flap: Flap; s: number; uid: string}> = ({k, flap, s, uid}) => {
  const op = flap.op ?? 1;
  if (op <= 0.001) return null;
  const h = HINGE[k];
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: ICON * s,
        height: ICON * s,
        transformOrigin: `${h.ox * s}px ${h.oy * s}px`,
        transform: h.rot(flap.ang),
        opacity: op,
        backfaceVisibility: 'hidden',
      }}
    >
      <svg width={ICON * s} height={ICON * s} viewBox={`0 0 ${ICON} ${ICON}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <Clips k={k} uid={uid} />
        <Ribbon k={k} uid={uid} shade={tiltShade(flap.ang)} />
      </svg>
    </div>
  );
};

// What a bounce lifts the flap off. In v4 it was the black stage, so every bounce opened a black keyline
// around the triangle and along the seams. Now the flap's own footprint lies flat under it in its shadow,
// and while the triangle is white (`band`), the white card runs BAND units under the flap's edge: a lifted
// edge shows white next to the triangle and the ribbon's own shadow along the seams, never a black line.
// The band is cut only by the ribbon's raw path, which runs on into the triangle (the three meet at its
// center): white over the white triangle, so there is no seam of two anti-aliased edges on its outline.
const BED_SHADE = 0.4;
const BAND = 14;
const Bed: React.FC<{k: Kind; uid: string; band?: string}> = ({k, uid, band}) => (
  <>
    <Ribbon k={k} uid={`b${uid}`} shade={BED_SHADE} />
    {band && (
      <g clipPath={`url(#fr-${k}-b${uid})`}>
        <path d={TRIANGLE} fill={band} stroke={band} strokeWidth={2 * BAND} strokeLinejoin="round" />
      </g>
    )}
  </>
);

// `order` paints the flap that stands tallest (closest to the camera) last; the beds lie under all of them
export const FoldIcon: React.FC<{place: Place; flaps: Flaps; uid: string; band?: string}> = ({place, flaps, uid, band}) => {
  const {cx, cy, s} = place;
  const kinds = ['cool', 'warm', 'purple'] as Kind[];
  const order = kinds.slice().sort((p, q) => flaps[p].ang - flaps[q].ang);
  const beds = kinds.filter((k) => flaps[k].bed);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - ICON_C * s,
        top: cy - ICON_C * s,
        width: ICON * s,
        height: ICON * s,
        perspective: PERSP,
        perspectiveOrigin: '50% 50%',
      }}
    >
      {beds.length > 0 && (
        <svg width={ICON * s} height={ICON * s} viewBox={`0 0 ${ICON} ${ICON}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {beds.map((k) => (
            <React.Fragment key={k}>
              <Clips k={k} uid={`b${uid}`} />
              <Bed k={k} uid={uid} band={band} />
            </React.Fragment>
          ))}
        </svg>
      )}
      {order.map((k) => (
        <FlapLayer key={k} k={k} flap={flaps[k]} s={s} uid={uid} />
      ))}
    </div>
  );
};
