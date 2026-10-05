import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/special-elite/400.css';
import {C, FILTRO, approach, arrive, clamp, rand} from './lib';

export const SERIF = "'Cormorant Garamond', serif";
export const TYPE = "'Special Elite', monospace";
export const SANS = "'Inter Variable', sans-serif";

export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const specs = [
      `700 100px 'Cormorant Garamond'`, `600 100px 'Cormorant Garamond'`, `500 100px 'Cormorant Garamond'`,
      `italic 500 40px 'Cormorant Garamond'`, `400 40px 'Special Elite'`, `500 50px 'Inter Variable'`,
    ];
    Promise.all(specs.map((s) => document.fonts.load(s, 'AÇÃÉÍÕÚ açãéíõú 0123456789·')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

// Grão de filme animado + vinheta fotográfica (Tinoco: grão, poeira, vinheta forte)
export const Grain: React.FC<{amount?: number; vignette?: number}> = ({amount = 0.1, vignette = 0.75}) => {
  const frame = useCurrentFrame();
  const i = Math.floor(frame / 2) % 8; // grão troca a cada 2 quadros (15 Hz, como película a 24)
  const ox = Math.floor(rand(frame) * 512), oy = Math.floor(rand(frame + 99) * 512);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile(`grain/${i}.png`)})`,
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: 'overlay',
          opacity: amount * 2.2,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(8,5,3,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Foto com tratamento e Ken Burns (≈1% por segundo, nunca parada)
// Foto ou trecho de vídeo (obra do Canal Preto em public/obra/*.mp4, mudo): o vídeo começa a tocar em `from`.
export const Midia: React.FC<{src: string; from: number; style: React.CSSProperties}> = ({src, from, style}) =>
  src.endsWith('.mp4') ? (
    <Sequence from={from} layout="none">
      <OffthreadVideo src={staticFile(src)} muted style={style} />
    </Sequence>
  ) : (
    <Img src={staticFile(src)} style={style} />
  );

export const Photo: React.FC<{
  src: string; from: number; filter?: keyof typeof FILTRO | string; zoom0?: number; zoomRate?: number;
  x0?: number; y0?: number; dx?: number; dy?: number; style?: React.CSSProperties; fit?: 'cover' | 'contain';
}> = ({src, from, filter = 'atual', zoom0 = 1.04, zoomRate = 0.011, x0 = 0, y0 = 0, dx = 0, dy = 0, style, fit = 'cover'}) => {
  const frame = useCurrentFrame();
  const t = (frame - from) / 30;
  const s = zoom0 + zoomRate * t;
  const flt = (FILTRO as Record<string, string>)[filter] ?? filter;
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <Midia
        src={src}
        from={from}
        style={{
          width: '100%', height: '100%', objectFit: fit, filter: flt,
          transform: `translate(${x0 + dx * t}px, ${y0 + dy * t}px) scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Etiqueta de máquina de escrever numa fita de papel, digitada letra a letra (Tinoco 18:00)
export const TypeTag: React.FC<{
  text: string; start: number; x: number; y: number; size?: number; cps?: number; rot?: number; end?: number;
}> = ({text, start, x, y, size = 34, cps = 18, rot = -1.2, end}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const n = Math.min(text.length, Math.floor(((frame - start) / 30) * cps) + 1);
  const grow = arrive(frame, start, 0.2);
  const out = end !== undefined ? clamp((frame - end) / 6) : 0;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scaleX(${0.94 + 0.06 * grow})`,
        transformOrigin: '0 50%', opacity: 1 - out,
      }}
    >
      <div
        style={{
          background: C.papelFita, padding: `${size * 0.32}px ${size * 0.55}px ${size * 0.26}px`,
          boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
          clipPath: `inset(0 ${(1 - grow) * 100}% 0 0)`,
          fontFamily: TYPE, fontSize: size, color: C.tinta, letterSpacing: '0.04em', whiteSpace: 'pre',
        }}
      >
        <span>{text.slice(0, n)}</span>
        <span style={{opacity: 0}}>{text.slice(n)}</span>
      </div>
    </div>
  );
};

// Fita de nome (lower third): papel claro, serifada, entra pela máscara da esquerda
export const NameTape: React.FC<{name: string; role?: string; start: number; dur?: number; x?: number; y?: number}> = ({
  name, role, start, dur = 120, x = 150, y = 700,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur + 14) return null;
  const inP = arrive(frame, start, 0.16);
  const outP = clamp((t - dur) / 12);
  const lineP = arrive(frame, start + 6, 0.14);
  const textY = approach(frame, start + 3, 34, 0, 0.16);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: 1 - outP}}>
      <div style={{width: 520 * lineP, height: 3, background: C.vermelho, marginBottom: 14}} />
      <div style={{overflow: 'hidden', height: 86}}>
        <div
          style={{
            fontFamily: SERIF, fontWeight: 600, fontSize: 76, lineHeight: '86px', color: C.papel,
            letterSpacing: '-0.01em', transform: `translateY(${textY}px)`, opacity: inP,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          {name}
        </div>
      </div>
      {role && (
        <div
          style={{
            fontFamily: TYPE, fontSize: 25, color: C.papel, opacity: 0.8 * arrive(frame, start + 10, 0.14),
            letterSpacing: '0.12em', marginTop: 8, textTransform: 'uppercase',
          }}
        >
          {role}
        </div>
      )}
    </div>
  );
};

// Chuva procedural: riscos finos inclinados, três camadas de profundidade
export const Rain: React.FC<{start: number; intensity?: number; opacity?: number}> = ({start, intensity = 1, opacity = 0.5}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const drops = [] as React.ReactNode[];
  const N = Math.round(260 * intensity);
  for (let i = 0; i < N; i++) {
    const layer = i % 3; // 0 perto, 2 longe
    const speed = [95, 70, 48][layer];
    const len = [120, 80, 46][layer];
    const w = [2.2, 1.5, 1][layer];
    const a = [0.55, 0.38, 0.25][layer];
    const x0 = rand(i * 3.1) * 2300 - 200;
    const period = (1080 + len + 200) / speed;
    const phase = rand(i * 7.7) * period;
    const k = ((t + phase) % period) / period;
    const y = -len - 100 + k * (1080 + len + 200);
    const x = x0 + (y + 100) * 0.16;
    drops.push(
      <line key={i} x1={x} y1={y} x2={x - len * 0.16} y2={y - len} stroke={C.papel} strokeWidth={w} strokeOpacity={a} strokeLinecap="round" />,
    );
  }
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen'}}>
      <svg width={1920} height={1080}>{drops}</svg>
    </AbsoluteFill>
  );
};

// Legenda cinética (Tinoco): palavras já ditas apagadas, atual branca; uma "palavra-chave" em vermelho
export const Kinetic: React.FC<{
  words: {w: string; s: number}[]; size?: number; y?: number; accent?: string[]; end?: number; family?: string;
}> = ({words, size = 92, y = 540, accent = [], end, family = SERIF}) => {
  const frame = useCurrentFrame();
  const out = end !== undefined ? clamp((frame - end) / 8) : 0;
  const lastIdx = words.reduce((acc, w, i) => (frame >= w.s ? i : acc), -1);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - out}}>
      <div style={{position: 'absolute', top: y - size * 0.6, width: 1500, textAlign: 'center'}}>
        {words.map((w, i) => {
          const vis = frame >= w.s;
          const p = arrive(frame, w.s, 0.22);
          const isAccent = accent.includes(w.w);
          const col = isAccent ? C.terracota : i === lastIdx ? C.papel : C.apagado;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block', marginRight: size * 0.26, fontFamily: family, fontWeight: 600, fontSize: size,
                color: col, opacity: vis ? p : 0, transform: `translateY(${(1 - p) * 18}px)`,
                filter: `blur(${(1 - p) * 6}px)`, textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
