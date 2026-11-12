// Meu Terceirão · piloto "Tempo Perdido" (81 s, 1920x1080, 30 fps)
// Plano: pessoal-vitor/meu-terceirao/trabalho/referencias/PESQUISA.md
// Tempos das palavras: pessoal-vitor/meu-terceirao/trabalho/musica/piloto-audio.palavras.json
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/inter/500.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/caveat/700.css';
import {approach, clamp, spring, tween, E, hash, lerp, DirBlur} from '../../kit';

const FPS = 30;
export const DUR = Math.round(81 * FPS);
const s = (t: number) => Math.round(t * FPS);
const P = (n: string) => staticFile(`terceirao/${n}.jpg`);
const PNG = (n: string) => staticFile(`terceirao/${n}.png`);
const V = (n: string) => staticFile(`terceirao/${n}.mp4`);
const CREME = '#ece4d1';
const FUNDO = '#0e0d0b';
const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";
const MAO = "'Caveat', cursive";

// Tempos (s) de cada palavra cantada no áudio do piloto (transcrição Groq, conferida)
const T = {
  acordo: [8.76, 8.78, 9.38, 9.88, 10.46],
  naoTenho: [14.6, 15.1, 15.68, 16.52, 17.02, 17.5, 17.94],
  masTenho: [18.1, 19.02, 19.6, 20.46],
  temosTodo: [23.9, 24.74, 25.68, 26.2, 26.62, 27.32],
  abraca: [29.2, 29.7, 29.96, 31.0],
  meDiz: [34.6, 35.22, 35.7, 36.02, 36.38, 36.9, 37.16, 37.54, 38.54, 41.3, 42.78],
  tnp1: [45.4, 46.14, 46.78, 47.8],
  tnp2: [50.68, 51.3, 51.86, 52.98],
  tnp3: [55.72, 56.48, 57.12, 58.24],
  nemFoi: [59.16, 60.22, 60.58, 61.26],
  somos: [64.18, 65.14, 65.58],
  tao2: [70.2, 70.76],
  tao3: [75.32, 75.9],
};

const useFontes = () => {
  const [h] = React.useState(() => delayRender('fontes terceirao'));
  React.useEffect(() => {
    Promise.all([
      document.fonts.load("italic 400 100px 'Instrument Serif'", 'tempo perdido ãõçé'),
      document.fonts.load("400 100px 'Instrument Serif'", 'tempo'),
      document.fonts.load("500 40px 'Inter'", '231 232'),
      document.fonts.load("500 40px 'JetBrains Mono'", 'PLAY 00:00'),
      document.fonts.load("700 40px 'Caveat'", 'trote nós'),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};

// Cor de lembrança boa: quente, amarelada, saturada (n=1) até cor viva (n=0)
const filtro = (n: number) =>
  `sepia(${lerp(0.08, 0.38, n).toFixed(3)}) saturate(${lerp(1.2, 1.4, n).toFixed(3)}) contrast(${lerp(1.0, 0.92, n).toFixed(3)}) brightness(${lerp(1, 1.05, n).toFixed(3)})`;

// tremida de 2 quadros na troca de slide (projetor)
const tremida = (f: number, from: number, seed: number) => {
  const d = f - from;
  if (d < 0 || d > 1) return 'translate(0,0)';
  return `translate(${((hash(seed + d, 7) - 0.5) * 7).toFixed(1)}px, ${((hash(seed + d, 11) - 0.5) * 5).toFixed(1)}px)`;
};

const Grao: React.FC<{op?: number}> = ({op = 0.07}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: op, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id="grao">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao)" />
    </svg>
  );
};

// "Lembrança": as bordas clareiam e desfocam, o brilho sobe (pedido do Vítor). i = 0..1
const Lembranca: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const ii = clamp(i);
  return (
    <AbsoluteFill>
      {children}
      {ii > 0.01 && (
        <AbsoluteFill
          style={{
            filter: `blur(${(22 * ii).toFixed(1)}px) brightness(${(1 + 0.5 * ii).toFixed(3)})`,
            WebkitMaskImage: `radial-gradient(ellipse 70% 65% at 50% 50%, transparent ${(42 - 10 * ii).toFixed(0)}%, black 100%)`,
            maskImage: `radial-gradient(ellipse 70% 65% at 50% 50%, transparent ${(42 - 10 * ii).toFixed(0)}%, black 100%)`,
            opacity: ii,
          }}
        >
          {children}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 65% at 50% 50%, rgba(255,236,200,0) 45%, rgba(255,236,200,${(0.55 * ii).toFixed(3)}) 100%)`, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

// ---------- Sequência de fotos em tela cheia com transições de edit ----------
type Tipo = 'corte' | 'zoom' | 'empurra' | 'cruza' | 'flash';
type Item = {src?: string; dupla?: [string, string]; t: number; tipo?: Tipo; ox?: number; oy?: number; kb?: number};
const ImgCheia: React.FC<{src: string; bw: number; ox: number; oy: number; sc: number; extra?: string}> = ({src, bw, ox, oy, sc, extra = ''}) => (
  <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${ox}% ${oy}%`, transform: `scale(${sc.toFixed(4)}) ${extra}`, transformOrigin: `${ox}% ${oy}%`, filter: filtro(bw)}} />
);
const Sombra: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.62) 100%)'}} />;
const Quadro: React.FC<{it: Item; bw: number; t: number; extra?: string}> = ({it, bw, t, extra}) => {
  const ox = it.ox ?? 50, oy = it.oy ?? 45, kb = it.kb ?? 0.06;
  if (it.dupla) {
    const st: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', filter: filtro(bw), transformOrigin: '50% 40%'};
    return (
      <AbsoluteFill style={{background: FUNDO}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 956, height: 1080, overflow: 'hidden'}}>
          <Img src={P(it.dupla[0])} style={{...st, transform: `scale(${(1 + kb * t).toFixed(4)})`}} />
        </div>
        <div style={{position: 'absolute', left: 964, top: 0, width: 956, height: 1080, overflow: 'hidden'}}>
          <Img src={P(it.dupla[1])} style={{...st, transform: `scale(${(1 + kb - kb * t).toFixed(4)})`}} />
        </div>
        <Sombra />
      </AbsoluteFill>
    );
  }
  return (
    <>
      <ImgCheia src={P(it.src!)} bw={bw} ox={ox} oy={oy} sc={1 + kb * t} extra={extra} />
      <Sombra />
    </>
  );
};
const Sequencia: React.FC<{itens: Item[]; fim: number; bw?: (f: number) => number}> = ({itens, fim, bw}) => {
  const f = useCurrentFrame();
  if (f < s(itens[0].t) || f >= s(fim)) return null;
  let i = itens.length - 1;
  while (i > 0 && f < s(itens[i].t)) i--;
  const it = itens[i];
  const prox = i + 1 < itens.length ? s(itens[i + 1].t) : s(fim);
  const a = s(it.t);
  const t = (f - a) / Math.max(1, prox - a);
  const g = bw ? bw(f) : 0;
  const TR = 7;
  const d = f - a;
  const tipo = it.tipo ?? 'corte';
  const ant = i > 0 ? itens[i - 1] : null;
  if (tipo === 'flash') {
    // foto de máquina: clarão de 2 quadros e a foto "assenta" de 1,06 para 1
    const k = approach(f, a, 0, 1, 0.22);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `scale(${(1.06 - 0.06 * k).toFixed(4)})`}}>
          <Quadro it={it} bw={g} t={t} />
        </AbsoluteFill>
        {d < 3 && <AbsoluteFill style={{background: '#fff6e6', opacity: d === 0 ? 0.9 : d === 1 ? 0.5 : 0.2}} />}
      </AbsoluteFill>
    );
  }
  if (tipo === 'corte' || d >= TR || !ant) {
    return (
      <AbsoluteFill style={{transform: tremida(f, a, a)}}>
        <Quadro it={it} bw={g} t={t} />
      </AbsoluteFill>
    );
  }
  const k = E.expr(d / TR);
  if (tipo === 'zoom') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `scale(${(1 + 0.08 * k).toFixed(4)})`, filter: `blur(${(6 * k).toFixed(1)}px)`}}>
          <Quadro it={ant} bw={g} t={1} />
        </AbsoluteFill>
        <AbsoluteFill style={{opacity: k, transform: `scale(${lerp(1.3, 1, k).toFixed(4)})`, filter: `blur(${(10 * (1 - k)).toFixed(1)}px)`}}>
          <Quadro it={it} bw={g} t={t} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (tipo === 'empurra') {
    const v = (E.expr((d + 0.5) / TR) - E.expr((d - 0.5) / TR)) * 1920;
    return (
      <AbsoluteFill style={{background: FUNDO}}>
        <DirBlur x={v * 0.012} style={{position: 'absolute', inset: 0, transform: `translateX(${(-1920 * k * 0.6).toFixed(1)}px)`}}>
          <AbsoluteFill><Quadro it={ant} bw={g} t={1} /></AbsoluteFill>
        </DirBlur>
        <DirBlur x={v * 0.012} style={{position: 'absolute', inset: 0, transform: `translateX(${(1920 * (1 - k)).toFixed(1)}px)`}}>
          <AbsoluteFill><Quadro it={it} bw={g} t={t} /></AbsoluteFill>
        </DirBlur>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Quadro it={ant} bw={g} t={1} />
      <AbsoluteFill style={{opacity: k}}><Quadro it={it} bw={g} t={t} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

// Cartão de álbum (moldura creme) com foto ou vídeo dentro
const Cartao: React.FC<{x: number; y: number; w: number; h: number; rot?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, rot = 0, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: 14, background: CREME, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', transform: `rotate(${rot}deg)`, ...style}}>
    <div style={{width: '100%', height: '100%', overflow: 'hidden', background: '#111'}}>{children}</div>
  </div>
);

const Clipe: React.FC<{src: string; from: number; to: number; startFrom?: number; bw?: number; rate?: number}> = ({src, from, to, startFrom = 0, bw = 0, rate = 0.5}) => {
  const f = useCurrentFrame();
  if (f < s(from) || f >= s(to)) return null;
  return <OffthreadVideo src={src} startFrom={startFrom} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(bw)}} />;
};

// ---------- Tipografia: cada palavra entra no instante em que é cantada ----------
type Efeito = 'sobe' | 'foco' | 'passa' | 'cresce' | 'encosta' | 'afasta' | 'dissolve';
const Linha: React.FC<{palavras: string[]; tempos: number[]; ate: number; y?: number; size?: number; x?: number; align?: 'center' | 'left'; efeito?: Efeito; efeitoEm?: number[]; saida?: 'fade' | 'passa' | 'dissolve'; cor?: string}> = ({palavras, tempos, ate, y = 930, size = 84, x, align = 'center', efeito = 'sobe', efeitoEm, saida = 'fade', cor = CREME}) => {
  const f = useCurrentFrame();
  const a = s(tempos[0]), b = s(ate);
  const SAI = saida === 'fade' ? 8 : 18;
  if (f < a || f >= b + SAI) return null;
  const sai = clamp((f - b) / SAI);
  const ks = E.expr(sai);
  let saidaStyle: React.CSSProperties = {opacity: 1 - sai, transform: `translateY(${(-14 * sai).toFixed(1)}px)`};
  if (saida === 'passa') saidaStyle = {opacity: 1 - ks, transform: `translateX(${(-700 * ks).toFixed(1)}px)`, filter: `blur(${(12 * ks).toFixed(1)}px)`};
  if (saida === 'dissolve') saidaStyle = {opacity: 1};
  return (
    <div style={{position: 'absolute', left: x ?? 0, right: x == null ? 0 : undefined, top: y, textAlign: align, fontFamily: SERIF, fontStyle: 'italic', fontSize: size, color: cor, lineHeight: 1, whiteSpace: 'nowrap', ...saidaStyle}}>
      {palavras.map((p, i) => {
        const t0 = s(tempos[i]);
        const k = approach(f, t0, 0, 1, 0.2);
        const ef = efeitoEm && !efeitoEm.includes(i) ? 'sobe' : efeito;
        let st: React.CSSProperties = {opacity: k, transform: `translateY(${((1 - k) * 0.35 * size).toFixed(1)}px)`};
        if (ef === 'foco') st = {opacity: k, filter: `blur(${((1 - k) * 16).toFixed(1)}px)`, transform: `scale(${(1.08 - 0.08 * k).toFixed(4)})`};
        if (ef === 'passa') st = {opacity: k, transform: `translateX(${((1 - k) * 260).toFixed(1)}px)`, filter: `blur(${((1 - k) * 10).toFixed(1)}px)`};
        if (ef === 'cresce') {
          const sp = spring(f, t0, 0.3, 0.7);
          st = {opacity: clamp(sp * 3), transform: `scale(${(0.7 + 0.42 * sp).toFixed(4)})`, display: 'inline-block', transformOrigin: '50% 80%', marginLeft: '0.08em', marginRight: '0.08em'};
        }
        if (ef === 'encosta') {
          const sp = spring(f, t0, 0.26, 0.72);
          const lado = i % 2 === 0 ? -1 : 1;
          st = {opacity: clamp(sp * 3), transform: `translateX(${(lado * 420 * (1 - sp)).toFixed(1)}px)`};
        }
        if (ef === 'afasta') {
          const dur = Math.max(1, (i + 1 < tempos.length ? s(tempos[i + 1]) : b) - t0);
          const u = clamp((f - t0) / dur);
          st = {opacity: k, letterSpacing: `${(0.5 * E.cam(u)).toFixed(3)}em`, filter: `blur(${(3 * u).toFixed(1)}px)`, transform: `translateY(${((1 - k) * 0.35 * size).toFixed(1)}px)`};
        }
        if (ef === 'dissolve') {
          const dur = 46;
          const u = clamp((f - t0 - 16) / dur);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: k, transform: `translateY(${((1 - k) * 0.35 * size).toFixed(1)}px)`}}>
              {p.split('').map((ch, j) => {
                const e = E.cam(clamp((u - j * 0.04) / 0.75));
                return (
                  <span key={j} style={{display: 'inline-block', opacity: 1 - e, filter: `blur(${(14 * e).toFixed(1)}px)`, transform: `translate(${((hash(j, 3) - 0.5) * 220 * e).toFixed(1)}px, ${((hash(j, 5) - 0.7) * 160 * e).toFixed(1)}px) rotate(${((hash(j, 9) - 0.5) * 30 * e).toFixed(1)}deg)`}}>{ch}</span>
                );
              })}
            </span>
          );
        }
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.26em'}}>
            <span style={{display: 'inline-block', ...st}}>{p}</span>
          </span>
        );
      })}
    </div>
  );
};

const lembrancaCheia = () => 1;

// Vazamento de luz (referências PMV): clarão laranja→branco que atravessa o quadro em 12 quadros
const VazamentoLuz: React.FC<{em: number[]}> = ({em}) => {
  const f = useCurrentFrame();
  const t0 = em.map(s).find((a) => f >= a - 2 && f < a + 10);
  if (t0 == null) return null;
  const u = (f - (t0 - 2)) / 12;
  const env = Math.sin(Math.PI * clamp(u));
  const x = lerp(-40, 140, u);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: env}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 120% at ${x.toFixed(1)}% 40%, rgba(255,255,245,0.95) 0%, rgba(255,190,90,0.8) 30%, rgba(255,120,40,0.35) 55%, rgba(255,120,40,0) 75%)`, filter: 'blur(18px)'}} />
    </AbsoluteFill>
  );
};

// Sombra de planta passando devagar sobre a mesa (gobo)
const SombraPlanta: React.FC<{from: number; op?: number}> = ({from, op = 0.34}) => {
  const f = useCurrentFrame();
  const d = f - s(from);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity: op}}>
      <Img src={PNG('planta-sombra')} style={{position: 'absolute', left: -300 + d * 0.9, top: -420 + d * 0.25, width: 2300, filter: 'blur(26px)', transform: `rotate(${(-12 + d * 0.01).toFixed(2)}deg)`}} />
    </AbsoluteFill>
  );
};

// Fita adesiva translúcida nos cantos de um cartão
const Fita: React.FC<{lado: 'esq' | 'dir'}> = ({lado}) => (
  <div style={{position: 'absolute', top: -14, [lado === 'esq' ? 'left' : 'right']: -26, width: 120, height: 34, background: 'rgba(255,232,160,0.6)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transform: `rotate(${lado === 'esq' ? -40 : 40}deg)`, borderLeft: '1px dashed rgba(255,255,255,0.5)', borderRight: '1px dashed rgba(255,255,255,0.5)'}} />
);

// Parede de palavras repetidas (textura tipográfica), linhas deslizando em sentidos alternados
const ParedePalavras: React.FC<{palavra: string; from: number; cor?: string; op?: number}> = ({palavra, from, cor = CREME, op = 0.13}) => {
  const f = useCurrentFrame();
  const d = f - s(from);
  const linhas = Array.from({length: 7}, (_, i) => i);
  const txt = Array(14).fill(palavra).join('  ');
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: op}}>
      {linhas.map((i) => (
        <div key={i} style={{position: 'absolute', top: -60 + i * 170, left: 0, whiteSpace: 'nowrap', fontFamily: SERIF, fontStyle: i % 2 ? 'italic' : 'normal', fontSize: 170, lineHeight: 1, color: cor, transform: `translateX(${(-900 + (i % 2 ? 1 : -1) * d * 1.4 - (i % 2 ? 0 : 400)).toFixed(1)}px)`}}>{txt}</div>
      ))}
    </AbsoluteFill>
  );
};

// HUD de filmadora (REC, timecode, cantoneiras)
const HudRec: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const t = (f - s(from)) / FPS;
  const tc = `00:0${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(Math.floor((t * 30) % 30)).padStart(2, '0')}`;
  const canto = (st: React.CSSProperties) => <div style={{position: 'absolute', width: 70, height: 70, border: '4px solid rgba(255,255,255,0.85)', ...st}} />;
  return (
    <AbsoluteFill style={{fontFamily: MONO, fontWeight: 500, fontSize: 36, color: '#f6f3ea', textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
      {canto({left: 90, top: 80, borderRight: 'none', borderBottom: 'none'})}
      {canto({right: 90, top: 80, borderLeft: 'none', borderBottom: 'none'})}
      {canto({left: 90, bottom: 80, borderRight: 'none', borderTop: 'none'})}
      {canto({right: 90, bottom: 80, borderLeft: 'none', borderTop: 'none'})}
      <div style={{position: 'absolute', left: 190, top: 100, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 22, height: 22, borderRadius: 11, background: '#ff2a2a', opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}} />REC
      </div>
      <div style={{position: 'absolute', right: 190, top: 100}}>{tc}</div>
      <div style={{position: 'absolute', left: 190, bottom: 100, letterSpacing: '0.1em'}}>AF  ●  4X ZOOM</div>
      <div style={{position: 'absolute', right: 190, bottom: 100}}>▮▮▮▯</div>
    </AbsoluteFill>
  );
};

// ---------- Intro: sala retrô, TV de tubo, fita antiga, as lembranças começam (0–8.76 s) ----------
// Tela da TV em tv2.jpg (1920x1080): centro (1091,488), 698x522
const TELA = {cx: 1091, cy: 488, w: 698, h: 522};
const TW = 2792, TH = 2088; // conteúdo da tela renderizado a 4x (nítido quando a câmera entra)
const SLIDES_TV: Item[] = [
  {dupla: ['f34v', 'f06v'], t: 2.26},
  {src: 'f37h', t: 3.56, tipo: 'corte'},
  {dupla: ['f08v', 'f44v'], t: 4.86},
  {src: 'f02h', t: 6.16, tipo: 'corte'},
  {dupla: ['f09v', 'f43v'], t: 7.46},
];
const TelaVHS: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const liga = t >= 0.8;
  const linha = clamp((t - 0.8) / 0.25);
  const chuvisco = t >= 1.05 && t < 2.26;
  const tc = Math.max(0, t - 1.05);
  const timecode = `${String(Math.floor(tc / 60)).padStart(2, '0')}:${String(Math.floor(tc % 60)).padStart(2, '0')}:${String(Math.floor((tc * 30) % 30)).padStart(2, '0')}`;
  const rasgo = SLIDES_TV.some((it) => f >= s(it.t) && f < s(it.t) + 3) || (f >= s(1.05) && f < s(1.05) + 6);
  const ry = (300 + hash(f, 21) * 500) * 2;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: TW, height: TH, background: '#050505', overflow: 'hidden', borderRadius: 60}}>
      {liga && linha < 1 && (
        <div style={{position: 'absolute', left: (TW * (1 - linha)) / 2, top: TH / 2 - 20, width: TW * linha, height: 24 + 140 * (1 - linha), background: '#fff', filter: 'blur(8px)'}} />
      )}
      {chuvisco && (
        <svg width={TW} height={TH} style={{position: 'absolute', inset: 0}}>
          <filter id="chuva">
            <feTurbulence type="fractalNoise" baseFrequency="0.3 0.45" numOctaves={1} seed={f * 7} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncR type="gamma" exponent="0.6" /><feFuncG type="gamma" exponent="0.6" /><feFuncB type="gamma" exponent="0.6" /></feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#chuva)" />
        </svg>
      )}
      {t >= 2.26 && (
        <>
          <AbsoluteFill style={{filter: 'contrast(1.08)'}}>
            <Sequencia itens={SLIDES_TV} fim={9} bw={lembrancaCheia} />
          </AbsoluteFill>
          <AbsoluteFill style={{transform: 'translateX(7px)', mixBlendMode: 'screen', opacity: 0.35, filter: 'url(#soR)'}}>
            <Sequencia itens={SLIDES_TV} fim={9} bw={lembrancaCheia} />
          </AbsoluteFill>
          <AbsoluteFill style={{transform: 'translateX(-7px)', mixBlendMode: 'screen', opacity: 0.35, filter: 'url(#soC)'}}>
            <Sequencia itens={SLIDES_TV} fim={9} bw={lembrancaCheia} />
          </AbsoluteFill>
          <svg width={0} height={0} style={{position: 'absolute'}}>
            <filter id="soR"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
            <filter id="soC"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
          </svg>
        </>
      )}
      {rasgo && t >= 1.05 && (
        <div style={{position: 'absolute', left: 0, top: ry, width: TW, height: 60 + hash(f, 4) * 90, background: 'rgba(255,255,255,0.25)', transform: `translateX(${((hash(f, 2) - 0.5) * 140).toFixed(0)}px)`, filter: 'blur(4px)'}} />
      )}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.26) 0px, rgba(0,0,0,0.26) 4px, rgba(0,0,0,0) 6px, rgba(0,0,0,0) 12px)', opacity: liga ? 1 : 0}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}} />
      {t >= 1.5 && (
        <div style={{position: 'absolute', inset: 0, fontFamily: MONO, fontWeight: 500, color: '#f6f3ea', textShadow: '4px 0 0 rgba(255,0,0,0.45), -4px 0 0 rgba(0,255,255,0.45)', fontSize: 126, opacity: 0.92}}>
          <div style={{position: 'absolute', left: 200, top: 150, opacity: Math.floor(t * 2) % 2 === 0 || t >= 2.26 ? 1 : 0.2}}>▶ PLAY</div>
          <div style={{position: 'absolute', right: 200, top: 150}}>{timecode}</div>
          <div style={{position: 'absolute', left: 200, bottom: 150, fontSize: 104, letterSpacing: '0.08em'}}>LEMBRANÇAS</div>
          <div style={{position: 'absolute', right: 200, bottom: 150, fontSize: 104}}>SP</div>
        </div>
      )}
    </div>
  );
};
const IntroTV: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (f >= s(8.76)) return null;
  // câmera: a sala inteira (1,0), aproxima devagar até 1,18, depois entra na tela até ela encher o quadro
  let z = 1.0 + 0.18 * E.cam(clamp(t / 6.4));
  if (t >= 6.4) z = tween(f, s(6.4), s(8.76) - s(6.4), 1.18, 3.6, E.inQuad);
  const c = clamp((z - 1) / 1.4); // quanto a tela já está centralizada
  const luz = t >= 0.8 ? 0.4 + 0.12 * hash(f, 13) : 0;
  const lemb = clamp((t - 7.0) / 1.76);
  const escuro = clamp(1 - t / 0.9);
  return (
    <Lembranca i={lemb}>
      <AbsoluteFill style={{background: '#1a120c'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${TELA.cx}px ${TELA.cy}px`, transform: `translate(${((960 - TELA.cx) * c).toFixed(1)}px, ${((540 - TELA.cy) * c).toFixed(1)}px) scale(${z.toFixed(4)})`}}>
          <Img src={P('tv2')} style={{width: 1920, height: 1080, display: 'block', filter: filtro(0.4)}} />
          <div style={{position: 'absolute', left: TELA.cx - TELA.w / 2, top: TELA.cy - TELA.h / 2, width: TELA.w, height: TELA.h, overflow: 'hidden', borderRadius: 14}}>
            <div style={{transformOrigin: '0 0', transform: `scale(${(TELA.w / TW).toFixed(5)}, ${(TELA.h / TH).toFixed(5)})`}}>
              <TelaVHS />
            </div>
          </div>
          {/* luz da tela espalhando pela sala */}
          <div style={{position: 'absolute', left: TELA.cx - 700, top: TELA.cy - 560, width: 1400, height: 1120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,230,190,0.22) 0%, rgba(255,230,190,0) 60%)', opacity: luz, mixBlendMode: 'screen', pointerEvents: 'none'}} />
        </div>
        <AbsoluteFill style={{background: '#000', opacity: escuro}} />
      </AbsoluteFill>
    </Lembranca>
  );
};

// ---------- Cena 1: "Todos os dias quando acordo" (8.76–14.6): o texto sai do foco ----------
const Acordo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(8.76) || f >= s(14.6)) return null;
  const k1 = approach(f, s(8.76), 0, 1, 0.18);
  const k2 = approach(f, s(10.46), 0, 1, 0.18);
  const lemb = clamp(1 - (f - s(8.76)) / 20) * 0.8;
  return (
    <Lembranca i={lemb}>
      <AbsoluteFill style={{background: FUNDO}}>
        {f < s(10.46) && (
          <Cartao x={330} y={70} w={1260} h={736} style={{opacity: k1, transform: `translateY(${((1 - k1) * 60).toFixed(1)}px)`}}>
            <Clipe src={V('v02')} from={8.76} to={10.46} startFrom={15} bw={1} />
          </Cartao>
        )}
        {f >= s(10.46) && (
          <Cartao x={735} y={60} w={450} h={780} rot={-1.5} style={{opacity: k2, transform: `rotate(-1.5deg) translateY(${((1 - k2) * 60).toFixed(1)}px)`}}>
            <Clipe src={V('v15')} from={10.46} to={14.6} startFrom={60} bw={1} />
          </Cartao>
        )}
        <Linha palavras={['todos', 'os', 'dias', 'quando', 'acordo']} tempos={T.acordo} ate={14.4} y={900} efeito="foco" />
      </AbsoluteFill>
    </Lembranca>
  );
};

// ---------- Cena 2a: "Não tenho mais o tempo que passou" (14.6–18.1): fotos de máquina, com clarão ----------
// ---------- Cena 2b: "mas tenho muito tempo" (18.1–23.9): tira de filme com muitas fotos ----------
const TIRA = [
  {src: 'f21v', w: 390},
  {src: 'f16h', w: 693},
  {src: 'f25h', w: 693},
  {src: 'f33v', w: 390},
  {src: 'f35h', w: 693},
  {src: 'f23v', w: 390},
];
const Tira: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(18.1) || f >= s(23.9)) return null;
  const k = approach(f, s(18.1), 0, 1, 0.14);
  const vel = 19; // px por quadro: uma foto a cada ~batida
  const x = 1250 - (f - s(18.1)) * vel;
  const H = 520, GAP = 18, PAD = 70;
  const total = TIRA.reduce((a, b) => a + b.w + GAP, 0) + 200;
  const furos = Array.from({length: Math.ceil(total / 60)}, (_, i) => i);
  let cx = 100;
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <ParedePalavras palavra="tempo" from={18.1} />
      <div style={{position: 'absolute', left: x, top: 190, height: H + PAD * 2, width: total, background: '#171410', transform: `rotate(-3deg) translateY(${((1 - k) * 120).toFixed(1)}px)`, transformOrigin: '0 50%', opacity: k, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
        {furos.map((i) => (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: i * 60 + 14, top: 22, width: 30, height: 26, borderRadius: 5, background: FUNDO}} />
            <div style={{position: 'absolute', left: i * 60 + 14, bottom: 22, width: 30, height: 26, borderRadius: 5, background: FUNDO}} />
          </React.Fragment>
        ))}
        {TIRA.map((it, i) => {
          const left = cx;
          cx += it.w + GAP;
          return (
            <div key={i} style={{position: 'absolute', left, top: PAD, width: it.w, height: H, overflow: 'hidden', background: '#000'}}>
              <Img src={P(it.src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(1)}} />
            </div>
          );
        })}
      </div>
      <Linha palavras={['mas', 'tenho', 'muito', 'tempo']} tempos={T.masTenho} ate={23.7} efeito="cresce" efeitoEm={[2, 3]} />
    </AbsoluteFill>
  );
};
const Passou: React.FC = () => (
  <>
    <Sequencia
      bw={lembrancaCheia}
      fim={18.1}
      itens={[
        {src: 'f36h', t: 14.6, tipo: 'flash', oy: 40},
        {src: 'f14h', t: 15.68, tipo: 'flash'},
        {src: 'f17h', t: 17.02, tipo: 'flash'},
        {src: 'f13h', t: 17.94, tipo: 'flash'},
      ]}
    />
    <Linha palavras={['não', 'tenho', 'mais', 'o', 'tempo', 'que', 'passou,']} tempos={T.naoTenho} ate={18.0} efeito="passa" saida="passa" />
    <Tira />
  </>
);

// ---------- Cena 3: "Temos todo o tempo do mundo" (23.9–29.2): profundidade, a cor fica viva ----------
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(23.9) || f >= s(29.2)) return null;
  const bw = 1 - clamp((f - s(23.9)) / (s(26.2) - s(23.9)));
  const t = (f - s(23.9)) / (s(29.2) - s(23.9));
  const kw = approach(f, s(26.2), 0, 1, 0.15);
  const lemb = clamp((f - s(26.2)) / (s(29.2) - s(26.2))) * 0.85;
  const k2 = spring(f, s(27.32), 0.3, 0.72);
  const kin = approach(f, s(23.9), 0, 1, 0.2);
  const par = (f - s(23.9)) * 0.9;
  // fundo e recorte com a MESMA transformação (as pessoas não duplicam); o fundo desfoca e escurece quando a palavra entra
  const tr = `scale(${(1.03 + 0.03 * t).toFixed(4)})`;
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <Lembranca i={lemb}>
        <AbsoluteFill style={{opacity: kin, transform: tr, transformOrigin: '50% 80%', filter: `blur(${(2 + 4 * kw).toFixed(1)}px) brightness(${(1 - 0.25 * kw).toFixed(3)})`}}>
          <ImgCheia src={P('f22h')} bw={bw} ox={50} oy={50} sc={1} />
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 640, lineHeight: 0.9, color: CREME, opacity: kw, transform: `translateX(${(-par * 0.6).toFixed(1)}px) translateY(${((1 - kw) * 60).toFixed(1)}px) scale(${(0.96 + 0.04 * kw).toFixed(4)})`, textShadow: '0 30px 80px rgba(0,0,0,0.35)'}}>
          tempo
        </div>
        <AbsoluteFill style={{opacity: kin, transform: tr, transformOrigin: '50% 80%'}}>
          <Img src={PNG('f22h')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', filter: filtro(bw)}} />
        </AbsoluteFill>
        {f >= s(27.32) && (
          <Cartao x={1090} y={300} w={760} h={570} rot={2} style={{opacity: clamp(k2 * 3), transform: `rotate(${(2 + (1 - k2) * 8).toFixed(2)}deg) translate(${((1 - k2) * 500).toFixed(1)}px, ${((1 - k2) * 160).toFixed(1)}px)`}}>
            <Img src={P('f45h')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1.04 - 0.04 * k2).toFixed(4)})`, filter: filtro(0.3)}} />
          </Cartao>
        )}
      </Lembranca>
      <Linha palavras={['temos', 'todo', 'o', 'tempo', 'do', 'mundo']} tempos={T.temosTodo} ate={29.0} y={960} size={78} />
    </AbsoluteFill>
  );
};

// ---------- Cena 4: "Então me abraça forte" (29.2–34.6): duas fotos e as palavras se encostam ----------
const Abraca: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(29.2) || f >= s(34.6)) return null;
  const k = spring(f, s(29.2), 0.23, 0.8);
  const ap = spring(f, s(31.0), 0.5, 0.5);
  const squeeze = 1 - 0.035 * Math.sin(Math.PI * clamp(ap));
  const xa = lerp(-700, 388, k), xb = lerp(1920, 972, k);
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      {f < s(32.6) ? (
        <>
          <Cartao x={xa} y={110} w={560} h={760} rot={-2.5} style={{transform: `rotate(-2.5deg) scaleX(${squeeze.toFixed(4)})`, transformOrigin: '100% 50%'}}>
            <Img src={P('f01v')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.5)}} />
          </Cartao>
          <Cartao x={xb} y={110} w={560} h={760} rot={2} style={{transform: `rotate(2deg) scaleX(${squeeze.toFixed(4)})`, transformOrigin: '0% 50%'}}>
            <Img src={P('f30v')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.5)}} />
          </Cartao>
        </>
      ) : (
        <Sequencia itens={[{src: 'f28h', t: 32.6, kb: 0.08, oy: 35}]} fim={34.6} bw={() => 0.4} />
      )}
      <Linha palavras={['então', 'me', 'abraça', 'forte']} tempos={T.abraca} ate={34.4} efeito="encosta" efeitoEm={[2, 3]} />
    </AbsoluteFill>
  );
};

// ---------- Cena 5: "Me diz mais uma vez que já estamos distante de tudo" (34.6–45.4) ----------
const Distante: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(34.6) || f >= s(45.4)) return null;
  const k = approach(f, s(34.6), 0, 1, 0.18);
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      {f < s(38.54) && (
        <AbsoluteFill style={{opacity: k}}>
          <Clipe src={V('v05')} from={34.6} to={38.54} startFrom={10} bw={0.6} />
          <Sombra />
          <HudRec from={34.6} />
        </AbsoluteFill>
      )}
      <Sequencia
        fim={45.4}
        bw={() => 0.35}
        itens={[
          {src: 'f24h', t: 38.54, tipo: 'zoom', kb: 0.09, oy: 40},
          {src: 'f12h', t: 42.78, tipo: 'empurra', kb: 0.06, oy: 30},
        ]}
      />
      <Linha palavras={['me', 'diz', 'mais', 'uma', 'vez', 'que', 'já', 'estamos']} tempos={T.meDiz.slice(0, 8)} ate={38.4} />
      <Linha palavras={['distante', 'de', 'tudo']} tempos={T.meDiz.slice(8)} ate={45.2} efeito="afasta" efeitoEm={[0]} />
    </AbsoluteFill>
  );
};

// ---------- Cena 6: "Temos nosso próprio tempo" x3 (45.4–59.16): o mural, com legendas à mão ----------
type Peca = {src: string; t: number; x: number; y: number; w: number; h: number; rot: number; leg?: string};
const PECAS: Peca[] = [
  {src: 'f26h', t: 45.4, x: 0, y: 0, w: 900, h: 675, rot: -1, leg: 'nós'},
  {src: 'f38h', t: 50.68, x: -980, y: -420, w: 620, h: 290, rot: -3},
  {src: 'f40h', t: 51.3, x: 980, y: -400, w: 620, h: 290, rot: 2.5},
  {src: 'f41h', t: 51.86, x: -980, y: 430, w: 620, h: 290, rot: 2},
  {src: 'f42h', t: 52.98, x: 980, y: 430, w: 620, h: 290, rot: -2.5, leg: 'de terno'},
  {src: 'f04h', t: 55.72, x: 0, y: -720, w: 640, h: 480, rot: 1.5, leg: 'trote'},
  {src: 'f05h', t: 56.1, x: -1750, y: 0, w: 640, h: 480, rot: -2},
  {src: 'f11h', t: 56.48, x: 1750, y: 0, w: 640, h: 480, rot: 2.2},
  {src: 'f15h', t: 56.85, x: 0, y: 740, w: 640, h: 480, rot: -1.2},
  {src: 'f18h', t: 57.12, x: -1750, y: -900, w: 640, h: 480, rot: 3, leg: 'trote'},
  {src: 'f19h', t: 57.5, x: 1750, y: -900, w: 640, h: 480, rot: -3},
  {src: 'f32h', t: 57.87, x: -1750, y: 900, w: 640, h: 480, rot: -2.2},
  {src: 'f03h', t: 58.24, x: 1750, y: 900, w: 640, h: 480, rot: 2.6},
  {src: 'f07h', t: 58.6, x: -820, y: -1180, w: 640, h: 480, rot: 1.8},
  {src: 'f29h', t: 58.9, x: 820, y: -1180, w: 640, h: 480, rot: -1.6},
  {src: 'f39h', t: 59.1, x: 0, y: 1300, w: 640, h: 480, rot: 2.1},
];
const Mural: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(45.4) || f >= s(64.18)) return null;
  let cam = 1;
  if (f >= s(47.8)) cam = tween(f, s(47.8), s(50.68) - s(47.8), 1, 0.62, E.cam);
  if (f >= s(50.68)) cam = tween(f, s(50.68), s(55.72) - s(50.68), 0.62, 0.42, E.cam);
  if (f >= s(55.72)) cam = tween(f, s(55.72), s(59.16) - s(55.72), 0.42, 0.3, E.cam);
  if (f >= s(59.16)) cam = tween(f, s(59.16), s(64.18) - s(59.16), 0.3, 0.26, E.cam);
  const escuro = f >= s(59.16) ? clamp((f - s(59.16)) / 14) * 0.8 : 0;
  const deriva = (f - s(45.4)) * 0.15;
  const tinta = f < s(59.16) ? '#2b2620' : CREME;
  return (
    <AbsoluteFill style={{background: '#b89a74'}}>
      <Img src={P('papel')} style={{position: 'absolute', left: -240, top: -135, width: 2400, height: 1350, transform: `scale(${(1 + 0.12 * (1 - cam)).toFixed(4)})`, filter: 'brightness(1.08) saturate(0.9)'}} />
      <div style={{position: 'absolute', left: 960, top: 520, width: 0, height: 0, transform: `scale(${cam.toFixed(4)}) translate(${(-deriva).toFixed(1)}px, ${(deriva * 0.4).toFixed(1)}px)`}}>
        {PECAS.map((p, i) => {
          if (f < s(p.t)) return null;
          const k = approach(f, s(p.t), 0, 1, 0.17);
          const sc = lerp(1.35, 1, k);
          return (
            <div key={i} style={{position: 'absolute', left: p.x - p.w / 2, top: p.y - p.h / 2, width: p.w, height: p.h, padding: 12, paddingBottom: p.leg ? 64 : 12, background: CREME, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: clamp(k * 4), transform: `rotate(${(p.rot + (1 - k) * 8).toFixed(2)}deg) scale(${sc.toFixed(4)})`}}>
              <Img src={P(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filtro(0.35)}} />
              <Fita lado="esq" /><Fita lado="dir" />
              {p.leg && <div style={{position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center', fontFamily: MAO, fontWeight: 700, fontSize: 46, color: '#2b2620', lineHeight: 1}}>{p.leg}</div>}
            </div>
          );
        })}
      </div>
      <SombraPlanta from={45.4} />
      <AbsoluteFill style={{background: FUNDO, opacity: escuro}} />
      <Linha palavras={['temos', 'nosso', 'próprio', 'tempo']} tempos={T.tnp1} ate={50.5} size={84} cor={tinta} />
      <Linha palavras={['temos', 'nosso', 'próprio', 'tempo']} tempos={T.tnp2} ate={55.5} size={96} y={922} cor={tinta} />
      <Linha palavras={['temos', 'nosso', 'próprio', 'tempo']} tempos={T.tnp3} ate={59.0} size={110} y={912} efeito="cresce" efeitoEm={[3]} cor={tinta} />
      <Linha palavras={['nem', 'foi', 'tempo', 'perdido']} tempos={T.nemFoi} ate={64.0} y={440} size={190} efeito="dissolve" efeitoEm={[3]} saida="dissolve" />
    </AbsoluteFill>
  );
};

// ---------- Cena 7: "Somos tão jovens" (64.18–81): texto com profundidade; fecho com a turma dentro das letras ----------
const Extrude: React.FC<{texto: string; t0: number; y: number; ang: number}> = ({texto, t0, y, ang}) => {
  const f = useCurrentFrame();
  const kk = approach(f, s(t0), 0, 1, 0.16);
  const camadas = 14;
  const sombra = Array.from({length: camadas}, (_, i) => {
    const u = i / (camadas - 1);
    const c = Math.round(lerp(150, 34, u));
    return `${(i + 1) * 1.7}px ${(i + 1) * 1.2}px 0 rgb(${c},${Math.round(c * 0.94)},${Math.round(c * 0.8)})`;
  }).join(', ');
  return (
    <div style={{position: 'absolute', left: 980, top: y, perspective: 1400, opacity: kk}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 230, lineHeight: 1, color: CREME, textShadow: sombra, transform: `rotateY(${ang.toFixed(2)}deg) translateY(${((1 - kk) * 70).toFixed(1)}px) translateZ(${((1 - kk) * -300).toFixed(0)}px)`, transformOrigin: '0% 50%'}}>{texto}</div>
    </div>
  );
};
const Jovens: React.FC = () => {
  const f = useCurrentFrame();
  if (f < s(64.18)) return null;
  const k = approach(f, s(64.18), 0, 1, 0.14);
  const t = clamp((f - s(64.18)) / (s(70.2) - s(64.18)));
  const preto = clamp((f - s(78.3)) / 30);
  const kf = approach(f, s(79.0), 0, 1, 0.1);
  const ang = lerp(-22, -8, E.cam(t));
  const lemb = f < s(70.2) ? 0.35 + 0.45 * t : clamp((f - s(75.32)) / 60) * 0.9;
  const dx = (f - s(79.0)) * 0.6;
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <Lembranca i={lemb}>
        <AbsoluteFill style={{background: FUNDO}}>
          {f < s(70.2) && (
            <div style={{position: 'absolute', left: 120, top: 0, width: 720, height: 1080, overflow: 'hidden', opacity: k, transform: `translateY(${((1 - k) * 90).toFixed(1)}px)`}}>
              <Img src={P('f20v')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1 + 0.035 * t).toFixed(4)})`, transformOrigin: '50% 60%', filter: filtro(0.3)}} />
            </div>
          )}
          <Sequencia
            fim={79.4}
            bw={() => 0.35}
            itens={[
              {src: 'f27h', t: 70.2, tipo: 'zoom', kb: 0.07, oy: 45},
              {dupla: ['f10v', 'f31v'], t: 75.32, tipo: 'empurra'},
            ]}
          />
        </AbsoluteFill>
      </Lembranca>
      <AbsoluteFill>
        {f < s(70.2) && (
          <>
            <Extrude texto="somos" t0={64.18} y={290} ang={ang} />
            <Extrude texto="tão" t0={65.14} y={490} ang={ang} />
            <Extrude texto="jovens" t0={65.58} y={690} ang={ang} />
          </>
        )}
        <Linha palavras={['tão', 'jovens']} tempos={T.tao2} ate={75.2} />
        <Linha palavras={['tão', 'jovens']} tempos={T.tao3} ate={78.6} />
        <AbsoluteFill style={{background: FUNDO, opacity: preto}} />
        {f >= s(79.0) && (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: kf}}>
            {/* a turma inteira dentro das letras */}
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 300, lineHeight: 1, padding: '0 40px', backgroundImage: `url(${P('f13h')})`, backgroundSize: '1500px auto', backgroundPosition: `${(-150 - dx).toFixed(1)}px -330px`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'saturate(1.35) brightness(1.45) contrast(1.05)'}}>terceirão</div>
            <div style={{fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 34, color: CREME, letterSpacing: '0.32em', marginTop: 20, opacity: 0.8}}>231 · 232</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Terceirao: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill style={{background: FUNDO}}>
      <Audio src={staticFile('terceirao/piloto-audio.mp3')} />
      <IntroTV />
      <Acordo />
      <Passou />
      <Mundo />
      <Abraca />
      <Distante />
      <Mural />
      <Jovens />
      <VazamentoLuz em={[18.1, 23.9, 29.2, 34.6, 45.4, 64.18, 70.2]} />
      <Grao />
    </AbsoluteFill>
  );
};
