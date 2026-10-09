import React from 'react';
import {RiseText} from './kit';
import {C, TEXT, MONO} from './theme';
import {abs, approach, arrive, clamp, E, Estilo, Icon, Phone, prog, spring, vel, DirBlur, hash, lerp} from './ui';

// Centered display headline; each line rises letter by letter at its own frame (on its spoken word).
export const HL: React.FC<{
  f: number;
  top: number;
  size: number;
  lines: {t: string; c: string; at: number; pc?: (i: number) => string | undefined}[];
  exitAt?: number;
  left?: number;
  align?: 'center' | 'left';
  stagger?: number;
}> = ({f, top, size, lines, exitAt, left = 0, align = 'center', stagger = 1.3}) => (
  <div style={abs({left: align === 'center' ? 0 : left, right: align === 'center' ? 0 : undefined, top})}>
    {lines.map((l, i) => (
      <div key={i} style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', marginTop: i ? -size * 0.04 : 0}}>
        <RiseText f={f} text={l.t} size={size} color={l.c} stretch={62} lineHeight={0.88} opts={{start: l.at, stagger, k: 0.24, exitAt, exitStagger: 0.6}} perLetterColor={l.pc} />
      </div>
    ))}
  </div>
);

// Typing text with caret
export const Typing: React.FC<{f: number; at: number; txt: string; cps: number; style: React.CSSProperties; caret: string; caretH: number}> = ({f, at, txt, cps, style, caret, caretH}) => {
  const n = clamp(Math.floor((f - at) * cps), 0, txt.length);
  const blink = n >= txt.length ? Math.floor(f / 8) % 2 === 0 : true;
  return (
    <div style={style}>
      {txt.slice(0, n)}
      <span style={{display: 'inline-block', width: 5, height: caretH, background: caret, verticalAlign: -caretH * 0.1, marginLeft: 4, opacity: blink ? 1 : 0}} />
    </div>
  );
};

// Stamp that slams in (scale from big, rotate, ink settles)
export const Stamp: React.FC<{f: number; at: number; children: React.ReactNode; rot?: number; style?: React.CSSProperties}> = ({f, at, children, rot = -10, style}) => {
  if (f < at) return null;
  const t = f - at;
  const s = t < 4 ? lerp(2.4, 1, E.inQuad(t / 4)) : 1 + 0.05 * Math.exp(-(t - 4) * 0.5) * Math.cos((t - 4) * 1.3);
  const op = clamp(t / 2);
  return <div style={{...style, position: 'absolute', transform: `rotate(${rot}deg) scale(${s})`, opacity: op}}>{children}</div>;
};

// Mono receipt line
export const linhaCupom = (k: number, size = 15, cor = '#333') => (
  <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 500, fontSize: size, color: cor, margin: `${size * 0.33}px 0`}}>
    <span>CRIATIVO {String(k + 1).padStart(2, '0')}</span>
    <span>39,90</span>
  </div>
);

// Toggle switch (ads manager)
export const Toggle: React.FC<{on: number; w?: number}> = ({on, w = 30}) => (
  <div style={{position: 'relative', width: w, height: w * 0.56, borderRadius: w, background: on > 0.5 ? '#1DB954' : '#CFCBC0', transition: 'none'}}>
    <div style={abs({left: lerp(w * 0.06, w * 0.5, on), top: w * 0.06, width: w * 0.44, height: w * 0.44, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.25)'})} />
  </div>
);

// Gold check badge that pops
export const CheckPop: React.FC<{f: number; at: number; s?: number; style?: React.CSSProperties}> = ({f, at, s = 22, style}) => {
  const p = spring(f, at, 0.45, 0.55);
  if (f < at) return null;
  return (
    <div style={{...style, position: 'absolute', width: s, height: s, borderRadius: '50%', background: C.preto, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
      <Icon n="check" s={s * 0.62} c={C.ouro} />
    </div>
  );
};

export {RiseText};
