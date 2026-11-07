import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/800-italic.css';
import '@fontsource/montserrat/900-italic.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource-variable/inter/opsz.css';
import {V, TXT, TIT, W, H, Spec, Pal} from './tema';
import {Gancho, Secao, Telas, Preco, Passos, Suporte, Dor, Titulo, CTA, Cena, BannerC1, PopMarca, Kin, Mont, Janela} from './Blocos';
import {SPECS} from './specs';

export type Props = {id: string};

export const calcula: CalculateMetadataFunction<Props> = ({props}) => {
  const s = SPECS[props.id];
  return {durationInFrames: Math.round(s.dur * 30), fps: 30, width: W, height: H};
};

const BLOCOS: Record<string, React.FC<any>> = {Gancho, Secao, Telas, Preco, Passos, Suporte, Dor, Titulo, CTA, Cena, BannerC1, PopMarca, Kin, Mont, Janela};

// Legenda contínua: Inter 500, base a 87% da altura, até 2 linhas, sem caixa, sem karaokê
type Cue = {txt: string; s: number; e: number; ws: Pal[]};
const cues = (pal: Pal[], fim: number): Cue[] => {
  const out: Cue[] = [];
  let cur: Pal[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({txt: cur.map((p) => p.w).join(' '), s: cur[0].s, e: cur[cur.length - 1].e, ws: cur});
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

const Legenda: React.FC<{pal: Pal[]; fim: number; base?: number; mudo?: [number, number][]; blob?: boolean}> = ({pal, fim, base = 0.13, mudo = [], blob}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cs = React.useMemo(() => cues(pal, fim), [pal, fim]);
  const c = cs.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c || mudo.some(([a0, a1]) => t >= a0 - 0.1 && t < a1)) return null;
  const a = interpolate(t, [c.s - 0.05, c.s + 0.1, c.e - 0.08, c.e], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 90, width: W - 180, bottom: H * base, textAlign: 'center', fontFamily: TXT, fontWeight: 500, fontSize: 54, lineHeight: 1.22, color: V.txt, opacity: a, textShadow: '0 2px 14px rgba(1,2,4,0.9)'}}>
      {blob ? c.ws.map((w, i) => {
        // blob: pílula verde atrás da palavra que está sendo falada (pedido do cliente, 07/11/2026)
        const on = t >= w.s - 0.03 && t < (c.ws[i + 1] ? c.ws[i + 1].s - 0.03 : c.e);
        const k = on ? interpolate(t, [w.s - 0.03, w.s + 0.09], [0.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
        return (
          <React.Fragment key={i}>
            <span style={{display: 'inline-block', padding: '0 12px', margin: '0 -6px', borderRadius: 18, fontWeight: on ? 800 : 600, background: on ? V.neon : 'transparent', color: on ? V.sobre : V.txt, textShadow: on ? 'none' : '0 2px 14px rgba(1,2,4,0.9)', transform: `scale(${on ? 1.06 * k + (1 - k) * 0.9 : 1})`, boxShadow: on ? '0 6px 18px rgba(1,2,4,0.45)' : 'none'}}>{w.w}</span>{' '}
          </React.Fragment>
        );
      }) : c.txt}
    </div>
  );
};

// Faixa suave que cobre a legenda original (desfoque forte + degradê até o fundo da marca)
const Faixa: React.FC<{topo?: number}> = ({topo = 0.70}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: H * topo, bottom: 0, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(34px)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 22%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: H * topo, bottom: 0, background: `linear-gradient(180deg, rgba(1,2,4,0) 0%, rgba(1,2,4,0.9) 26%, rgba(1,2,4,0.97) 50%, ${V.bg} 100%)`}} />
    {/* topo: cobre o canto com o nome de outro aplicativo e dá lugar ao nosso selo */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(26px)', WebkitMaskImage: 'linear-gradient(180deg, #000 30%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 30%, transparent 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, background: `linear-gradient(180deg, rgba(1,2,4,0.92) 0%, rgba(1,2,4,0.6) 50%, rgba(1,2,4,0) 100%)`}} />
    <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 54, top: 50, width: 230}} />
  </>
);

// Versão limpa (H): sem faixa escura e sem selo fixo; só um desfoque leve no topo para esconder o nome de outro app
const FaixaLimpa: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', WebkitMaskImage: 'linear-gradient(180deg, #000 40%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 40%, transparent 100%)'}} />
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
      {s.limpo ? <FaixaLimpa /> : <Faixa />}
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
      <Legenda pal={s.pal} fim={s.dur} base={s.legBase} blob={s.blob} mudo={s.limpo ? s.ev.filter((e) => e.bloco === 'PopMarca' || e.bloco === 'CTA').map((e) => [e.t0, e.t1] as [number, number]) : []} />
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

// Quadro-chave para o PDF de aprovação: um still com a imagem de uma take, camadas de motion e legenda
export type QuadroProps = {src?: string; ss?: number; zoom?: number; ox?: number; oy?: number; blur?: number; bloco?: string; p?: any; camadas?: {bloco: string; p?: any}[];
  faixa?: number | false; selo?: boolean; legenda?: string; legendaGrande?: boolean; legendaTop?: number};
export const Quadro: React.FC<QuadroProps> = ({src, ss = 10, zoom = 1.2, ox = 82, oy = 62, blur, bloco, p, camadas, faixa = 0.70, selo = true, legenda, legendaGrande, legendaTop}) => {
  const cs = camadas ?? (bloco ? [{bloco, p}] : []);
  const [h] = React.useState(() => delayRender('fontes-q'));
  React.useEffect(() => {
    Promise.all([document.fonts.load("900 italic 100px 'Montserrat'", 'AÇÃO ção'), document.fonts.load("800 100px 'Montserrat'", 'SAIBA'), document.fonts.load("500 40px 'Inter Variable'", 'áéí'), document.fonts.load("700 40px 'Inter Variable'", 'áéí')]).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  return (
    <AbsoluteFill style={{background: V.bg, overflow: 'hidden'}}>
      {src && <ClipV c={{src, ss, t0: 0, t1: 9, zoom, ox, oy, blur}} z={zoom} />}
      {src && faixa !== false && <Faixa topo={faixa} />}
      {src && faixa === false && selo && <Img src={staticFile('vix/vixplay-logo-mark.png')} style={{position: 'absolute', left: 54, top: 50, width: 230, filter: 'drop-shadow(0 3px 10px rgba(1,2,4,.9))'}} />}
      {cs.map((c, i) => { const B = BLOCOS[c.bloco]; return <B key={i} dur={9} {...(c.p ?? {})} />; })}
      {legenda && src && (legendaGrande ? (
        <div style={{position: 'absolute', left: 60, width: W - 120, top: legendaTop ?? 1290, textAlign: 'center', fontFamily: TIT, fontWeight: 900, fontStyle: 'italic', fontSize: 92, lineHeight: 1.05, textTransform: 'uppercase', color: V.txt, textShadow: '0 4px 18px rgba(1,2,4,0.95)'}}>{legenda}</div>
      ) : (
        <div style={{position: 'absolute', left: 90, width: W - 180, bottom: H * 0.13, textAlign: 'center', fontFamily: TXT, fontWeight: 500, fontSize: 54, lineHeight: 1.22, color: V.txt, textShadow: '0 2px 14px rgba(1,2,4,0.9)'}}>{legenda}</div>
      ))}
    </AbsoluteFill>
  );
};
