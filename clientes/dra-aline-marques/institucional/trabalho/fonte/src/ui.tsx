import React from 'react';
import {Img, staticFile} from 'remotion';
import {IC} from './icons';
import {IC2} from './icons2';
import {arrive, clamp, entra, pulse} from './kit';

// Identidade medida do site da Dra. Aline (creme, areia, marrom quente, Jost) + um único acento (bronze).
export const C = {
  bg: '#FAF5EC', bg2: '#F1E7D6', ink: '#3B2C20', soft: '#7A6655', sand: '#CDB28B', line: '#E3D5BE', acc: '#A8703C',
  white: '#FFFFFF', wa: '#25D366', waOut: '#DCF8C6', chat: '#EFE6D8', blue: '#53BDEB', grey: '#9AA0A6',
};
export const FONT = "'Jost', system-ui, sans-serif";
export const HAND = "'Caveat', cursive";
export const FPS = 30;
export const S = (s: number) => Math.round(s * FPS);

export const Icon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 64, color = C.ink, style}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{display: 'block', flex: 'none', ...style}}>
    <path d={IC2[name] ?? IC[name]} fill={color} />
  </svg>
);

export const Photo: React.FC<{w: number; h: number; r?: number; pos?: string; style?: React.CSSProperties}> = ({w, h, r = 48, pos = '0% 30%', style}) => (
  <div style={{width: w, height: h, borderRadius: r, overflow: 'hidden', background: C.bg2, flex: 'none', ...style}}>
    <Img src={staticFile('img/aline.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
  </div>
);

export const Logo: React.FC<{name: 'whatsapp' | 'instagram'; size: number; style?: React.CSSProperties}> = ({name, size, style}) => (
  <Img src={staticFile(`img/${name}.svg`)} style={{width: size, height: size, flex: 'none', ...style}} />
);

export const Txt: React.FC<{size: number; weight?: number; color?: string; align?: 'left' | 'center' | 'right'; ls?: number; lh?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size, weight = 600, color = C.ink, align = 'center', ls = -0.01, lh = 1.08, style, children,
}) => (
  <div style={{fontFamily: FONT, fontSize: size, fontWeight: weight, color, textAlign: align, letterSpacing: `${ls}em`, lineHeight: lh, ...style}}>{children}</div>
);

// moldura de celular (sem vidro, sem brilho): contorno marrom + tela bege
export const Phone: React.FC<{w?: number; h?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({w = 640, h = 1060, style, children}) => (
  <div style={{width: w, height: h, borderRadius: 76, background: C.ink, padding: 14, boxSizing: 'border-box', ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 62, background: C.chat, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative'}}>{children}</div>
  </div>
);

export const WaHeader: React.FC<{title: string; sub?: string; tag?: React.ReactNode; avatar?: React.ReactNode}> = ({title, sub, tag, avatar}) => (
  <div style={{height: 150, background: C.white, display: 'flex', alignItems: 'center', gap: 20, padding: '34px 30px 0', boxSizing: 'border-box', flex: 'none', borderBottom: `2px solid ${C.line}`}}>
    {avatar ?? (
      <div style={{width: 68, height: 68, borderRadius: 34, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
        <Txt size={34} color={C.acc}>A</Txt>
      </div>
    )}
    <div style={{flex: 1, minWidth: 0}}>
      <Txt size={30} align="left" weight={600} style={{whiteSpace: 'nowrap'}}>{title}</Txt>
      {sub && <Txt size={22} align="left" weight={400} color={C.soft} style={{whiteSpace: 'nowrap'}}>{sub}</Txt>}
    </div>
    {tag}
    <Logo name="whatsapp" size={42} />
  </div>
);

export const Ticks: React.FC<{read?: boolean}> = ({read}) => (
  <div style={{position: 'relative', width: 34, height: 20, flex: 'none'}}>
    <div style={{position: 'absolute', left: 0, top: 0}}><Icon name="check" size={20} color={read ? C.blue : C.grey} /></div>
    <div style={{position: 'absolute', left: 11, top: 0}}><Icon name="check" size={20} color={read ? C.blue : C.grey} /></div>
  </div>
);

// bolha do WhatsApp: out = verde à direita; in = branca à esquerda
export const Bubble: React.FC<{f: number; at: number; text: string; out?: boolean; ticks?: 'sent' | 'read'; fs?: number; maxW?: number; tag?: string; typeOver?: number}> = ({
  f, at, text, out, ticks, fs = 30, maxW = 440, tag, typeOver,
}) => {
  if (f < at) return null;
  const shown = typeOver ? text.slice(0, Math.max(1, Math.ceil(text.length * clamp((f - at) / typeOver)))) : text;
  return (
    <div style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', width: '100%', ...entra(f, at, 30, 0.22)}}>
      <div style={{maxWidth: maxW, background: out ? C.waOut : C.white, borderRadius: 30, borderTopRightRadius: out ? 8 : 30, borderTopLeftRadius: out ? 30 : 8, padding: '18px 24px', border: `2px solid ${out ? '#C9E8B0' : C.line}`}}>
        {tag && <Txt size={22} weight={600} color={C.acc} align="left" ls={0.06} style={{marginBottom: 6}}>{tag}</Txt>}
        <Txt size={fs} weight={400} align="left" lh={1.25} ls={0}>{shown}</Txt>
        {ticks && <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 6}}><Ticks read={ticks === 'read'} /></div>}
      </div>
    </div>
  );
};

export const Typing: React.FC<{f: number; at: number; until: number; out?: boolean}> = ({f, at, until, out}) => {
  if (f < at || f >= until) return null;
  return (
    <div style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', width: '100%', ...entra(f, at, 20, 0.25)}}>
      <div style={{background: out ? C.waOut : C.white, borderRadius: 30, padding: '20px 26px', display: 'flex', gap: 10, border: `2px solid ${out ? '#C9E8B0' : C.line}`}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: C.soft, opacity: 0.35 + 0.65 * Math.abs(Math.sin((f - at) / 6 - i * 0.7))}} />
        ))}
      </div>
    </div>
  );
};

export const Chip: React.FC<{f: number; at: number; icon?: string; text: string; color?: string; fs?: number; style?: React.CSSProperties}> = ({f, at, icon, text, color = C.ink, fs = 34, style}) => {
  if (f < at) return null;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: C.white, border: `2px solid ${C.line}`, borderRadius: 999, padding: '14px 28px', ...entra(f, at, 26, 0.22), ...style}}>
      {icon && <Icon name={icon} size={fs + 6} color={C.acc} />}
      <Txt size={fs} weight={500} color={color} ls={0}>{text}</Txt>
    </div>
  );
};

export const Card: React.FC<{w: number; h?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({w, h, style, children}) => (
  <div style={{width: w, height: h, background: C.white, border: `2px solid ${C.line}`, borderRadius: 52, boxSizing: 'border-box', ...style}}>{children}</div>
);

export const Pos: React.FC<{x?: number; y: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, style, children}) => (
  <div style={{position: 'absolute', left: x ?? 0, top: y, width: x === undefined ? '100%' : undefined, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

// legenda grande que troca de linha conforme a fala: [{at, text}]
export const Say: React.FC<{f: number; lines: {at: number; text: React.ReactNode; size?: number; color?: string}[]; y: number; w?: number}> = ({f, lines, y, w = 900}) => {
  let cur = -1;
  lines.forEach((l, i) => { if (f >= l.at) cur = i; });
  if (cur < 0) return null;
  const l = lines[cur];
  const out = cur < lines.length - 1 ? clamp((f - lines[cur + 1].at + 6) / 6) : 0;
  return (
    <Pos y={y}>
      <div style={{width: w, ...entra(f, l.at, 34, 0.22), opacity: clamp(arrive(f, l.at, 0.22) * 1.6) * (1 - out)}}>
        <Txt size={l.size ?? 72} color={l.color ?? C.ink}>{l.text}</Txt>
      </div>
    </Pos>
  );
};

export const Dot: React.FC<{f: number; color?: string; size?: number}> = ({f, color = C.wa, size = 22}) => (
  <div style={{position: 'relative', width: size, height: size, flex: 'none'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: size, background: color}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: size, border: `3px solid ${color}`, opacity: 1 - (f % 40) / 40, transform: `scale(${1 + ((f % 40) / 40) * 1.2})`}} />
  </div>
);

export const Wordmark: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', top: 74, left: 0, width: '100%', ...style}}>
    <Txt size={26} weight={500} color={C.soft} ls={0.32}>DRA. ALINE MARQUES</Txt>
  </div>
);

export const Avatar: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
  const z = size / 300; // largura do recorte do rosto ~300 px da foto original
  return (
    <div style={{width: size, height: size, borderRadius: size / 2, flex: 'none', backgroundImage: `url(${staticFile('img/aline.png')})`, backgroundRepeat: 'no-repeat',
      backgroundSize: `${854 * z}px ${683 * z}px`, backgroundPosition: `${-(330 * z) + size / 2}px ${-(300 * z) + size / 2}px`, ...style}} />
  );
};
