import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/montserrat/900-italic.css';
import '@fontsource-variable/inter/opsz.css';
import PAL from './palavras.json';

// Mini VSL da página /gratis (VixPlay TV, 25/11/2026). Quadros aprovados em quadros.html (A01..A13);
// cada evento preso à palavra falada (palavras.json, Groq).
const FPS = 30;
const W = 1080;
const H = 1920;
export const DUR_GRATIS = Math.round(48.4 * FPS);

const C = {bg: '#050805', neon: '#99e200', sobre: '#061000', muted: '#b9c4b4', apagado: '#6d7a68', borda: '#2c3a24', av: '#1c2a14', txt: '#ffffff'};
const MONT = 'Montserrat';
const INTER = "'Inter Variable', Inter, sans-serif";

type P = {w: string; s: number; e: number};
const pal = PAL as P[];

const useT = () => useCurrentFrame() / FPS;
const sp = (t: number, at: number, damping = 14, stiffness = 140) => spring({frame: Math.round((t - at) * FPS), fps: FPS, config: {damping, stiffness, mass: 0.9}});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Entra subindo com mola no tempo `at` (segundos absolutos)
const Up: React.FC<{at: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties; pop?: boolean}> = ({at, children, dy = 60, style, pop}) => {
  const t = useT();
  const k = sp(t, at, pop ? 9 : 14, pop ? 180 : 140);
  const o = interpolate(t, [at - 0.02, at + 0.12], [0, 1], clamp);
  const sc = pop ? interpolate(k, [0, 1], [0.6, 1]) : 1;
  return <div style={{opacity: o, transform: `translateY(${(1 - k) * dy}px) scale(${sc})`, ...style}}>{children}</div>;
};

// Cena: entra com leve zoom e sai com fade curto
const Cena: React.FC<{a: number; b: number; children: React.ReactNode; bg?: string}> = ({a, b, children, bg}) => {
  const t = useT();
  const o = interpolate(t, [a, a + 0.18, b - 0.14, b], [0, 1, 1, 0], clamp);
  const s = interpolate(t, [a, b], [1.035, 1], clamp);
  if (t < a - 0.05 || t > b + 0.05) return null;
  return <AbsoluteFill style={{opacity: o, transform: `scale(${s})`, background: bg}}>{children}</AbsoluteFill>;
};

const Foto: React.FC<{src: string; a: number; b: number}> = ({src, a, b}) => {
  const t = useT();
  const s = interpolate(t, [a, b], [1.12, 1.0], clamp);
  return (
    <>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', transform: `scale(${s})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,rgba(5,8,5,.92) 0%,rgba(5,8,5,.55) 38%,rgba(5,8,5,.15) 60%,rgba(5,8,5,.85) 100%)'}} />
    </>
  );
};

const k = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: MONT, fontWeight: 900, fontSize: size, letterSpacing: -2, lineHeight: 1.02, color: C.txt, ...extra});
const G: React.FC<{children: React.ReactNode; i?: boolean}> = ({children, i}) => <span style={{color: C.neon, fontStyle: i ? 'italic' : 'normal'}}>{children}</span>;
const Wrap: React.FC<{top: number; center?: boolean; children: React.ReactNode}> = ({top, center, children}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: center ? 'center' : 'left'}}>{children}</div>
);

const Av: React.FC<{l: string; at: number}> = ({l, at}) => (
  <Up at={at} pop dy={0}>
    <span style={{width: 120, height: 120, borderRadius: '50%', background: C.av, border: `5px solid ${C.neon}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 50, color: C.neon}}>{l}</span>
  </Up>
);

// Preço que desce 30 → 25 → 15 → 0 conforme os amigos entram
const PRECOS: [number, number][] = [[23.68, 25], [25.98, 15], [30.3, 0]];
const PrecoVivo: React.FC = () => {
  const t = useT();
  let v = 30;
  let from = 30;
  let at = 0;
  for (const [s, p] of PRECOS) if (t >= s) { from = v; v = p; at = s; }
  const kk = at ? sp(t, at, 16, 160) : 1;
  const shown = Math.max(v, Math.min(from, Math.round(from + (v - from) * kk)));
  const bump = at ? interpolate(t, [at, at + 0.12, at + 0.35], [1, 1.12, 1], clamp) : 1;
  return (
    <div>
      <p style={{fontFamily: MONT, fontWeight: 800, fontSize: 80, color: C.apagado, textDecoration: 'line-through', opacity: t >= 23.68 ? 1 : 0}}>R$ 30</p>
      <p style={{...k(230, {letterSpacing: -6, lineHeight: 1}), color: t >= 23.68 ? C.neon : C.txt, transform: `scale(${bump})`, transformOrigin: 'left center'}}>R$ {shown}</p>
    </div>
  );
};

// Legenda contínua: Inter 500, ~50 px, base a 87%, até 2 linhas, sem caixa, sem karaokê
type Cue = {txt: string; s: number; e: number};
const montaCues = (fim: number): Cue[] => {
  const out: Cue[] = [];
  let cur: P[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({txt: cur.map((p) => p.w).join(' '), s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  pal.forEach((p, i) => {
    cur.push(p);
    const len = cur.map((x) => x.w).join(' ').length;
    const prox = pal[i + 1];
    const pausa = prox ? prox.s - p.e > 0.35 : true;
    if (/[.?!]$/.test(p.w) || (/,$/.test(p.w) && len > 16) || len > 30 || (pausa && len > 8)) flush();
  });
  flush();
  return out.map((c, i) => ({...c, e: Math.min(out[i + 1] ? out[i + 1].s : fim, c.e + 0.45)}));
};
const CUES = montaCues(47.6);
const Legenda: React.FC = () => {
  const t = useT();
  const c = CUES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const o = interpolate(t, [c.s - 0.05, c.s + 0.08, c.e - 0.08, c.e], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: H * 0.87 - 60, textAlign: 'center', fontFamily: INTER, fontWeight: 500, fontSize: 50, lineHeight: 1.25, color: C.txt, opacity: o, textShadow: '0 2px 14px rgba(1,2,4,0.95)'}}>
      {c.txt}
    </div>
  );
};

const useFontes = () => {
  const [h] = React.useState(() => delayRender('fontes'));
  React.useEffect(() => {
    Promise.all(["900 100px Montserrat", "800 100px Montserrat", "italic 900 100px Montserrat", "500 40px 'Inter Variable'", "600 40px 'Inter Variable'"].map((s) => document.fonts.load(s, 'AÇÃÊ açãê R$ 0123')))
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

const SFX: [string, number, number][] = [
  // [arquivo, segundo, volume]
  ['sfx_thud.wav', 7.7, 0.55],
  ['sfx_swish.wav', 12.85, 0.35],
  ['sfx_pop.wav', 17.2, 0.5],
  ['sfx_tick.wav', 20.18, 0.35],
  ['sfx_tick.wav', 20.4, 0.35],
  ['sfx_tick.wav', 21.04, 0.35],
  ['sfx_tick.wav', 21.4, 0.35],
  ['sfx_pop.wav', 23.68, 0.45],
  ['sfx_pop.wav', 25.98, 0.45],
  ['sfx_impact.wav', 30.3, 0.5],
  ['sfx_whoosh.wav', 31.0, 0.3],
  ['sfx_riser.wav', 36.0, 0.25],
  ['sfx_press.wav', 45.7, 0.5],
];

export const Gratis: React.FC = () => {
  useFontes();
  const t = useT();
  const passos = [
    {n: '1', txt: 'Pague o Pix', at: 40.04},
    {n: '2', txt: 'Acesso na hora', at: 41.14},
    {n: '3', txt: 'Seu link no app', at: 42.8},
  ];
  const meses = [['DEZ', 20.18], ['JAN', 20.4], ['FEV', 21.04], ['MAR', 21.4]] as const;
  const nAmigos = t >= 27.04 ? 6 : t >= 24.86 ? 3 : 1;
  const seta = Math.sin(t * 6) * 18;

  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: INTER, color: C.txt}}>
      <style>{'p{margin:0}'}</style>
      <Audio src={staticFile('gratis/narracao.mp3')} />
      {SFX.map(([f, s, v], i) => (
        <Sequence key={i} from={Math.round(s * FPS)}>
          <Audio src={staticFile(`audio/${f}`)} volume={v} />
        </Sequence>
      ))}

      {/* A01 */}
      <Cena a={0} b={5.6}>
        <Foto src="gratis/fundo-amigos.png" a={0} b={5.6} />
        <Wrap top={300}>
          <Up at={0.05}><p style={k(118)}>Quantas vezes você já <G>indicou</G>?</p></Up>
          <Up at={1.82}><p style={{fontSize: 52, marginTop: 40, fontWeight: 600, color: C.muted}}>uma série, um aplicativo, uma assinatura</p></Up>
        </Wrap>
      </Cena>

      {/* A02 */}
      <Cena a={5.6} b={8.55}>
        <Wrap top={560} center>
          <Up at={5.62}><p style={k(92)}>E quanto você <G>ganhou</G> com isso?</p></Up>
          <Up at={7.7} pop dy={0}><p style={{...k(230, {letterSpacing: -6, lineHeight: 1}), marginTop: 90}}>R$ 0<span style={{fontSize: 110}}>,00</span></p></Up>
        </Wrap>
      </Cena>

      {/* A03 */}
      <Cena a={8.55} b={12.9}>
        <Wrap top={520}>
          <Up at={8.6}><p style={k(64, {color: C.muted})}>A empresa ganhou</p></Up>
          <Up at={9.34}><p style={k(118)}>um cliente.</p></Up>
          <Up at={10.26}><p style={{...k(64, {color: C.muted}), marginTop: 90}}>Você ganhou</p></Up>
          <Up at={11.74} pop><p style={k(118, {color: C.neon, fontStyle: 'italic'})}>"obrigado".</p></Up>
        </Wrap>
      </Cena>

      {/* A04 */}
      <Cena a={12.9} b={14.7}>
        <Wrap top={700} center>
          <Up at={12.96} pop dy={0}><Img src={staticFile('gratis/logo.png')} style={{height: 150}} /></Up>
          <Up at={13.5}><p style={{...k(118), marginTop: 70}}>é <G>diferente.</G></p></Up>
        </Wrap>
      </Cena>

      {/* A05 */}
      <Cena a={14.7} b={20.1}>
        <Wrap top={520}>
          <Up at={14.74}><p style={k(92)}>Cada amigo que assina pelo seu <G>link</G></p></Up>
          <div style={{display: 'flex', gap: 18, marginTop: 50}}><Av l="A" at={14.94} /></div>
          <Up at={17.2} pop dy={0} style={{transformOrigin: 'left center'}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 60, padding: '26px 40px', borderRadius: 999, background: C.neon, color: C.sobre, fontFamily: MONT, fontWeight: 900, fontSize: 72}}>
              − R$ 5 <span style={{fontSize: 44}}>na sua mensalidade</span>
            </div>
          </Up>
        </Wrap>
      </Cena>

      {/* A06 */}
      <Cena a={20.1} b={22.45}>
        <Wrap top={560}>
          <Up at={20.12}><p style={k(92)}>Todo mês, enquanto ele <G>continuar.</G></p></Up>
          <div style={{display: 'flex', gap: 16, marginTop: 60}}>
            {meses.map(([m, at]) => (
              <Up key={m} at={at} pop dy={0}>
                <div style={{width: 170, padding: '24px 0', borderRadius: 24, border: `3px solid ${C.borda}`, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 40, color: C.muted}}>
                  {m}<span style={{display: 'block', color: C.neon, fontSize: 46, marginTop: 8}}>−5</span>
                </div>
              </Up>
            ))}
          </div>
        </Wrap>
      </Cena>

      {/* A07–A09: uma cena contínua, os amigos se somam e o preço desce */}
      <Cena a={22.45} b={31.1}>
        <Wrap top={470}>
          <div style={{display: 'flex', gap: 18, flexWrap: 'wrap'}}>
            {Array.from({length: nAmigos}, (_, i) => (
              <Av key={i} l={'ABCDEF'[i]} at={i === 0 ? 22.48 : i < 3 ? 24.86 + (i - 1) * 0.12 : 27.04 + (i - 3) * 0.12} />
            ))}
          </div>
          <p style={{...k(64), marginTop: 40}}>{nAmigos} {nAmigos === 1 ? 'amigo' : 'amigos'}</p>
          <div style={{marginTop: 30}}><PrecoVivo /></div>
          <Up at={30.3}><p style={{...k(64), marginTop: 20}}>mensalidade <G>zerada</G></p></Up>
        </Wrap>
      </Cena>

      {/* A10 */}
      <Cena a={31.1} b={36.05}>
        <Foto src="gratis/fundo-familia.png" a={31.1} b={36.05} />
        <Wrap top={300}>
          <Up at={31.16}><p style={k(64, {color: C.muted})}>Você já indica de graça.</p></Up>
          <Up at={32.4}><p style={{...k(118), marginTop: 30}}>Agora a indicação volta pro <G>seu bolso.</G></p></Up>
        </Wrap>
      </Cena>

      {/* A11 */}
      <Cena a={36.05} b={38.9}>
        <Wrap top={640} center>
          <Up at={36.08}><p style={k(92)}>Você nunca viu isso numa</p></Up>
          <Up at={37.52} pop dy={0}><p style={{...k(118, {color: C.neon}), marginTop: 20}}>assinatura de TV.</p></Up>
        </Wrap>
      </Cena>

      {/* A12 */}
      <Cena a={38.9} b={45.65}>
        <Wrap top={380}>
          <Up at={38.94}><p style={k(118)}>Assine <G>agora.</G></p></Up>
          <div style={{marginTop: 70, display: 'grid', gap: 30}}>
            {passos.map((p) => (
              <Up key={p.n} at={p.at}>
                <div style={{display: 'flex', alignItems: 'center', gap: 30, fontSize: 52, fontWeight: 600}}>
                  <b style={{width: 90, height: 90, borderRadius: 24, background: C.neon, color: C.sobre, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontSize: 50, flex: 'none'}}>{p.n}</b>
                  {p.txt}
                </div>
              </Up>
            ))}
          </div>
        </Wrap>
      </Cena>

      {/* A13 */}
      <Cena a={45.65} b={48.5}>
        <Wrap top={420} center>
          <Up at={45.67} pop dy={0}><Img src={staticFile('gratis/logo.png')} style={{height: 150}} /></Up>
          <Up at={45.9}><p style={{...k(92), marginTop: 70}}>Sua TV pode sair <G>de graça.</G></p></Up>
        </Wrap>
        <Up at={46.1} pop dy={0} style={{position: 'absolute', left: 120, right: 120, top: 1090}}>
          <div style={{padding: 52, borderRadius: 40, background: C.neon, color: C.sobre, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 66, transform: `scale(${interpolate(t, [45.7, 45.82, 46.0], [1, 0.95, 1], clamp)})`}}>
            Assinar e pegar meu link
          </div>
        </Up>
        <Up at={46.42} dy={0} style={{position: 'absolute', left: 0, right: 0, top: 1395 + seta, textAlign: 'center'}}>
          <span style={{fontSize: 120, color: C.neon, fontFamily: MONT, fontWeight: 900}}>↓</span>
        </Up>
      </Cena>

      <Legenda />
    </AbsoluteFill>
  );
};
