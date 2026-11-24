import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/400-italic.css';
import '@fontsource/source-serif-4/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/inter/500.css';
import {C, FONT, FPS, INTRO, OUTRO, QUADRO_H, ANOS} from './tema';

// ---------- tipos ----------
export type Palavra = {w: string; a: number; b: number};
export type Fala = {id: string; dur: number; palavras: Palavra[]; frases: {a: number; b: number; t: string}[]};
type Quando = number | string; // segundos (a partir do início da voz) ou âncora "palavra", "palavra#2", "palavra+0.3"
export type Evento =
  | {tipo: 'foto'; at: Quando; src: string; credito: string; retrato?: boolean; lado?: number; foco?: [number, number]; zoom?: [number, number]; cor?: boolean; legendaFoto?: string}
  | {tipo: 'doc'; at: Quando; src: string; marcas?: number[]; fonte: string; traducao?: string; rot?: number}
  | {tipo: 'mapa'; at: Quando; src: string; credito: string; asp?: number; pinos?: {x: number; y: number; r: string}[]; foco?: [number, number]; zoom?: [number, number]}
  | {tipo: 'texto'; at: Quando; grande: string; pequeno?: string};
export type Selo = {tipo: 'checagem' | 'contexto'; at: Quando; dur?: number; dito?: string; certo: string; fonte: string};
export type SegProps = {
  id: string; parte: number; total: number; titulo: string; data: string; falante: string; anoAtivo: number;
  fala?: Fala | null; eventos: Evento[]; selos?: Selo[]; aguardando?: boolean;
};

// ---------- âncoras ----------
const limpa = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]/g, '');
export const resolve = (q: Quando, fala?: Fala | null): number => {
  if (typeof q === 'number') return q;
  const m = q.match(/^(.+?)(#(\d+))?([+-][\d.]+)?$/)!;
  const alvo = m[1].split(' ').map(limpa);
  const occ = m[3] ? +m[3] : 1;
  const off = m[4] ? +m[4] : 0;
  const ps = fala?.palavras ?? [];
  let n = 0;
  for (let i = 0; i < ps.length; i++) {
    if (alvo.every((a, k) => ps[i + k] && limpa(ps[i + k].w) === a)) { n++; if (n === occ) return ps[i].a + off; }
  }
  throw new Error(`âncora não encontrada: ${q}`);
};

// ---------- peças ----------
const Grao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.1}}>
      <svg width="100%" height="100%">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Etiqueta: React.FC<{children: React.ReactNode; cor?: string; style?: React.CSSProperties}> = ({children, cor = C.muted, style}) => (
  <div style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 2.4, textTransform: 'uppercase', color: cor, ...style}}>{children}</div>
);

const Credito: React.FC<{t: string}> = ({t}) => (
  <div style={{position: 'absolute', right: 28, bottom: 18, fontFamily: FONT.mono, fontSize: 15, letterSpacing: 0.6, color: 'rgba(245,243,238,0.78)', background: 'rgba(15,15,14,0.72)', padding: '4px 9px'}}>{t}</div>
);

const Foto: React.FC<{e: any; dur: number}> = ({e, dur}) => {
  const f = useCurrentFrame();
  const p = f / Math.max(1, dur);
  const [z0, z1] = e.zoom ?? [1.04, 1.13];
  const [fx, fy] = e.foco ?? [0.5, 0.45];
  const z = interpolate(p, [0, 1], [z0, z1]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.bg}}>
      {e.retrato ? <div style={{position: 'absolute', inset: 0, background: '#151513'}} /> : null}
      <Img src={staticFile(e.src)} style={{position: 'absolute', ...(e.retrato ? {height: '100%', left: `${(e.lado ?? 0.5) * 100}%`, translate: '-50% 0'} : {width: '100%', height: '100%', objectFit: 'cover'}), objectPosition: `${fx * 100}% ${fy * 100}%`,
        transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`, filter: e.cor ? 'saturate(0.9) contrast(1.02)' : 'grayscale(0.92) sepia(0.12) contrast(1.06) brightness(0.96)'}} />
      {e.legendaFoto ? <div style={{position: 'absolute', left: 40, bottom: 22, fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 26, color: C.white, background: 'rgba(15,15,14,0.72)', padding: '6px 12px'}}>{e.legendaFoto}</div> : null}
      <Credito t={e.credito} />
    </AbsoluteFill>
  );
};

type Marcas = Record<string, {marks: number[][][]; aspect: number}>;
const Doc: React.FC<{e: any; dur: number; marcas: Marcas}> = ({e, dur, marcas}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const info = marcas[e.src] ?? {marks: [], aspect: 0.77};
  const usa = (e.marcas ?? [0]).map((i: number) => info.marks[i]).filter(Boolean);
  // página: altura "cheia" 1.0 => cabe no quadro; câmera vai do papel inteiro até a frase
  const pageH = QUADRO_H * 0.94, pageW = pageH * info.aspect;
  const alvo = usa[0] ?? [[0.2, 0.3, 0.8, 0.34]];
  const x0 = Math.min(...alvo.map((l: number[]) => l[0])), x1 = Math.max(...alvo.map((l: number[]) => l[2]));
  const y0 = Math.min(...alvo.map((l: number[]) => l[1])), y1 = Math.max(...alvo.map((l: number[]) => l[3]));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const zAlvo = Math.min(2.6, (1920 * 0.78) / (pageW * (x1 - x0)));
  const ent = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 22});
  const cam = interpolate(f, [0.35 * fps, 1.9 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1)});
  const z = interpolate(cam, [0, 1], [1, zAlvo]) * interpolate(f, [0, dur], [1, 1.04]);
  const tx = interpolate(cam, [0, 1], [0, (0.5 - cx) * pageW]);
  const ty = interpolate(cam, [0, 1], [0, (0.5 - cy) * pageH + QUADRO_H * 0.04]);
  const traduz = interpolate(f, [2.3 * fps, 2.8 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: pageW, height: pageH, marginLeft: -pageW / 2, marginTop: -pageH / 2,
        transform: `translate(${tx * z}px, ${ty * z}px) scale(${z}) rotate(${e.rot ?? -0.8}deg) translateY(${(1 - ent) * 40}px)`, opacity: ent,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#fff'}}>
        <Img src={staticFile(`docs/${e.src}.png`)} style={{width: '100%', height: '100%', filter: 'sepia(0.18) contrast(1.05)'}} />
        {usa.flatMap((linhas: number[][], mi: number) => linhas.map((l, li) => {
          const ini = 1.6 * fps + mi * 1.2 * fps + li * 0.35 * fps;
          const p = interpolate(f, [ini, ini + 0.5 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return <div key={`${mi}-${li}`} style={{position: 'absolute', left: `${(l[0] - 0.004) * 100}%`, top: `${(l[1] - 0.003) * 100}%`, height: `${(l[3] - l[1] + 0.006) * 100}%`,
            width: `${(l[2] - l[0] + 0.008) * 100 * p}%`, background: C.marker, mixBlendMode: 'multiply'}} />;
        }))}
      </div>
      <div style={{position: 'absolute', left: 40, top: 34, maxWidth: 820}}>
        <div style={{display: 'inline-block', background: C.bg, padding: '8px 12px'}}><Etiqueta cor={C.white}>Arquivo · {e.fonte}</Etiqueta></div>
        {e.traducao ? (
          <div style={{marginTop: 10, background: C.paper, color: C.ink, padding: '14px 18px', fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 30, lineHeight: 1.3, opacity: traduz,
            transform: `translateY(${(1 - traduz) * 10}px)`, borderLeft: `5px solid ${C.marker.replace('0.78', '1')}`}}>
            <Etiqueta cor={C.muted} style={{fontStyle: 'normal', fontSize: 15, marginBottom: 6}}>Tradução</Etiqueta>“{e.traducao}”
          </div>) : null}
      </div>
    </AbsoluteFill>
  );
};

const Mapa: React.FC<{e: any; dur: number}> = ({e, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [z0, z1] = e.zoom ?? [1.0, 1.12];
  const [fx, fy] = e.foco ?? [0.5, 0.5];
  const z = interpolate(f, [0, dur], [z0, z1]);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', height: QUADRO_H, width: QUADRO_H * (e.asp ?? 1), transform: 'translate(-50%,-50%)'}}>
          <Img src={staticFile(e.src)} style={{width: '100%', height: '100%', filter: 'grayscale(0.55) sepia(0.15) contrast(1.05)'}} />
          {(e.pinos ?? []).map((p: any, i: number) => {
            const s = spring({frame: f - (0.6 + i * 0.5) * fps, fps, config: {damping: 14, stiffness: 160}});
            return (<div key={i} style={{position: 'absolute', left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: `translate(-50%,-50%) scale(${s / z})`}}>
              <div style={{width: 22, height: 22, borderRadius: 11, background: C.red, border: `3px solid ${C.white}`}} />
              <div style={{position: 'absolute', left: 30, top: -6, whiteSpace: 'nowrap', fontFamily: FONT.mono, fontSize: 24, letterSpacing: 1.5, color: C.ink, background: C.paper, padding: '3px 9px'}}>{p.r}</div>
            </div>);
          })}
        </div>
      </div>
      <Credito t={e.credito} />
    </AbsoluteFill>
  );
};

const Texto: React.FC<{e: any}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 25});
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: FONT.serif, fontWeight: 600, fontSize: e.grande.length > 26 ? Math.round(4400 / e.grande.length) : 170, color: C.white, letterSpacing: -3, textAlign: 'center', maxWidth: 1700, opacity: s, transform: `translateY(${(1 - s) * 24}px)`}}>{e.grande}</div>
      {e.pequeno ? <Etiqueta cor={C.muted} style={{fontSize: 26, marginTop: 18, opacity: s}}>{e.pequeno}</Etiqueta> : null}
    </AbsoluteFill>
  );
};

const SeloCard: React.FC<{s: Selo; dur: number}> = ({s, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ent = spring({frame: f, fps, config: {damping: 200}, durationInFrames: 14});
  const sai = interpolate(f, [dur - 10, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const risco = interpolate(f, [0.45 * fps, 0.85 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const certo = interpolate(f, [0.85 * fps, 1.2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cor = s.tipo === 'checagem' ? C.red : '#5C6B73';
  return (
    <div style={{position: 'absolute', right: 40, top: 40, width: 560, background: C.paper, color: C.ink, padding: '18px 22px 16px',
      opacity: ent * sai, transform: `translateX(${(1 - ent) * 30}px)`, boxShadow: '0 18px 50px rgba(0,0,0,0.45)', borderTop: `6px solid ${cor}`}}>
      <Etiqueta cor={cor} style={{fontWeight: 500}}>{s.tipo === 'checagem' ? 'Checagem · correção' : 'Contexto'}</Etiqueta>
      {s.dito ? (
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 8, fontFamily: FONT.serif}}>
          <span style={{position: 'relative', fontSize: 40, color: C.muted}}>“{s.dito}”
            <span style={{position: 'absolute', left: -4, top: '52%', height: 4, width: `${risco * 104}%`, background: C.red}} /></span>
          <span style={{fontSize: 52, fontWeight: 600, opacity: certo}}>{s.certo}</span>
        </div>
      ) : <div style={{marginTop: 8, fontFamily: FONT.serif, fontSize: 36, lineHeight: 1.2, fontWeight: 600}}>{s.certo}</div>}
      <div style={{marginTop: 8, fontFamily: FONT.mono, fontSize: 16, color: C.muted, lineHeight: 1.4}}>Fonte: {s.fonte}</div>
    </div>
  );
};

const Linha: React.FC<{ativo: number; p: number}> = ({ativo, p}) => (
  <div style={{position: 'relative', width: 1300, height: 90}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 20, height: 2, background: C.line}} />
    <div style={{position: 'absolute', left: 0, top: 20, height: 2, width: `${(ativo / (ANOS.length - 1)) * 100 * p}%`, background: C.white}} />
    {ANOS.map((a, i) => {
      const on = i === ativo;
      return (<div key={i} style={{position: 'absolute', left: `${(i / (ANOS.length - 1)) * 100}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center'}}>
        <div style={{width: on ? 18 : 10, height: on ? 18 : 10, borderRadius: 9, margin: `${on ? 12 : 16}px auto 0`, background: i <= ativo ? C.white : C.line, outline: on ? `6px solid rgba(245,243,238,0.18)` : 'none'}} />
        <div style={{fontFamily: FONT.mono, fontSize: 22, color: on ? C.white : C.muted, marginTop: 12}}>{a.a}</div>
        <div style={{fontFamily: FONT.mono, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase', color: on ? C.white : '#5d5a54', marginTop: 4, whiteSpace: 'nowrap'}}>{a.l}</div>
      </div>);
    })}
  </div>
);

export const Capitulo: React.FC<{p: SegProps; dur: number}> = ({p, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: {damping: 200}, durationInFrames: 24});
  const b = spring({frame: f - 12, fps, config: {damping: 200}, durationInFrames: 24});
  const linha = interpolate(f, [10, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const sai = interpolate(f, [dur - 12, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: sai}}>
      <Etiqueta cor={C.muted} style={{opacity: a, fontSize: 22}}>Parte {String(p.parte).padStart(2, '0')} de {String(p.total).padStart(2, '0')} · {p.data}</Etiqueta>
      <div style={{fontFamily: FONT.serif, fontSize: 96, color: C.white, marginTop: 18, letterSpacing: -1.5, opacity: a, transform: `translateY(${(1 - a) * 18}px)`, textAlign: 'center', maxWidth: 1500, lineHeight: 1.05}}>{p.titulo}</div>
      <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 36, color: C.muted, marginTop: 18, opacity: b}}>por {p.falante}</div>
      <div style={{marginTop: 70, opacity: b}}><Linha ativo={p.anoAtivo} p={linha} /></div>
    </AbsoluteFill>
  );
};

const Legenda: React.FC<{fala: Fala; t0: number}> = ({fala, t0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - t0;
  const fr = fala.frases.find((x) => t >= x.a - 0.05 && t < x.b + 0.25);
  if (!fr) return null;
  const op = interpolate(t, [fr.a - 0.05, fr.a + 0.08], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: QUADRO_H, height: 1080 - QUADRO_H, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT.sans, fontWeight: 500, fontSize: 50, lineHeight: 1.22, color: C.white, textAlign: 'center', whiteSpace: 'pre-line', opacity: op}}>{fr.t}</div>
    </div>
  );
};

const TagParte: React.FC<{p: SegProps}> = ({p}) => (
  <div style={{position: 'absolute', left: 40, top: QUADRO_H + 26, fontFamily: FONT.mono, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: '#6f6b63'}}>
    {String(p.parte).padStart(2, '0')} · {p.falante}
  </div>
);

// ---------- segmento ----------
export const Segmento: React.FC<SegProps & {marcas: Marcas}> = (p) => {
  const {fps, durationInFrames} = useVideoConfig();
  const intro = Math.round(INTRO * fps);
  const fala = p.fala;
  const ev = p.eventos.map((e) => ({...e, t: resolve(e.at, fala)})).sort((a, b) => a.t - b.t);
  const X = 14; // dissolve em frames
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence durationInFrames={intro}><Capitulo p={p} dur={intro} /></Sequence>
      {fala && !p.aguardando ? (
        <>
          <Sequence from={intro}><Audio src={staticFile(`falas/${p.id}.wav`)} /></Sequence>
          <AbsoluteFill style={{top: 0, height: QUADRO_H, overflow: 'hidden'}}>
            {ev.map((e, i) => {
              const ini = intro + Math.round(e.t * fps);
              const fim = i + 1 < ev.length ? intro + Math.round(ev[i + 1].t * fps) + X : durationInFrames;
              const dur = fim - ini;
              return (
                <Sequence key={i} from={ini} durationInFrames={dur} layout="none">
                  <Dissolve dur={dur} x={X} primeiro={i === 0}>
                    {e.tipo === 'foto' ? <Foto e={e} dur={dur} /> : e.tipo === 'doc' ? <Doc e={e} dur={dur} marcas={p.marcas} /> : e.tipo === 'mapa' ? <Mapa e={e} dur={dur} /> : <Texto e={e} />}
                  </Dissolve>
                </Sequence>
              );
            })}
            <Grao />
          </AbsoluteFill>
          {(p.selos ?? []).map((s, i) => {
            const ini = intro + Math.round(resolve(s.at, fala) * fps);
            const dur = Math.round((s.dur ?? 5.5) * fps);
            return <Sequence key={'s' + i} from={ini} durationInFrames={dur}><SeloCard s={s} dur={dur} /></Sequence>;
          })}
          <Sequence from={intro}><Legenda fala={fala} t0={0} /><TagParte p={p} /></Sequence>
        </>
      ) : (
        <Sequence from={intro}>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <Etiqueta cor={C.muted} style={{fontSize: 26}}>Espaço reservado · aguardando a gravação de {p.falante}</Etiqueta>
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

const Dissolve: React.FC<{dur: number; x: number; primeiro: boolean; children: React.ReactNode}> = ({dur, x, primeiro, children}) => {
  const f = useCurrentFrame();
  const op = primeiro ? interpolate(f, [0, x], [0, 1], {extrapolateRight: 'clamp'}) : interpolate(f, [0, x], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>;
};

export const duracaoSeg = (p: SegProps) => {
  const voz = p.fala && !p.aguardando ? p.fala.dur + OUTRO : 4;
  return Math.round((INTRO + voz) * FPS);
};
