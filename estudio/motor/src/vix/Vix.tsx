import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/800-italic.css';
import '@fontsource/montserrat/900-italic.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource-variable/inter/opsz.css';
import {V, TXT, W, H, Spec, Pal} from './tema';
import {Gancho, Secao, Telas, Preco, Passos, Suporte, Dor, Titulo, CTA} from './Blocos';
import {SPECS} from './specs';

export type Props = {id: string};

export const calcula: CalculateMetadataFunction<Props> = ({props}) => {
  const s = SPECS[props.id];
  return {durationInFrames: Math.round(s.dur * 30), fps: 30, width: W, height: H};
};

const BLOCOS: Record<string, React.FC<any>> = {Gancho, Secao, Telas, Preco, Passos, Suporte, Dor, Titulo, CTA};

// Legenda contínua: Inter 500, base a 87% da altura, até 2 linhas, sem caixa, sem karaokê
type Cue = {txt: string; s: number; e: number};
const cues = (pal: Pal[], fim: number): Cue[] => {
  const out: Cue[] = [];
  let cur: Pal[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({txt: cur.map((p) => p.w).join(' '), s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  pal.forEach((p, i) => {
    cur.push(p);
    const len = cur.map((x) => x.w).join(' ').length;
    const fimFrase = /[.?!]$/.test(p.w);
    const virg = /,$/.test(p.w) && len > 18;
    if (fimFrase || virg || len > 34) flush();
  });
  flush();
  return out.map((c, i) => ({...c, e: Math.min(out[i + 1] ? out[i + 1].s : fim, c.e + 0.45)}));
};

const Legenda: React.FC<{pal: Pal[]; fim: number}> = ({pal, fim}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cs = React.useMemo(() => cues(pal, fim), [pal, fim]);
  const c = cs.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const a = interpolate(t, [c.s - 0.05, c.s + 0.1, c.e - 0.08, c.e], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 90, width: W - 180, bottom: H * 0.13, textAlign: 'center', fontFamily: TXT, fontWeight: 500, fontSize: 54, lineHeight: 1.22, color: V.txt, opacity: a, textShadow: '0 2px 14px rgba(1,2,4,0.9)'}}>
      {c.txt}
    </div>
  );
};

// Faixa suave que cobre a legenda original (desfoque forte + degradê até o fundo da marca)
const Faixa: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.70, bottom: 0, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(34px)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 22%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.70, bottom: 0, background: `linear-gradient(180deg, rgba(1,2,4,0) 0%, rgba(1,2,4,0.9) 26%, rgba(1,2,4,0.97) 50%, ${V.bg} 100%)`}} />
    {/* topo: cobre o canto com o nome de outro aplicativo e dá lugar ao nosso selo */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(26px)', WebkitMaskImage: 'linear-gradient(180deg, #000 30%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 30%, transparent 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, background: `linear-gradient(180deg, rgba(1,2,4,0.92) 0%, rgba(1,2,4,0.6) 50%, rgba(1,2,4,0) 100%)`}} />
    <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 54, top: 50, width: 230}} />
  </>
);

export const Vix: React.FC<Props> = ({id}) => {
  const s: Spec = SPECS[id];
  const [h] = React.useState(() => delayRender('fontes'));
  React.useEffect(() => {
    Promise.all([
      document.fonts.load("900 italic 100px 'Montserrat'", 'AÇÃO ção 0123'),
      document.fonts.load("800 100px 'Montserrat'", 'SAIBA MAIS'),
      document.fonts.load("500 40px 'Inter Variable'", 'áéíóú ç'),
      document.fonts.load("700 40px 'Inter Variable'", 'áéíóú ç'),
    ]).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  return (
    <AbsoluteFill style={{background: V.bg, overflow: 'hidden'}}>
      {s.clips.map((c, i) => {
        const from = Math.round(c.t0 * 30);
        const dur = Math.max(1, Math.round((c.t1 - c.t0) * 30));
        const z = c.zoom ?? 1.2;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <ClipV c={c} z={z} />
          </Sequence>
        );
      })}
      <Faixa />
      {s.ev.map((e, i) => {
        const B = BLOCOS[e.bloco];
        const from = Math.round(e.t0 * 30);
        const dur = Math.max(1, Math.round((e.t1 - e.t0) * 30));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <B dur={e.t1 - e.t0} {...(e.p ?? {})} />
          </Sequence>
        );
      })}
      <Legenda pal={s.pal} fim={s.dur} />
      <Audio src={staticFile(s.audio)} />
    </AbsoluteFill>
  );
};

const ClipV: React.FC<{c: Spec['clips'][number]; z: number}> = ({c, z}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o}}>
      <OffthreadVideo src={staticFile(`vix/${c.src}.mp4`)} startFrom={Math.round(c.ss * 30)} muted style={{width: W, height: H, objectFit: 'cover', filter: c.blur ? `blur(${c.blur}px)` : undefined, transform: `scale(${z})`, transformOrigin: `${c.ox ?? 82}% ${c.oy ?? 62}%`}} />
    </AbsoluteFill>
  );
};
