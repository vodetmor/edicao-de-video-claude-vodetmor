import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {getLength} from '@remotion/paths';
import {DOT, ICON, LETTERS, LETTER_TRANSFORM, LOCKUP_W, RIBBONS, RIBBON_TRANSFORM, SQUIRCLE, TRIANGLE} from './logoData';
import {approach, clamp, prog, E, vel} from './kit';

export const ICON_C = ICON / 2; // 392.5
export const TRI_C = {x: 337.2, y: 391.6}; // centroid of the play triangle
export const TRI_LEN = getLength(TRIANGLE);

export type Piece = {x?: number; y?: number; rot?: number; s?: number; op?: number; flat?: number; px?: number; py?: number};
export type IconState = {
  cool: Piece;
  warm: Piece;
  purple: Piece;
  tri: {fill: string; op?: number; s?: number; outline?: number; outlineW?: number; outlineOp?: number; well?: string};
  assembled?: boolean;
  guides?: number; // 0..1 opacity of the SNAP guides
  noHole?: boolean; // clip pieces by the squircle only (a ribbon growing into a field)
};

export const FLAT = {cool: '#3DCBEE', warm: '#EC5F78', purple: '#6A10D8'};
const TEX = {cool: 'tex_cool.png', warm: 'tex_warm.png', purple: 'tex_purple.png'};
export const TEXTURES = ['tex_cool.png', 'tex_warm.png', 'tex_purple.png', 'tex_full.png'];

// Remotion waits for <Img>, not for an SVG <image>: a texture mounted on a frame could still be loading when
// that frame was captured (v2 dropped the whole icon on f1331). Every texture element now holds its frame
// until it has loaded; loads come from the memory cache after the preload in Ad, so this costs nothing.
export const SvgImage: React.FC<{href: string; width: number; height: number}> = ({href, width, height}) => {
  const [handle] = React.useState(() => delayRender(`texture ${href}`, {timeoutInMilliseconds: 60000}));
  const done = React.useRef(false);
  const finish = React.useCallback(() => {
    if (done.current) return;
    done.current = true;
    continueRender(handle);
  }, [handle]);
  React.useEffect(() => finish, [finish]); // unmounted before it loaded: release the frame
  return <image href={href} width={width} height={height} onLoad={finish} onError={finish} />;
};

const pieceTransform = (p: Piece) => {
  const px = p.px ?? ICON_C;
  const py = p.py ?? ICON_C;
  const s = p.s ?? 1;
  return `translate(${p.x ?? 0} ${p.y ?? 0}) rotate(${p.rot ?? 0} ${px} ${py}) translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`;
};

// Screen placement: icon center at (cx, cy), `s` screen px per logo unit.
export type Place = {cx: number; cy: number; s: number};
export const dotSocket = (pl: Place) => ({
  x: pl.cx + (DOT.cx - ICON_C) * pl.s,
  y: pl.cy + (DOT.cy - ICON_C) * pl.s,
  r: DOT.r * pl.s,
});

// PLAY is monoline: each letter is revealed by strokes drawn along its centerline (lockup units)
const PLAY_STROKES: Record<string, string[]> = {
  P: ['M2112,623 L2112,183', 'M2104,183 L2263,183 A103,108 0 0 1 2263,399 L2104,399'],
  L2: ['M2426,170 L2426,611 L2649,611'],
  A: ['M2660,628 L2954,183 L2969,183 L2969,624', 'M2752,493 L2981,493'],
  Y: ['M3014,163 L3164,391 L3164,624', 'M3315,163 L3164,391'],
};
const STROKE_LEN: Record<string, number[]> = Object.fromEntries(
  Object.entries(PLAY_STROKES).map(([k, v]) => [k, v.map((d) => getLength(d))]),
);
const VSL_BOX: Record<string, [number, number]> = {V: [949, 1357], S: [1383, 1714], L1: [1795, 2069]};

export type WordState = {
  // per letter progress. VSL: rise offset in units (0 = in place); PLAY: draw progress 0..1
  rise: Record<string, {y: number; rot: number; blur: number}>;
  draw: Record<string, number>;
  drop?: Record<string, number>; // exit: units moved down
  opacity?: number;
};

export const Lockup: React.FC<{
  place: Place;
  icon: IconState | null;
  word: WordState | null;
  uid: string;
  stage: string;
  wordColor?: string;
}> = ({place, icon, word, uid, stage, wordColor = '#FFFFFF'}) => {
  const {cx, cy, s} = place;
  const left = cx - ICON_C * s;
  const top = cy - ICON_C * s;
  return (
    <svg
      width={LOCKUP_W * s}
      height={ICON * s}
      viewBox={`0 0 ${LOCKUP_W} ${ICON}`}
      style={{position: 'absolute', left, top, overflow: 'visible'}}
    >
      <defs>
        <clipPath id={`body-${uid}`}>
          <path d={`${SQUIRCLE} ${TRIANGLE}`} clipRule="evenodd" />
        </clipPath>
        <clipPath id={`sq-${uid}`}>
          <path d={SQUIRCLE} />
        </clipPath>
        {(['cool', 'warm', 'purple'] as const).map((k) => (
          <clipPath id={`rib-${k}-${uid}`} key={k}>
            <path d={RIBBONS[k]} transform={RIBBON_TRANSFORM} />
          </clipPath>
        ))}
        {Object.entries(PLAY_STROKES).map(([k, ds]) => {
          const p = word?.draw[k] ?? 0;
          // strokes are drawn one after another, proportional to their length
          const lens = STROKE_LEN[k];
          const total = lens.reduce((a, b) => a + b, 0);
          let acc = 0;
          return (
            <mask id={`m-${k}-${uid}`} key={k} maskUnits="userSpaceOnUse" x={0} y={0} width={LOCKUP_W} height={ICON}>
              {ds.map((d, i) => {
                const a0 = acc / total;
                acc += lens[i];
                const a1 = acc / total;
                const lp = clamp((p - a0) / (a1 - a0));
                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={46}
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    strokeDasharray={`${lens[i]} ${lens[i]}`}
                    strokeDashoffset={lens[i] * (1 - lp)}
                  />
                );
              })}
            </mask>
          );
        })}
        {Object.entries(VSL_BOX).map(([k, [x0, x1]]) => (
          <clipPath id={`c-${k}-${uid}`} key={k}>
            <rect x={x0 - 30} y={-200} width={x1 - x0 + 60} height={836 + 200} />
          </clipPath>
        ))}
        {word &&
          Object.keys(VSL_BOX).map((k) => {
            const b = (word.rise[k]?.blur ?? 0) * 0.55;
            return b > 0.4 ? (
              <filter id={`vb-${k}-${uid}`} key={k} x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation={`0 ${b.toFixed(2)}`} />
              </filter>
            ) : null;
          })}
      </defs>

      {icon && <IconBody icon={icon} uid={uid} stage={stage} />}

      {word && (
        <g opacity={word.opacity ?? 1}>
          {LETTERS.map((L) => {
            const drop = word.drop?.[L.id] ?? 0;
            if (L.id in VSL_BOX) {
              const r = word.rise[L.id] ?? {y: 0, rot: 0, blur: 0};
              const [x0] = VSL_BOX[L.id];
              return (
                <g key={L.id} clipPath={`url(#c-${L.id}-${uid})`}>
                  <g
                    transform={`translate(0 ${r.y + drop}) rotate(${r.rot} ${x0} 629)`}
                    filter={r.blur * 0.55 > 0.4 ? `url(#vb-${L.id}-${uid})` : undefined}
                  >
                    <path d={L.d} transform={LETTER_TRANSFORM(L.x0)} fill={wordColor} />
                  </g>
                </g>
              );
            }
            return (
              <g key={L.id} transform={`translate(0 ${drop})`}>
                <g mask={`url(#m-${L.id}-${uid})`}>
                  <path d={L.d} transform={LETTER_TRANSFORM(L.x0)} fill={wordColor} />
                </g>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

const IconBody: React.FC<{icon: IconState; uid: string; stage: string}> = ({icon, uid, stage}) => {
  const tri = icon.tri;
  const ts = tri.s ?? 1;
  const triT = `translate(${TRI_C.x} ${TRI_C.y}) scale(${ts}) translate(${-TRI_C.x} ${-TRI_C.y})`;
  return (
    <g>
      {icon.assembled ? (
        <g clipPath={`url(#body-${uid})`}>
          <SvgImage href={staticFile('tex_full.png')} width={ICON} height={ICON} />
        </g>
      ) : (
        (['cool', 'warm', 'purple'] as const).map((k) => {
          const p = icon[k];
          if ((p.op ?? 1) <= 0.001) return null;
          return (
            <g key={k} transform={pieceTransform(p)} opacity={p.op ?? 1}>
              <g clipPath={`url(#${icon.noHole ? 'sq' : 'body'}-${uid})`}>
                <g clipPath={`url(#rib-${k}-${uid})`}>
                  <SvgImage href={staticFile(TEX[k])} width={ICON} height={ICON} />
                  {(p.flat ?? 0) > 0 && <rect x={-2000} y={-2000} width={5000} height={5000} fill={FLAT[k]} opacity={p.flat} />}
                </g>
              </g>
            </g>
          );
        })
      )}
      {/* a pressed button shows the wall of its socket around it, not the stage */}
      {tri.well && (tri.op ?? 1) > 0.001 && <path d={TRIANGLE} fill={tri.well} />}
      {(tri.op ?? 1) > 0.001 && (
        <g transform={triT} opacity={tri.op ?? 1}>
          <path d={TRIANGLE} fill={tri.fill === 'stage' ? stage : tri.fill} />
        </g>
      )}
      {(tri.outline ?? 0) > 0 && (tri.outlineOp ?? 1) > 0 && (
        <path
          d={TRIANGLE}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={tri.outlineW ?? 3}
          strokeDasharray={`${TRI_LEN} ${TRI_LEN}`}
          strokeDashoffset={TRI_LEN * (1 - (tri.outline ?? 0))}
          opacity={tri.outlineOp ?? 1}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Wordmark build/exit helpers (shared by the opening and the finale)
export const buildWord = (f: number, vslAt: number, playAt: number, exitAt?: number): WordState => {
  const rise: WordState['rise'] = {};
  (['V', 'S', 'L1'] as const).forEach((k, i) => {
    const s = vslAt + i * 2;
    const g = (ff: number) => approach(ff, s, 560, 0, 0.2);
    const y = g(f);
    const rot = f <= s ? -8 : -8 * Math.pow(0.8, f - s);
    rise[k] = {y, rot, blur: Math.abs(vel(g, f))};
  });
  const draw: WordState['draw'] = {};
  (['P', 'L2', 'A', 'Y'] as const).forEach((k, i) => {
    const s = playAt + i * 4;
    draw[k] = E.prod(prog(f, s, k === 'P' || k === 'A' ? 14 : 12));
  });
  let drop: WordState['drop'] | undefined;
  if (exitAt !== undefined) {
    drop = {};
    ['Y', 'A', 'L2', 'P', 'L1', 'S', 'V'].forEach((k, i) => {
      drop![k] = 700 * E.exit(prog(f, exitAt + i * 1.2, 10));
    });
  }
  return {rise, draw, drop};
};
