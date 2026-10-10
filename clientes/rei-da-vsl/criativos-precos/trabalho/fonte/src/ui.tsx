import React from 'react';
import {continueRender, delayRender, Img, staticFile} from 'remotion';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {C, DISPLAY, TEXT, MONO, SW, SH} from './theme';
import {approach, arrive, clamp, DirBlur, E, hash, lerp, prog, spring, tween, vel} from './kit';
import ICONS from './icons.json';
import ONDA1 from './onda-texto-1.json';
import ONDA2 from './onda-texto-2.json';

export const ONDAS: Record<string, number[]> = {'texto-1': ONDA1 as number[], 'texto-2': ONDA2 as number[]};

export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const specs = ["900 100px 'Archivo Variable'", "800 100px 'Archivo Variable'", "500 40px 'Inter Variable'", "600 40px 'Inter Variable'",
      "700 40px 'Inter Variable'", "800 40px 'Inter Variable'", "500 20px 'JetBrains Mono'", "700 20px 'JetBrains Mono'"];
    Promise.all(specs.map((s) => document.fonts.load(s, 'AÇÃÊÍÕÚ açãêíõú 0123456789 R$%')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

export const abs = (s: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', ...s});
export const H: React.CSSProperties = {fontFamily: DISPLAY, fontWeight: 900, fontStretch: '62%', textTransform: 'uppercase', lineHeight: 0.86, letterSpacing: '-0.01em'};
export const NUM: React.CSSProperties = {fontFamily: DISPLAY, fontWeight: 900, fontStretch: '62%', fontVariantNumeric: 'tabular-nums', lineHeight: 0.8};

// ---------------------------------------------------------------- stage: 540x960 authored, rendered at 1080x1920
export const Stage: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.preto}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH, transform: 'scale(2)', transformOrigin: '0 0', overflow: 'hidden', background: bg}}>
    {children}
  </div>
);

export const Icon: React.FC<{n: string; s: number; c: string; style?: React.CSSProperties}> = ({n, s, c, style}) => (
  <div
    style={{width: s, height: s, color: c, ...style}}
    dangerouslySetInnerHTML={{
      __html: (ICONS as Record<string, string>)[n].replace('<svg ', `<svg width="${s}" height="${s}" fill="${c}" style="display:block" `),
    }}
  />
);

// ---------------------------------------------------------------- HUD frame (editor's viewfinder, idea from @ajith_io showreel)
const tc = (fr: number) => {
  const s = Math.floor(fr / 30);
  const p = (n: number) => String(n).padStart(2, '0');
  return `00:00:${p(s)}:${p(fr % 30)}`;
};
export const Hud: React.FC<{f: number; cod: string; cor: string; beat?: number}> = ({f, cod, cor, beat = 0}) => {
  const t = (x: number, y: number, r: number) => (
    <svg key={`${x}${y}`} width={14} height={14} viewBox="0 0 14 14" style={abs({left: x, top: y, transform: `rotate(${r}deg)`, opacity: 0.55})}>
      <path d="M1 13V1h12" fill="none" stroke={cor} strokeWidth={1.5} />
    </svg>
  );
  const hud: React.CSSProperties = {position: 'absolute', fontFamily: TEXT, fontWeight: 600, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, fontVariantNumeric: 'tabular-nums', color: cor};
  const b = Math.pow(1 - ((f % 14) / 14), 3); // pulses on every beat (128.57 BPM = 14 frames)
  return (
    <div style={abs({inset: 0, pointerEvents: 'none', zIndex: 50})}>
      {t(18, 18, 0)}
      {t(508, 18, 90)}
      {t(508, 928, 180)}
      {t(18, 928, 270)}
      <div style={{...hud, left: 40, top: 22}}>Rei da VSL</div>
    </div>
  );
};

// ---------------------------------------------------------------- odometer digits: spin fast, decelerate, land with a small kick on `land`
export const digitPos = (f: number, target: number, land: number, turns = 2.2) => {
  const d = land - f;
  if (d <= 0) {
    const t = -d;
    return target + 0.09 * Math.exp(-t * 0.35) * Math.sin(t * 0.9); // settle wobble
  }
  const D = 16; // decel span
  if (d > D) return target - turns - 0.6 * (d - D); // constant spin before decel
  const u = d / D;
  return target - turns * u * u;
};
export const Odo: React.FC<{
  f: number;
  txt: string; // ex '39,90'
  lands: number[]; // one land frame per digit
  size: number;
  color: string;
  blur?: number;
  style?: React.CSSProperties;
  ghost?: string;
}> = ({f, txt, lands, size, color, blur = 1, style, ghost}) => {
  let di = 0;
  const lh = size * 0.8;
  return (
    <div style={{...NUM, fontSize: size, color, display: 'flex', ...style}}>
      {Array.from(txt).map((ch, i) => {
        if (!/[0-9]/.test(ch)) return <div key={i} style={{height: lh}}>{ch}</div>;
        const L = lands[di++] ?? 0;
        const tgt = parseInt(ch, 10);
        const g = (ff: number) => digitPos(ff, tgt, L);
        const v = g(f);
        const sp = Math.abs(vel(g, f));
        const base = Math.floor(v);
        const fr = v - base;
        const b = Math.min(16, sp * lh * 0.35 * blur);
        return (
          <div key={i} style={{position: 'relative', height: lh, width: '0.5em', overflow: 'hidden'}}>
            <DirBlur y={b} style={{position: 'absolute', left: 0, top: 0, width: '100%'}}>
              <div style={{transform: `translateY(${-(1 + fr) * lh}px)`}}>
                {[-1, 0, 1, 2].map((k) => (
                  <div key={k} style={{height: lh, textAlign: 'center', color: k === 0 || f >= L + 4 ? color : ghost ?? color}}>
                    {(((base + k) % 10) + 10) % 10}
                  </div>
                ))}
              </div>
            </DirBlur>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- price tag (SVG), pivots at its hole
export const Tag: React.FC<{w: number; children?: React.ReactNode; sub?: string; fill?: string; hole?: string}> = ({w, children, sub, fill = C.branco, hole = C.ouro}) => {
  const h = w * 0.56;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} viewBox="0 0 100 56" style={{display: 'block', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.22))'}}>
        <path d="M14 0H96a4 4 0 0 1 4 4V52a4 4 0 0 1-4 4H14L0 28Z" fill={fill} />
        <circle cx="12" cy="28" r="3.6" fill={hole} />
        <path d="M20 6H94" stroke="#000" strokeOpacity=".06" strokeWidth=".6" />
      </svg>
      <div style={abs({left: w * 0.2, top: h * 0.2})}>{children}</div>
      {sub && (
        <div style={abs({left: w * 0.2, top: h * 0.7, fontFamily: TEXT, fontWeight: 700, fontSize: w * 0.045, letterSpacing: '0.16em', color: C.cinza})}>{sub}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- phone
export const Phone: React.FC<{w: number; children: React.ReactNode; style?: React.CSSProperties; shadow?: number}> = ({w, children, style, shadow = 1}) => {
  const h = Math.round((w * 16) / 9);
  const r = w * 0.115;
  return (
    <div
      style={{
        position: 'absolute',
        width: w + 14,
        height: h + 14,
        borderRadius: r + 6,
        background: '#050505',
        padding: 7,
        boxShadow: `0 ${18 * shadow}px ${40 * shadow}px rgba(0,0,0,${0.45 * shadow}), inset 0 0 0 1.2px #2a2a2a`,
        ...style,
      }}
    >
      <div style={{position: 'relative', width: w, height: h, borderRadius: r, overflow: 'hidden'}}>{children}</div>
      <div style={abs({left: (w + 14) / 2 - w * 0.12, top: 11, width: w * 0.24, height: w * 0.055, borderRadius: 99, background: '#050505', zIndex: 5})} />
    </div>
  );
};

export const Chip: React.FC<{x: number; y: number; txt: string; bg?: string; cor?: string; f?: number; at?: number}> = ({x, y, txt, bg = C.ouro, cor = C.preto, f = 99, at = 0}) => {
  const p = arrive(f, at, 0.25);
  return (
    <div
      style={abs({
        left: x,
        top: y,
        fontFamily: TEXT,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.14em',
        padding: '6px 10px',
        borderRadius: 8,
        background: bg,
        color: cor,
        opacity: clamp(p * 2),
        transform: `translateY(${(1 - p) * 10}px)`,
      })}
    >
      {txt}
    </div>
  );
};

// HUD brackets inside a mini video
export const Brk: React.FC<{w: number; h: number; cor?: string; m?: number}> = ({w, h, cor = '#fff', m = 8}) => {
  const L = Math.max(6, w * 0.1);
  return (
    <svg width={w} height={h} style={abs({left: 0, top: 0})}>
      <path
        stroke={cor}
        strokeWidth={1.5}
        fill="none"
        opacity={0.8}
        d={`M${m} ${m + L}V${m}H${m + L}M${w - m - L} ${m}H${w - m}V${m + L}M${w - m} ${h - m - L}V${h - m}H${w - m - L}M${m + L} ${h - m}H${m}V${h - m - L}`}
      />
    </svg>
  );
};

// ---------------------------------------------------------------- 10 animated motion styles (inspired by X reels, motion-base/fontes/x/ESTILOS-MOTION.md)
export const Estilo: React.FC<{i: number; w: number; h: number; f: number; brk?: boolean}> = ({i, w, h, f, brk = true}) => {
  const s = w / 100;
  const st: React.CSSProperties = {position: 'absolute', inset: 0, overflow: 'hidden'};
  if (i === 0) {
    // dot grid wave (cobalt)
    const dots = [];
    const rows = Math.ceil(h / (9 * s)) + 1;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < 8; c++) {
        const a = 1.2 + 1.6 * (1 + Math.sin(c * 0.7 + r * 0.5 - f * 0.22));
        dots.push(
          <div key={r * 8 + c} style={abs({left: 8 * s + c * 12 * s - (a * s) / 2, top: 6 * s + r * 9 * s + Math.sin(c * 0.8 + f * 0.15) * 4 * s, width: a * s, height: a * s, borderRadius: '50%', background: (r + c) % 11 === 0 ? '#FFC94A' : '#fff'})} />,
        );
      }
    return <div style={{...st, background: C.cobalto}}>{dots}{brk && <Brk w={w} h={h} />}</div>;
  }
  if (i === 1) {
    // giant word with directional blur (orange), scrolling
    const x = -((f * 3.2 * s) % (60 * s));
    const sp = 3.2 * s;
    return (
      <div style={{...st, background: C.laranja}}>
        <DirBlur x={sp * 1.6} style={abs({left: x - 40 * s, top: Math.min(h * 0.5, h * 0.3 + 30 * s) - 17 * s, opacity: 0.45})}>
          <div style={{...NUM, fontSize: 34 * s, color: '#fff', whiteSpace: 'nowrap'}}>VENDA VENDA VENDA</div>
        </DirBlur>
        <div style={abs({left: x, top: Math.min(h * 0.5, h * 0.3 + 30 * s) - 17 * s, ...NUM, fontSize: 34 * s, color: '#fff', whiteSpace: 'nowrap'})}>VENDA VENDA VENDA</div>
        {brk && <Brk w={w} h={h} />}
      </div>
    );
  }
  if (i === 2) {
    // 3D tile field with a bouncing ball (coral on dark)
    const pal = ['#F7B59D', C.coral, '#E07D63', '#B9543F'];
    const tiles = [];
    for (let r = 0; r < 12; r++)
      for (let c = 0; c < 8; c++) {
        const z = Math.sin(r * 0.6 + c * 0.4 - f * 0.18);
        tiles.push(<div key={r * 8 + c} style={{width: 10 * s, height: 10 * s, margin: s, borderRadius: 2 * s, background: pal[(r * 3 + c + Math.round(2 + 2 * z)) % 4], transform: `translateZ(${z * 4 * s}px)`}} />);
      }
    const by = Math.abs(Math.sin(f * 0.16)) * 22 * s;
    return (
      <div style={{...st, background: '#160F0D', perspective: 120 * s}}>
        <div style={abs({left: 0, top: h * 0.22, width: 104 * s, display: 'flex', flexWrap: 'wrap', transform: 'rotateX(55deg) rotateZ(-20deg)', transformStyle: 'preserve-3d'})}>{tiles}</div>
        <div style={abs({left: 40 * s, top: h * 0.42 - by, width: 20 * s, height: 20 * s, borderRadius: '50%', background: '#e6e6e6', boxShadow: `inset -${3 * s}px -${3 * s}px 0 #999`})} />
        {brk && <Brk w={w} h={h} />}
      </div>
    );
  }
  if (i === 3) {
    // striped ribbon drawing itself (yellow)
    const d = `M${85 * s} ${h * 0.22} C ${-30 * s} ${h * 0.22}, ${-10 * s} ${h * 0.78}, ${88 * s} ${h * 0.74}`;
    const L = 300 * s;
    const p = ((f * 0.025) % 1.4);
    const off = L * (1 - clamp(p));
    return (
      <div style={{...st, background: '#F3CF3A'}}>
        <svg width={w} height={h} style={abs({})}>
          {[['#111', 22], ['#fff', 15], [C.verm, 7], [C.cobalto, 2.5]].map(([c, sw], k) => (
            <path key={k} d={d} stroke={c as string} strokeWidth={(sw as number) * s} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={off} />
          ))}
        </svg>
        {brk && <Brk w={w} h={h} cor="#111" />}
      </div>
    );
  }
  if (i === 4) {
    // dot ring loader (black)
    const pct = Math.min(99, Math.floor(37 + f * 1.3) % 100);
    return (
      <div style={{...st, background: '#0E0E10'}}>
        {Array.from({length: 8}).map((_, a) => {
          const ph = ((a - f * 0.35) % 8 + 8) % 8;
          return <div key={a} style={abs({left: 50 * s + 22 * s * Math.cos((a * Math.PI) / 4) - 4 * s, top: h / 2 + 22 * s * Math.sin((a * Math.PI) / 4) - 4 * s, width: 8 * s, height: 8 * s, borderRadius: '50%', background: C.verm, opacity: 0.25 + 0.75 * Math.pow(ph / 8, 2)})} />;
        })}
        {brk && <div style={abs({left: 0, right: 0, top: Math.min(h * 0.76, h / 2 + 34 * s), textAlign: 'center', fontFamily: TEXT, fontWeight: 700, fontSize: 6 * s, letterSpacing: '0.2em', color: '#fff', opacity: 0.7})}>LOADING {pct}%</div>}
        {brk && <Brk w={w} h={h} />}
      </div>
    );
  }
  if (i === 5) {
    // rising bar chart + counter (cream)
    const vals = [22, 30, 28, 45, 70, 96];
    const n = Math.round(327 * E.outCubic(clamp(f / 40)));
    return (
      <div style={{...st, background: C.creme}}>
        <div style={abs({left: 10 * s, top: h * 0.18, ...NUM, fontSize: 26 * s, color: '#111'})}>+{n}%</div>
        <div style={abs({left: 10 * s, right: 10 * s, top: h * 0.42, height: h * 0.4, display: 'flex', gap: 3 * s, alignItems: 'flex-end'})}>
          {vals.map((v, k) => (
            <div key={k} style={{flex: 1, height: `${v * arrive(f, k * 3, 0.14)}%`, background: k < 4 ? '#111' : '#1DB954', borderRadius: `${1.5 * s}px ${1.5 * s}px 0 0`}} />
          ))}
        </div>
        {brk && <Brk w={w} h={h} cor="#111" />}
      </div>
    );
  }
  if (i === 6) {
    // UI checkout card with a tapping button (cobalt + orange)
    const tap = (f % 40) / 40;
    const press = tap > 0.55 && tap < 0.7 ? 1 : 0;
    const cy = lerp(h * 0.95, h * 0.6, E.outCubic(clamp(tap * 1.8)));
    return (
      <div style={{...st, background: C.cobalto}}>
        <div style={abs({left: 12 * s, right: 12 * s, top: h * 0.3, height: h * 0.38, borderRadius: 6 * s, background: '#fff', padding: 6 * s})}>
          <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 7 * s, color: '#111'}}>Checkout</div>
          <div style={{marginTop: 5 * s, height: 4 * s, width: '70%', background: '#E8E8EC', borderRadius: 2 * s}} />
          <div style={{marginTop: 3 * s, height: 4 * s, width: '50%', background: '#E8E8EC', borderRadius: 2 * s}} />
          <div style={abs({left: 6 * s, right: 6 * s, bottom: 6 * s, height: 12 * s, borderRadius: 3 * s, background: C.laranja, color: '#fff', fontFamily: TEXT, fontWeight: 700, fontSize: 6 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.05})`})}>
            Comprar agora
          </div>
        </div>
        <div style={abs({left: 60 * s, top: cy, width: 10 * s, height: 10 * s, borderRadius: '50%', background: 'rgba(255,255,255,.85)', transform: `scale(${1 - press * 0.25})`, boxShadow: '0 2px 6px rgba(0,0,0,.3)'})} />
        {brk && <Brk w={w} h={h} />}
      </div>
    );
  }
  if (i === 7) {
    // particle streaks
    return (
      <div style={{...st, background: '#050506'}}>
        {Array.from({length: 60}).map((_, k) => {
          const sp = 0.6 + hash(k, 3) * 1.6;
          const len = (6 + hash(k, 4) * 16) * s;
          const x = (((hash(k, 1) * 140 + f * sp * 2.2) % 140) - 20) * s;
          const y = hash(k, 2) * h - x * 0.53;
          return <div key={k} style={abs({left: x, top: y, width: len, height: (0.6 + hash(k, 5) * 0.8) * s, background: ['#fff', '#fff', '#fff', '#FF8A5B', '#7FB2FF'][k % 5], transform: 'rotate(-28deg)', opacity: 0.4 + 0.6 * hash(k, 6)})} />;
        })}
        {brk && <Brk w={w} h={h} />}
      </div>
    );
  }
  if (i === 8) {
    // giant countdown (mint)
    const n = 3 - (Math.floor(f / 15) % 3);
    const t = (f % 15) / 15;
    return (
      <div style={{...st, background: C.menta}}>
        <svg width={w} height={h} style={abs({})}>
          <circle cx={w / 2} cy={h * 0.47} r={32 * s} fill="none" stroke="#111" strokeWidth={3 * s} strokeDasharray={2 * Math.PI * 32 * s} strokeDashoffset={2 * Math.PI * 32 * s * t} transform={`rotate(-90 ${w / 2} ${h * 0.47})`} />
        </svg>
        <div style={abs({left: 0, right: 0, top: h * 0.47 - 18 * s, textAlign: 'center', ...NUM, fontSize: 44 * s, color: '#111', transform: `scale(${1 + 0.15 * Math.pow(1 - t, 4)})`})}>0{n}</div>
        {brk && <Brk w={w} h={h} cor="#111" />}
      </div>
    );
  }
  // 9: UGC (real person photo, Pexels free licence) with a TikTok-style caption appearing word by word
  const words = ['funcionou', 'demais'];
  const nw = Math.min(2, Math.floor(f / 10) + 1);
  return (
    <div style={{...st, background: '#B8AFA3'}}>
      <Img src={staticFile('ugc/ugc1.jpg')} style={{position: 'absolute', inset: 0, width: w, height: h, objectFit: 'cover', transform: `scale(${1.04 + 0.0015 * (f % 200)})`}} />
      <div style={abs({left: 6 * s, right: 6 * s, top: h * 0.6, textAlign: 'center', fontFamily: TEXT, fontWeight: 800, fontSize: Math.min(10 * s, 26), color: '#fff', textShadow: '0 1px 0 #000, 0 0 3px #000, 0 0 6px rgba(0,0,0,.6)'})}>
        {words.slice(0, nw).join(' ')}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- waveform from the real voice envelope
export const Onda: React.FC<{
  x: number; y: number; w: number; h: number; k: string; cor?: string; n?: number; ate?: number; f?: number; live?: number; dim?: string; style?: React.CSSProperties;
}> = ({x, y, w, h, k, cor = C.ouro, n, ate = 1, f = 0, live = 0, dim = '#3a3a38', style}) => {
  const v = ONDAS[k];
  const m = n ?? v.length;
  const bw = w / m;
  return (
    <div style={abs({left: x, top: y, width: w, height: h, ...style})}>
      {Array.from({length: m}).map((_, i) => {
        const a = v[Math.floor((i * v.length) / m)];
        const wob = live ? 1 + live * 0.35 * Math.sin(f * 0.5 + i * 1.7) * Math.sin(f * 0.23 + i * 0.9) : 1;
        const hh = Math.max(3, a * h * wob);
        return <div key={i} style={abs({left: i * bw, top: (h - hh) / 2, width: bw * 0.62, height: hh, borderRadius: 2, background: i / m <= ate ? cor : dim})} />;
      })}
    </div>
  );
};

export const Hand: React.FC<{x: number; y: number; s?: number; press?: number; cor?: string; op?: number}> = ({x, y, s = 64, press = 0, cor = C.branco, op = 1}) => (
  <div style={abs({left: x, top: y, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.5))', transform: `scale(${1 - press * 0.12})`, transformOrigin: '30% 10%', opacity: op})}>
    <Icon n="hand-pointing" s={s} c={cor} />
  </div>
);

// burst of thin lines around an impact point (comic "pow" in a minimal way)
export const Burst: React.FC<{f: number; at: number; x: number; y: number; r?: number; n?: number; cor?: string; len?: number}> = ({f, at, x, y, r = 60, n = 10, cor = C.ouro, len = 22}) => {
  const t = f - at;
  if (t < 0 || t > 14) return null;
  const p = E.outCubic(clamp(t / 12));
  return (
    <svg width={SW} height={SH} style={abs({left: 0, top: 0, pointerEvents: 'none'})}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i, at) * 0.4;
        const r0 = r * (0.6 + p * 0.7);
        const l = len * (1 - p);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * (r0 + l)} y2={y + Math.sin(a) * (r0 + l)} stroke={cor} strokeWidth={3} strokeLinecap="round" />;
      })}
    </svg>
  );
};

// faint drifting dot grid: fills flat backgrounds without competing with the focal point
export const DotField: React.FC<{f: number; cor: string; op?: number; gap?: number; drift?: number}> = ({f, cor, op = 0.12, gap = 24, drift = 0.4}) => {
  const oy = (f * drift) % gap;
  return (
    <div
      style={abs({
        inset: -gap,
        opacity: op,
        backgroundImage: `radial-gradient(circle, ${cor} 1.1px, transparent 1.4px)`,
        backgroundSize: `${gap}px ${gap}px`,
        transform: `translateY(${-oy}px)`,
      })}
    />
  );
};

// small mono annotation (editor's notes beside the focal object)
export const Nota: React.FC<{x: number; y: number; txt: string; cor: string; f: number; at: number; align?: 'left' | 'right'}> = ({x, y, txt, cor, f, at, align = 'left'}) => {
  const n = Math.max(0, Math.min(txt.length, Math.floor((f - at) * 1.6)));
  if (n <= 0) return null;
  return (
    <div style={abs({left: align === 'left' ? x : undefined, right: align === 'right' ? SW - x : undefined, top: y, fontFamily: MONO, fontWeight: 500, fontSize: 8.5, letterSpacing: '0.06em', color: cor, opacity: 0.7, whiteSpace: 'pre'})}>
      {txt.slice(0, n)}
    </div>
  );
};

export const Logo: React.FC<{f: string; w: number; style?: React.CSSProperties}> = ({f, w, style}) => <Img src={staticFile(`img/${f}`)} style={{width: w, display: 'block', ...style}} />;

export const Btn: React.FC<{w: number; h: number; txt: string; press?: number; style?: React.CSSProperties; size?: number}> = ({w, h, txt, press = 0, style, size = 46}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      borderRadius: h / 2,
      background: C.ouro,
      color: C.preto,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: DISPLAY,
      fontWeight: 900,
      fontStretch: '75%',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      fontSize: size,
      transform: `scale(${1 - press * 0.05})`,
      boxShadow: `0 ${9 - press * 6}px ${20 - press * 10}px rgba(0,0,0,.38)`,
      ...style,
    }}
  >
    {txt}
  </div>
);

export {approach, arrive, clamp, E, hash, lerp, prog, spring, tween, vel, DirBlur};
