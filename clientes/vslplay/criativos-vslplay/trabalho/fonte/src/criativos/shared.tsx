// Shared pieces of the vertical ad creatives (1080x1920, 30 fps): word clock, headline, tags, CTA button,
// sales page, shake, the logo sting and the end card.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, DISPLAY, TEXT} from '../theme';
import {approach, arrive, clamp, DirBlur, E, lerp, prog, RiseText, spring, tween, vel} from '../kit';
import {Opening} from '../scenes/Opening';

export const VW = 1080;
export const VH = 1920;

// ---- word clock: every scene is keyed to the frame a word is spoken --------------------------------
type Word = {w: string; s: number; e: number; f: number; fe: number};
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export const wordClock = (data: {words: Word[]}) => {
  const ws = data.words;
  // w('botao', 2) = frame of the 2nd "botão"; after: only occurrences at or after that frame
  const at = (word: string, n = 1, after = 0) => {
    const k = norm(word);
    const hits = ws.filter((x) => norm(x.w) === k && x.f >= after);
    if (hits.length < n) throw new Error(`word not found: ${word} #${n} after ${after}`);
    return hits[n - 1].f;
  };
  const end = (word: string, n = 1, after = 0) => {
    const k = norm(word);
    const hits = ws.filter((x) => norm(x.w) === k && x.f >= after);
    return hits[n - 1].fe;
  };
  return {at, end, words: ws};
};

// ---- headline: Archivo 900 condensed, letters rise from a mask ---------------------------------------
export const Headline: React.FC<{
  f: number;
  lines: string[];
  start: number;
  x?: number;
  y: number;
  size?: number;
  color?: string;
  colors?: (string | undefined)[];
  exitAt?: number;
  lineGap?: number;
  align?: 'left' | 'center';
  stagger?: number;
}> = ({f, lines, start, x = 64, y, size = 150, color = C.ink, colors, exitAt, lineGap = 0.9, align = 'left', stagger = 1.2}) => {
  let offset = 0;
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y}}>
      {lines.map((ln, i) => {
        const s = start + offset * stagger;
        offset += ln.length * 0.55 + 2;
        return (
          <RiseText
            key={i}
            f={f}
            text={ln}
            size={size}
            color={colors?.[i] ?? color}
            stretch={66}
            opts={{start: s, stagger, exitAt: exitAt !== undefined ? exitAt + i * 2 : undefined, exitStagger: 0.6}}
            style={{marginTop: i === 0 ? 0 : size * (lineGap - 0.92), justifyContent: align === 'center' ? 'center' : 'flex-start'}}
          />
        );
      })}
    </div>
  );
};

// ---- small tag (timecode labels) -------------------------------------------------------------------
export const Tag: React.FC<{f: number; at: number; x: number; y: number; text: string; bg: string; color?: string; size?: number; shadow?: boolean}> = ({
  f,
  at,
  x,
  y,
  text,
  bg,
  color = C.ink,
  size = 30,
  shadow,
}) => {
  if (f < at) return null;
  const s = spring(f, at, 0.45, 0.55);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background: bg,
        color,
        fontFamily: TEXT,
        fontWeight: 700,
        fontSize: size,
        fontVariantNumeric: 'tabular-nums',
        padding: `${size * 0.32}px ${size * 0.5}px`,
        borderRadius: size * 0.42,
        transform: `scale(${s})`,
        transformOrigin: '0% 50%',
        whiteSpace: 'nowrap',
        boxShadow: shadow ? '0 8px 24px rgba(0,0,0,.14)' : undefined,
      }}
    >
      {text}
    </div>
  );
};

// ---- the "COMPRAR AGORA" button (coral, ink type) -----------------------------------------------------
export const Btn: React.FC<{x: number; y: number; w: number; h: number; text?: string; rot?: number; sx?: number; sy?: number; shadow?: number; fs?: number; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  text = 'COMPRAR AGORA',
  rot = 0,
  sx = 1,
  sy = 1,
  shadow = 1,
  fs,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: h * 0.2,
      background: C.coral,
      color: C.ink,
      fontFamily: DISPLAY,
      fontWeight: 900,
      fontStretch: '80%',
      fontSize: fs ?? h * 0.42,
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `rotate(${rot}deg) scale(${sx}, ${sy})`,
      boxShadow: shadow > 0 ? `0 ${30 * shadow}px ${60 * shadow}px rgba(0,0,0,${0.24 * shadow})` : undefined,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

// ---- sales page pieces ---------------------------------------------------------------------------
export const UrlBar: React.FC<{y?: number}> = ({y = 70}) => (
  <div
    style={{
      position: 'absolute',
      left: 40,
      right: 40,
      top: y,
      height: 68,
      borderRadius: 99,
      background: '#EEEDEA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: TEXT,
      fontWeight: 500,
      fontSize: 26,
      color: '#77777C',
    }}
  >
    suaoferta.com.br
  </div>
);

export const Skel: React.FC<{y: number; n?: number; x?: number; w?: number; gap?: number; h?: number; color?: string}> = ({y, n = 4, x = 48, w = 984, gap = 52, h = 26, color = '#E6E5E2'}) => (
  <>
    {Array.from({length: n}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: x, top: y + i * gap, width: i % 3 === 2 ? w * 0.62 : w, height: h, borderRadius: 12, background: color}} />
    ))}
  </>
);

// ---- camera shake (decaying, deterministic) --------------------------------------------------------
export const shake = (f: number, at: number, amp = 18, dur = 12) => {
  if (f < at || f > at + dur) return {x: 0, y: 0, r: 0};
  const t = f - at;
  const d = Math.pow(1 - t / dur, 2);
  return {x: amp * d * Math.sin(t * 2.7), y: amp * 0.8 * d * Math.cos(t * 3.3 + 1), r: 0.6 * d * Math.sin(t * 2.1)};
};

// ---- the X mark that draws itself --------------------------------------------------------------------
export const XMark: React.FC<{f: number; at: number; x: number; y: number; s?: number; color?: string}> = ({f, at, x, y, s = 92, color = C.coral}) => {
  const a = E.prod(prog(f, at, 5));
  const b = E.prod(prog(f, at + 3, 5));
  const L = Math.SQRT2 * 30 * 2;
  return (
    <svg style={{position: 'absolute', left: x, top: y}} width={s} height={s} viewBox="0 0 92 92">
      <path d="M16 16L76 76" stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray={L * 1.2} strokeDashoffset={L * 1.2 * (1 - a)} opacity={a > 0 ? 1 : 0} />
      <path d="M76 16L16 76" stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray={L * 1.2} strokeDashoffset={L * 1.2 * (1 - b)} opacity={b > 0 ? 1 : 0} />
    </svg>
  );
};

// ---- the logo sting (the approved short cut: Vinheta frames 66 to 200), scaled into the tall frame -----
export const STING_IN = 66;
export const STING_LEN = 134;
export const Sting: React.FC<{f: number; start: number; cy?: number}> = ({f, start, cy = 700}) => {
  const sf = Math.min(STING_IN + (f - start), STING_IN + STING_LEN);
  const k = 0.66;
  return (
    <div style={{position: 'absolute', left: (VW - 1920 * k) / 2, top: cy - 540 * k, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: '0 0'}}>
      <Opening f={sf} sting={{cy: 540, wink: 182, transparent: true}} />
    </div>
  );
};

// ---- end card: lines + the 7 DIAS GRÁTIS button ------------------------------------------------------
export const EndCard: React.FC<{f: number; start: number; btnAt: number; lines: {t: string; c: string}[]; y?: number}> = ({f, start, btnAt, lines, y = 980}) => {
  const press = f >= btnAt + 26 ? Math.sin(Math.PI * clamp((f - btnAt - 26) / 8)) : 0;
  const s = spring(f, btnAt, 0.42, 0.6);
  return (
    <>
      {lines.map((l, i) => (
        <RiseText
          key={i}
          f={f}
          text={l.t}
          size={86}
          color={l.c}
          stretch={66}
          opts={{start: start + i * 5, stagger: 0.8}}
          style={{position: 'absolute', left: 0, right: 0, top: y + i * 82, justifyContent: 'center'}}
        />
      ))}
      {f >= btnAt && (
        <Btn x={(VW - 600) / 2} y={y + lines.length * 82 + 90} w={600} h={150} text="7 DIAS GRÁTIS" sx={s * (1 - 0.05 * press)} sy={s * (1 - 0.05 * press)} shadow={0} fs={66} />
      )}
    </>
  );
};

export {AbsoluteFill, approach, arrive, clamp, DirBlur, E, lerp, prog, spring, tween, vel};
