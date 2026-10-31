// "Uma gravação, vários vídeos": a mesma fala vira cinco vídeos e a câmera passeia entre eles.
// Cada vídeo é um cartão que toca AO VIVO no mesmo quadro (as versões são as edições reais, não imagens).
// Cartão 0 = palco (bruto -> estúdio com texto atrás da cabeça), 1..3 = EditorVideo com outro roteiro, 4 = órbita 3D.
// A câmera muda de estado presa a palavras: foco (um cartão na tela inteira), leque (todos lado a lado), grade.
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {relogio} from './ancora';
import {EditorVideo} from './EditorVideo';
import {useFontes} from './Fontes';
import {clamp, lerp, mola, tween, E, useQuadroBase} from './kit';
import {Legendas, montaCues} from './Legendas';
import {montaMarca} from './marca';
import {Orbita} from './Orbita';
import {PainelIA, PainelIAEstudio} from './MotionIA';
import {Dissolve, MINI, TelaClaude} from './AppClaude';
import type {Entrada, Palavra, Roteiro} from './tipos';

export type Tema = {visual: 'escuro' | 'colagem' | 'estudio'; papel: string; papel2: string; tema: string; tinta: string; cinza: string; acento: string};
const TEMA_ESCURO: Tema = {visual: 'escuro', papel: '#0A0A0B', papel2: '#1A1A1C', tema: '#0A0A0B', tinta: '#F2F2EF', cinza: '#8A8A8E', acento: '#F2F2EF'};
// 'app': tela do Claude digitando a skill (comando) e a versão k surgindo numa miniatura; envio = palavra em que o comando é enviado
type Camera = {de: string; modo: 'foco' | 'leque' | 'atras' | 'grade' | 'app'; k?: number; comando?: string; envio?: string; nota?: string};
type Atras = {de: string; ate?: string; texto: string};
// tela dividida do bruto (MotionIA): painel de papel em cima se monta com a fala, a pessoa desce para a metade de baixo
type TelaIA = {de: string; ate: string; logo?: string; programa?: string; marcas: {janela: string; carimbo: string; claude: string; corte: string; barra: string; cheio: string}};
export type VitrineProps = Entrada & {
  pessoa: string;
  estilos: Roteiro[]; // cartões 1..n-2
  rotulos: string[]; // um por cartão
  camera: Camera[];
  palco: {cruAte: string; atras: Atras[]; cta?: {de: string; texto: string}; ia?: TelaIA;
    melhora?: {de: string; zoom?: number}}; // 'começa cru e vai melhorando': na palavra `de` uma linha varre o vídeo e deixa luz/cor tratadas; depois o rosto ganha zoom e fica fixo
  orbita: {de: string; atras?: Atras[]};
  fecho?: {de: string; linhas: string[]; em?: string[]}; // em: uma palavra por linha (sem ela, uma linha a cada 0,3 s)
  tema?: Tema; // paleta do vídeo (ferramentas/paleta/paleta.py); visual 'colagem' = papel, recorte, serifa, anotação à mão
  app?: {miniatura?: string};
  fpsSaida?: number; // quadros por segundo da saída (ex.: 50 com base de 25 = movimento mais fluido); o tempo continua o da base
  baseCartoes?: string; // vídeo já 'produzido' (fundo de estúdio + cor tratada) para as versões; sem ele, o bruto // foto pequena do bruto que aparece anexada na mensagem
  musica?: string; // arquivo na pasta pública (ex.: assets/musica.mp3); a voz manda e a música abaixa sob a fala
};

export const calculaVitrine: CalculateMetadataFunction<VitrineProps> = ({props}) => {
  const fps = props.fpsSaida || props.base.fps || 30;
  return {width: 1080, height: 1920, fps, durationInFrames: Math.max(1, Math.round(props.base.duracao * fps))};
};

const W = 1080;
const H = 1920;
const PRETO = '#0A0A0B';
const OSSO = '#F2F2EF';
const ARCHIVO = "'Archivo Variable', 'Archivo', sans-serif";
const INTER = "'Inter Variable', 'Inter', sans-serif";
const BRICO = "'Bricolage Grotesque Variable', 'Archivo Variable', sans-serif";
const GEIST = "'Geist Variable', 'Inter Variable', sans-serif";
const SERIFA = "'Instrument Serif', 'Georgia', serif";

type Pose = {x: number; y: number; s: number; ry: number; rz: number; r: number; foco: number};

const pose = (c: Camera, i: number, n: number): Pose => {
  const k = c.k ?? 0;
  const d = i - k;
  if (c.modo === 'foco') return {x: d * W * 1.12, y: 0, s: 1, ry: 0, rz: 0, r: 0, foco: 1};
  if (c.modo === 'app') return d === 0 ? {x: MINI.x * W, y: MINI.y * H, s: MINI.s, ry: 0, rz: 0, r: 36, foco: 0.99} : {x: d * W * 1.6, y: 0, s: MINI.s, ry: 0, rz: 0, r: 36, foco: 0.99};
  if (c.modo === 'atras') {
    // as outras versões abrem em leque ATRÁS da cabeça (como cartas na mão); o palco continua na tela inteira
    // o palco encolhe para baixo (vira 'um dos vídeos') e as outras versões abrem em leque em cima, sem o rosto tampar
    if (i === 0) return {x: 0, y: H * 0.19, s: 0.64, ry: 0, rz: 0, r: 70, foco: 0.5};
    const j = i - 1 - (n - 2) / 2;
    return {x: j * W * 0.25, y: -H * 0.335 + j * j * 26, s: 0.21, ry: 0, rz: j * 7, r: 70, foco: 0}; // acima da cabeça: nada fica escondido pelo rosto
  }
  if (c.modo === 'leque') {
    const a = Math.abs(d);
    return {x: d * W * 0.4, y: a * 40, s: 0.42 * (1 - 0.12 * a), ry: -d * 16, rz: 0, r: 70, foco: 0};
  }
  // grade: 3 em cima, 2 embaixo + o texto do fecho na terceira casa
  const col = i < 3 ? i - 1 : i - 3 - 1;
  const lin = i < 3 ? -1 : 1;
  return {x: col * W * 0.32, y: lin * H * 0.205, s: 0.29, ry: 0, rz: 0, r: 80, foco: 0};
};

const mistura = (a: Pose, b: Pose, p: number): Pose => ({
  x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), s: lerp(a.s, b.s, p), ry: lerp(a.ry, b.ry, p), rz: lerp(a.rz, b.rz, p), r: lerp(a.r, b.r, p), foco: lerp(a.foco, b.foco, p),
});

// palavras gigantes atrás da cabeça: cada palavra sobe da máscara, em Archivo largo
// `topo`: onde começa (fração da altura). Nada de texto sobre texto: abaixo da interface do bruto e da pílula do topo.
const TextoAtras: React.FC<{f: number; ini: number; fim: number; texto: string; cor: string; topo?: number; serifa?: boolean; cond?: boolean}> = ({f, ini, fim, texto, cor, topo, serifa, cond}) => {
  if (f < ini - 1 || f >= fim) return null;
  const palavras = texto.split(' ');
  const sai = tween(f, fim - 8, 8, 0, 1, E.saida);
  // cada linha cabe na largura (Archivo 800 a 125% tem ~0,82 em por letra maiúscula)
  const tam = Math.min(serifa ? 420 : cond ? 460 : 300, ...palavras.map((p) => (W * 0.94) / (Math.max(3, p.length) * (serifa ? 0.56 : cond ? 0.56 : 0.82))));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: H * (topo ?? (palavras.length > 1 ? 0.05 : 0.09)), display: 'flex', flexDirection: 'column', alignItems: 'center',
      ...(serifa ? {fontFamily: SERIFA, fontWeight: 400, letterSpacing: '-0.02em'} : cond ? {fontFamily: BRICO, fontWeight: 800, fontStretch: '75%', letterSpacing: '-0.02em'} : {fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '125%', letterSpacing: '-0.03em'}),
      fontSize: tam, lineHeight: cond ? 1.05 : 0.86,
      textTransform: 'uppercase', color: cor, opacity: 1 - sai}}>
      {palavras.map((p, i) => {
        const e = mola(f, ini + i * 4, 0.22, 0.82);
        return (
          <div key={i} style={{overflow: 'hidden', paddingTop: tam * 0.16, marginTop: -tam * 0.08}}>
            <div style={{transform: `translateY(${(1 - e) * 105}%) scaleY(${0.8 + 0.2 * e})`, transformOrigin: '50% 100%'}}>{p}</div>
          </div>
        );
      })}
    </div>
  );
};


// Legenda editorial (referência: reels de criador com tipografia de cinema, ~0,7 corte/s): poucas palavras por vez,
// a palavra forte da frase GRANDE em Archivo largo, as de ligação pequenas em caixa alta espaçada, uma em itálico serifado.
// Fica no peito (camisa escura = contraste), nunca no rosto.
// estúdio: legenda pequena e limpa, branca numa caixa escura, abaixo do assunto (padrão de vitrine profissional)
// legenda dinâmica do tema estúdio (Vítor 31/10: "legendas dinâmicas, fontes melhores"): blocos curtos de 1 a 3 palavras,
// cada palavra entra quando é falada (sobe com mola, sem caixa), a palavra mais forte do bloco ganha a cor do tema e a fonte de título.
// Não é karaokê: nada muda de cor depois de entrar. A posição vem por interpolação (sem salto quando a tela divide).
const limpaP = (w: string) => w.replace(/[.,;:!?…]+$/, '');
const LegendaCaixa: React.FC<{f: number; pal: Palavra[]; fps: number; y: number; tm?: Tema; cru?: boolean}> = ({f, pal, fps, y, tm, cru}) => {
  const cues = React.useMemo(() => montaCues(pal, fps, 16, 1, 3, true), [pal, fps]);
  const c = cues.find((q) => f >= q.a - 1 && f < q.b);
  if (!c) return null;
  const forte = c.ws.reduce((m, w, i) => (limpaP(w.w).length > limpaP(c.ws[m].w).length ? i : m), 0);
  const destaca = !cru && limpaP(c.ws[forte].w).length >= 5; // no bruto ("0 editado") a legenda é crua: branca, sem destaque
  const sai = clamp((f - (c.b - 4)) / 4);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline',
      columnGap: 18, opacity: 1 - sai, transform: `translateY(${-sai * 14}px)`}}>
      {c.ws.map((w, i) => {
        if (f < w.f - 1) return null;
        const e = cru ? 1 : mola(f, w.f - 1, 0.28, 0.78);
        const grande = destaca && i === forte;
        return (
          <div key={i} style={{transform: `translateY(${(1 - e) * 34}px) scale(${0.86 + 0.14 * e})`, opacity: clamp((f - w.f + 1) / 3), transformOrigin: '50% 100%',
            fontFamily: grande ? BRICO : GEIST, fontWeight: grande ? 800 : 700, fontStretch: grande ? '82%' : undefined,
            fontSize: grande ? 86 : cru ? 52 : 64, lineHeight: 1.05, letterSpacing: grande ? '-0.02em' : '-0.015em',
            color: grande ? (tm?.tema ?? '#D97757') : '#FFFFFF', textShadow: '0 3px 0 rgba(0,0,0,.28), 0 8px 30px rgba(0,0,0,.55)'}}>{limpaP(w.w)}</div>
        );
      })}
    </div>
  );
};
const Estudio: React.FC<{tm: Tema; r: {cx: number; cy: number}}> = ({tm, r}) => (
  <div style={{position: 'absolute', inset: 0, background: tm.papel, overflow: 'hidden'}}>
    {/* luz de recorte neutra atrás da cabeça + um toque bem leve da cor do tema embaixo (31/10: o brilho laranja forte deixava o fundo barrento) */}
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 52% 30% at ${r.cx * 100}% ${r.cy * 100 - 6}%, rgba(214,222,235,.16), rgba(214,222,235,0) 100%)`}} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 22% at 50% 92%, ${tm.tema}26, ${tm.tema}00 100%)`}} />
    <div style={{position: 'absolute', left: -W * 0.5, right: -W * 0.5, top: H * 0.62, height: H * 0.6, transform: 'perspective(900px) rotateX(62deg)', transformOrigin: '50% 0%',
      backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.05) 2px, transparent 2px)', backgroundSize: '120px 120px',
      maskImage: 'linear-gradient(to bottom, transparent, #000 40%)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
  </div>
);

const LegendaEditorial: React.FC<{f: number; pal: Palavra[]; fps: number; y: number; cor: string; tm?: Tema}> = ({f, pal, fps, y, cor, tm}) => {
  if (tm?.visual === 'colagem') return <LegendaRecorte f={f} pal={pal} fps={fps} y={y} tm={tm} />;
  if (tm?.visual === 'estudio') return <LegendaCaixa f={f} pal={pal} fps={fps} y={y} tm={tm} />;
  const cues = React.useMemo(() => montaCues(pal, fps, 16, 1, 4, true), [pal, fps]);
  const c = cues.find((q) => f >= q.a && f < q.b);
  if (!c) return null;
  const limpa = (w: string) => w.replace(/[.,;:!?]+$/, '');
  const forte = c.ws.reduce((m, w, i) => (limpa(w.w).length > limpa(c.ws[m].w).length ? i : m), 0);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
      alignItems: 'baseline', columnGap: 22, rowGap: 0}}>
      {c.ws.map((w, i) => {
        const e = mola(f, w.f - 1, 0.3, 0.85);
        if (f < w.f - 1) return null;
        const grande = i === forte;
        const serifa = !grande && limpa(w.w).length >= 5 && i === c.ws.length - 1 && c.ws.length > 2;
        return (
          <div key={i} style={{overflow: 'hidden', lineHeight: grande ? 0.95 : 1.1}}>
            <div style={{transform: `translateY(${(1 - e) * 100}%)`, color: cor, textShadow: '0 2px 18px rgba(0,0,0,.35)',
              ...(grande
                ? {fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '118%', fontSize: Math.min(150, 980 / (limpa(w.w).length * 0.78)), textTransform: 'uppercase', letterSpacing: '-0.02em'}
                : serifa
                  ? {fontFamily: SERIFA, fontStyle: 'italic', fontSize: 72}
                  : {fontFamily: INTER, fontWeight: 600, fontSize: 38, textTransform: 'uppercase', letterSpacing: '0.12em'})}}>
              {limpa(w.w)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Colagem: cada palavra é um recorte. A forte em serifa grande num pedaço de papel (com sublinhado de pincel na cor do
// tema), as de ligação em fita rotuladora preta. Entra em "stop-motion" (3 posições, sem interpolar) para parecer à mão.
const LegendaRecorte: React.FC<{f: number; pal: Palavra[]; fps: number; y: number; tm: Tema}> = ({f, pal, fps, y, tm}) => {
  const cues = React.useMemo(() => montaCues(pal, fps, 16, 1, 4, true), [pal, fps]);
  const c = cues.find((q) => f >= q.a && f < q.b);
  if (!c) return null;
  const limpa = (w: string) => w.replace(/[.,;:!?]+$/, '');
  const forte = c.ws.reduce((m, w, i) => (limpa(w.w).length > limpa(c.ws[m].w).length ? i : m), 0);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 14}}>
      {c.ws.map((w, i) => {
        if (f < w.f - 1) return null;
        const q = Math.min(2, Math.floor((f - w.f + 1) / 2)); // 0,1,2: três "fotos" da entrada
        const sc = [1.18, 0.96, 1][q];
        const rot = ((i * 37) % 7) - 3;
        const grande = i === forte;
        const tx = limpa(w.w);
        if (grande) {
          const risco = clamp((f - w.f - 3) / 7);
          return (
            <div key={i} style={{position: 'relative', transform: `rotate(${rot * 0.6}deg) scale(${sc})`, background: tm.papel,
              padding: '4px 22px 10px', boxShadow: '0 6px 0 rgba(0,0,0,.18)'}}>
              <div style={{fontFamily: SERIFA, fontSize: Math.min(150, 1000 / (tx.length * 0.55)), lineHeight: 1, color: tm.tinta, textTransform: 'uppercase', letterSpacing: '-0.02em'}}>{tx}</div>
              <svg style={{position: 'absolute', left: 10, right: 10, bottom: -4, width: 'calc(100% - 20px)', height: 26, overflow: 'visible'}} viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 6 C 20 2, 40 9, 60 5 S 90 3, 98 6" fill="none" stroke={tm.tema} strokeWidth={4} strokeLinecap="round"
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - risco} />
              </svg>
            </div>
          );
        }
        return (
          <div key={i} style={{transform: `rotate(${rot}deg) scale(${sc})`, background: tm.tinta, color: tm.papel, padding: '6px 14px',
            fontFamily: INTER, fontWeight: 700, fontSize: 36, letterSpacing: '0.06em', textTransform: 'uppercase'}}>{tx}</div>
        );
      })}
    </div>
  );
};

// grão de papel/filme por cima de tudo (muda a cada 2 quadros, como película)
const Grao: React.FC<{f: number; forca?: number}> = ({f, forca = 0.16}) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='540' height='960'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${Math.floor(f / 2) % 9}'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 1.6 -0.3'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>`;
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: forca, mixBlendMode: 'multiply',
    backgroundImage: `url("data:image/svg+xml;utf8,${svg.replace(/#/g, '%23').replace(/"/g, "'")}")`, backgroundSize: '540px 960px'}} />;
};

// colagem: a pessoa vira um recorte de papel (P&B contrastado, borda branca de tesoura e sombra curta de papel)
// A borda é feita por um filtro SVG: alfa endurecido (sem meia-transparência de mão borrada), abertura morfológica
// (some com fiapos e pontinhos soltos) e dilatação = contorno de tesoura uniforme.
const FiltroRecorte: React.FC<{id: string; cor: string}> = ({id, cor}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feComponentTransfer in="SourceAlpha" result="duro"><feFuncA type="discrete" tableValues="0 0 1 1 1" /></feComponentTransfer>
      <feMorphology in="duro" operator="erode" radius="4" result="aberto0" />
      <feMorphology in="aberto0" operator="dilate" radius="4" result="aberto" />
      <feComposite in="SourceGraphic" in2="aberto" operator="in" result="pessoa" />
      <feColorMatrix in="pessoa" type="saturate" values="0" result="pb" />
      <feComponentTransfer in="pb" result="pbc"><feFuncR type="linear" slope="1.2" intercept="-0.06" /><feFuncG type="linear" slope="1.2" intercept="-0.06" /><feFuncB type="linear" slope="1.2" intercept="-0.06" /></feComponentTransfer>
      <feMorphology in="aberto" operator="dilate" radius="8" result="borda0" />
      <feFlood floodColor={cor} />
      <feComposite in2="borda0" operator="in" result="borda" />
      <feOffset in="borda0" dy="14" result="sombra0" />
      <feFlood floodColor="rgba(0,0,0,.22)" />
      <feComposite in2="sombra0" operator="in" result="sombra" />
      <feMerge><feMergeNode in="sombra" /><feMergeNode in="borda" /><feMergeNode in="pbc" /></feMerge>
    </filter>
  </svg>
);

const Pessoa: React.FC<{src: string; tm?: Tema}> = ({src, tm}) => {
  const id = React.useId().replace(/:/g, '');
  const col = tm?.visual === 'colagem';
  return (
    <>
      {col && <FiltroRecorte id={id} cor={tm!.papel} />}
      <OffthreadVideo src={staticFile(src)} transparent muted style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover',
        filter: col ? `url(#${id})` : tm?.visual === 'estudio' ? `${GRADE} drop-shadow(0 40px 50px rgba(0,0,0,.55))` : undefined}} />
    </>
  );
};

// tratamento de luz e cor da 'melhora': contraste e cor de vídeo tratado, um pouco mais quente
const GRADE = 'contrast(1.12) saturate(1.15) brightness(1.02) sepia(0.06)';
// luz de recorte: uma luz quente suave no rosto (soft-light) e o resto do quadro levemente mais escuro (sombra de estúdio)
const Luz: React.FC<{r: {cx: number; cy: number}}> = ({r}) => (
  <>
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'soft-light', background: `radial-gradient(ellipse 34% 22% at ${r.cx * 100 - 6}% ${r.cy * 100}%, rgba(255,214,170,.75), rgba(255,214,170,0) 100%)`}} />
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', background: `radial-gradient(ellipse 70% 55% at ${r.cx * 100}% ${r.cy * 100 + 8}%, rgba(255,255,255,1) 40%, rgba(40,32,28,.55) 100%)`}} />
  </>
);

const Base: React.FC<{src: string; filtro?: string}> = ({src, filtro}) => (
  <OffthreadVideo src={staticFile(src)} muted style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', filter: filtro}} />
);

// interface de câmera do bruto: REC, tempo, grade de terços
const InterfaceBruto: React.FC<{f: number; fps: number; op: number}> = ({f, fps, op}) => {
  const s = Math.floor(f / fps);
  const tc = `00:00:${String(s).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`;
  const pisca = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, fontFamily: INTER, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)'}}>
      {[1, 2].map((i) => <div key={'v' + i} style={{position: 'absolute', top: 0, bottom: 0, left: (W * i) / 3, width: 1.5, background: 'rgba(255,255,255,.28)'}} />)}
      {[1, 2].map((i) => <div key={'h' + i} style={{position: 'absolute', left: 0, right: 0, top: (H * i) / 3, height: 1.5, background: 'rgba(255,255,255,.28)'}} />)}
      <div style={{position: 'absolute', left: 64, top: 150, display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 700, letterSpacing: '0.06em'}}>
        <div style={{width: 26, height: 26, borderRadius: 13, background: '#FF3B30', opacity: pisca ? 1 : 0.25}} />REC
      </div>
      <div style={{position: 'absolute', right: 64, top: 150, fontSize: 38, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{tc}</div>
      <div style={{position: 'absolute', left: 64, top: 206, fontSize: 30, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.85}}>BRUTO · SEM EDIÇÃO</div>
    </div>
  );
};

export const Vitrine: React.FC<VitrineProps> = (props) => {
  useFontes();
  const f = useQuadroBase(props.base.fps || 30);
  const k = (props.fpsSaida || props.base.fps || 30) / (props.base.fps || 30); // quadros de saída por quadro da base
  const {base, palavras, rosto, estilos, rotulos, camera, palco, orbita, fecho, pessoa} = props;
  const fps = base.fps || 30;
  const dur = Math.round(base.duracao * fps);
  const m = montaMarca(props.marca, {legenda: '#FFFFFF', destaqueLegenda: '#FFFFFF'});
  const pal: Palavra[] = React.useMemo(() => palavras.map((p) => ({...p, f: Math.round(p.s * fps), fe: Math.round(p.e * fps)})), [palavras, fps]);
  const t = React.useMemo(() => relogio(pal, dur, fps), [pal, dur, fps]);
  const n = estilos.length + 2;
  const fechoEm = (i: number) => (fecho?.em?.[i] ? t(fecho.em[i]) : t(fecho!.de) + i * 9);
  const tm = props.tema ?? TEMA_ESCURO;
  const col = tm.visual === 'colagem';
  const est = tm.visual === 'estudio';
  const fundo = col ? tm.papel : est ? tm.papel : PRETO; // fundo geral
  const claro = col || est ? tm.tinta : OSSO; // texto sobre o fundo geral

  // estado da câmera neste quadro
  const cams = camera.map((c) => ({...c, a: t(c.de)})).sort((x, y) => x.a - y.a);
  let j = 0;
  cams.forEach((c, i) => { if (f >= c.a) j = i; });
  const atual = cams[j];
  const ant = cams[Math.max(0, j - 1)];
  const p = j === 0 ? 1 : mola(f, atual.a, atual.modo === 'app' ? 0.26 : 0.2, 0.92); // tudo desliza (o app também entra deslizando)

  const cruAte = t(palco.cruAte);
  const legenda = (zonaY: number) => (
    <Legendas f={f} W={W} H={H} fps={fps} pal={pal} estilo="limpa" marca={m} zona={{y: zonaY, x: 90, w: W - 180, sobre: 'video'}} />
  );

  // enquadramento: depois da 'melhora' o rosto ganha zoom suave e fica fixo no centro (acompanha o rosto detectado)
  const rostoEm = (q: number) => {
    if (!rosto || !rosto.cx?.length) return {cx: 0.5, cy: 0.42};
    const passo = (rosto as {passo?: number}).passo || 1;
    let sx = 0, sy = 0, k = 0;
    for (let d = -12; d <= 12; d += 3) {
      const i = Math.min(rosto.cx.length - 1, Math.max(0, Math.round((q + d) / passo)));
      sx += rosto.cx[i]; sy += rosto.cy[i]; k++;
    }
    return {cx: sx / k, cy: sy / k};
  };
  const melhoraIni = palco.melhora ? t(palco.melhora.de) : Infinity;
  const varre = clamp((f - melhoraIni) / 16);
  const zoomAlvo = palco.melhora?.zoom ?? 1.22;
  const enquadra = (q: number): React.CSSProperties => {
    const z = 1 + (zoomAlvo - 1) * clamp(mola(q, melhoraIni + 16, 0.12, 0.9));
    if (z <= 1.0001) return {};
    const r = rostoEm(q);
    return {transformOrigin: `${r.cx * 100}% ${r.cy * 100}%`, transform: `translateX(${(0.5 - r.cx) * W * (z - 1) / z}px) scale(${z})`};
  };
  const palcoCartao = () => {
    const vira = clamp(mola(f, cruAte, 0.16, 1) * 1.04); // o quarto vai embora e fica o estúdio (1,04: não sobra fiapo no topo)
    const atras = palco.atras.map((a, i) => ({...a, ini: t(a.de), fim: a.ate ? t(a.ate) : (palco.atras[i + 1] ? t(palco.atras[i + 1].de) : dur)}));
    const cta = palco.cta ? {ini: t(palco.cta.de), texto: palco.cta.texto} : null;
    const ia = palco.ia;
    const sp = ia ? clamp(mola(f, t(ia.de), 0.2, 0.85)) * (1 - clamp(mola(f, t(ia.ate), 0.22, 1))) : 0;
    const desce = sp * H * (0.735 - rostoEm(f).cy); // o rosto vai para o meio do cartão de baixo
    // divisão em dois cartões arredondados com calha (31/10 "melhore a divisão"): margem 28, raio 40, o vídeo vira o cartão de baixo
    const MG = 28 * sp;
    const RAIO = 40 * sp;
    const corteBaixo = sp > 0.001 ? `inset(${sp * (H / 2 + 14)}px ${MG}px ${MG}px ${MG}px round ${RAIO}px)` : undefined;
    return (
      <AbsoluteFill style={{background: col ? tm.tema : est ? (sp > 0.001 ? '#08090A' : tm.papel) : PRETO}}>
        {est && f >= melhoraIni && <div style={{position: 'absolute', inset: 0, clipPath: corteBaixo}}><Estudio tm={tm} r={rostoEm(f)} /></div>}
        {vira < 0.999 && (
          <div style={{position: 'absolute', inset: 0, clipPath: sp > 0.001 ? corteBaixo : `inset(0 0 ${vira * 100}% 0)`}}><div style={{position: 'absolute', inset: 0, transform: `translateY(${desce}px)`}}>
            <div style={{position: 'absolute', inset: 0, ...enquadra(f)}}>
              <Base src={base.arquivo} filtro={`saturate(${1 - vira * 0.6})`} />
              {varre > 0 && (
                <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - varre) * 100}% 0 0)`}}>
                  {/* reiluminação: o fundo (cortina) desce e esfria, a pessoa recortada sobe com cor tratada e luz quente no rosto */}
                  {est ? <Estudio tm={tm} r={rostoEm(f)} /> : <Base src={base.arquivo} filtro={`brightness(0.62) contrast(1.1) saturate(0.85) hue-rotate(-8deg)`} />}
                  <div style={{position: 'absolute', inset: 0, filter: est ? undefined : GRADE}}><Pessoa src={pessoa} tm={est ? tm : undefined} /></div>
                  <Luz r={rostoEm(f)} />
                </div>
              )}
            </div>
            {varre > 0 && varre < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: varre * W - 3, width: 6, background: col ? tm.papel : est ? tm.tema : OSSO, boxShadow: '0 0 0 2px rgba(0,0,0,.15)'}} />}
          </div></div>
        )}
        {atras.map((a, i) => <TextoAtras key={i} f={f} ini={a.ini} fim={a.fim} texto={a.texto} cor={col ? tm.papel : est ? tm.tinta : OSSO} serifa={col} cond={est} topo={a.ini < cruAte ? 0.15 : undefined} />)}
        {cta && <TextoAtras f={f} ini={cta.ini} fim={dur + 10} texto={cta.texto} cor={col ? tm.papel : est ? tm.tema : OSSO} serifa={col} cond={est} />}
        {(f >= cruAte - 2 || (est && f >= melhoraIni + 16) || atras.some((a) => a.ini < cruAte)) && (
          <div style={{position: 'absolute', inset: 0, clipPath: corteBaixo}}><div style={{position: 'absolute', inset: 0, transform: `translateY(${desce}px)`}}><div style={{position: 'absolute', inset: 0, ...enquadra(f)}}><Pessoa src={pessoa} tm={f >= cruAte || (est && f >= melhoraIni) ? tm : undefined} /></div></div></div>
        )}
        {est && sp > 0.001 && <div style={{position: 'absolute', left: MG, right: MG, top: sp * (H / 2 + 14), bottom: MG, borderRadius: RAIO, border: `1.5px solid rgba(255,255,255,${0.08 * sp})`}} />}
        <InterfaceBruto f={f} fps={fps} op={(1 - clamp(vira * 2)) * (1 - clamp(sp * 3))} />
        {ia && sp > 0.001 && (
          <div style={est
            ? {position: 'absolute', left: 28, top: 28, width: W - 56, height: H / 2 - 42, borderRadius: 40, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,.08)',
              transform: `translateY(${-(1 - sp) * (H / 2 + 40)}px)`, boxShadow: '0 24px 60px rgba(0,0,0,.45)'}
            : {position: 'absolute', left: 0, top: 0, width: W, height: H / 2, transform: `translateY(${-(1 - sp) * 100}%)`, boxShadow: '0 10px 0 rgba(0,0,0,.18)'}}>
            {React.createElement(est ? PainelIAEstudio : PainelIA, {f, w: est ? W - 56 : W, h: est ? H / 2 - 42 : H / 2, tm: col || est ? tm : {papel: '#E9E9E6', papel2: '#D6D6D2', tema: PRETO, tinta: PRETO, cinza: '#8A8A8E'},
              logo: ia.logo, programa: ia.programa,
              mk: {janela: t(ia.marcas.janela), carimbo: t(ia.marcas.carimbo), claude: t(ia.marcas.claude), corte: t(ia.marcas.corte),
                barra: t(ia.marcas.barra), cheio: t(ia.marcas.cheio), fim: t(ia.ate)}})}
            {/* fita na emenda: o painel e o vídeo são uma peça só */}
            {!est && <div style={{position: 'absolute', left: -20, right: -20, height: 28, bottom: -14, background: col ? tm.tinta : PRETO, transform: 'rotate(-0.6deg)'}} />}
          </div>
        )}
        {cta && f >= cta.ini && (
          <div style={{position: 'absolute', left: 90, right: 90, bottom: 300, display: 'flex', justifyContent: 'center',
            transform: `translateY(${(1 - mola(f, cta.ini + 6, 0.2, 0.8)) * 60}px)`, opacity: clamp((f - cta.ini - 6) / 6)}}>
            <div style={{background: col ? tm.papel : est ? tm.tema : OSSO, color: col ? tm.tinta : est ? '#fff' : PRETO, borderRadius: col ? 4 : est ? 22 : 60, transform: col ? 'rotate(-2deg)' : undefined, padding: '26px 44px', fontFamily: INTER, fontSize: 44, fontWeight: 600, display: 'flex', gap: 18, alignItems: 'center'}}>
              <span style={{opacity: 0.5}}>Comente</span>
              <span style={{fontWeight: 800}}>{cta.texto.slice(0, Math.max(0, Math.floor((f - cta.ini - 10) / 2)))}</span>
              <span style={{width: 3, height: 46, background: PRETO, opacity: Math.floor(f / 10) % 2 ? 1 : 0}} />
            </div>
          </div>
        )}
        {est ? (!cta || f < cta.ini) && <LegendaCaixa f={f} pal={pal} fps={fps} tm={tm} cru={f < melhoraIni} y={H * (0.78 + 0.095 * sp)} />
          : f < cruAte ? legenda(H * 0.87) : (!cta || f < cta.ini) && <LegendaEditorial f={f} pal={pal} fps={fps} y={H * 0.66} cor={OSSO} tm={tm} />}
      </AbsoluteFill>
    );
  };

  const orbitaCartao = () => {
    const ini = t(orbita.de);
    return (
      <AbsoluteFill style={{background: col ? tm.papel : est ? tm.papel : '#E9E9E6'}}>
        {est && <Estudio tm={tm} r={rostoEm(f)} />}
        {(orbita.atras ?? []).map((a, i) => <TextoAtras key={i} f={f} ini={t(a.de)} fim={a.ate ? t(a.ate) : dur} texto={a.texto} cor={col || est ? tm.tema : PRETO} serifa={col} cond={est} topo={0.14} />)}
        <Orbita ini={ini} fpsBase={fps} lado="atras" cores={col || est ? [tm.tema, est ? '#E9E5DE' : tm.tinta, tm.papel2] : undefined} />
        <div style={{position: 'absolute', inset: 0, ...enquadra(f)}}><Pessoa src={pessoa} tm={tm} /></div>
        <Orbita ini={ini} fpsBase={fps} lado="frente" cores={col || est ? [tm.tema, est ? '#E9E5DE' : tm.tinta, tm.papel2] : undefined} />
        {col ? <LegendaEditorial f={f} pal={pal} fps={fps} y={H * 0.66} cor={OSSO} tm={tm} /> : est ? <LegendaCaixa f={f} pal={pal} fps={fps} tm={tm} y={H * 0.78} /> : legenda(H * 0.87)}
      </AbsoluteFill>
    );
  };

  const conteudo = (i: number) => {
    if (i === 0) return palcoCartao();
    if (i === n - 1) return orbitaCartao();
    return <EditorVideo roteiro={estilos[i - 1]} palavras={palavras} rosto={rosto} base={props.baseCartoes ? {...base, arquivo: props.baseCartoes} : base} marca={props.marca} mudo />;
  };


  // som: a voz da base uma vez só; música com ducking guiado pelas palavras; efeitos presos às trocas de câmera
  const falando = React.useMemo(() => {
    const v = new Array(dur + 1).fill(0);
    pal.forEach((w) => { for (let q = Math.max(0, w.f - 5); q <= Math.min(dur, w.fe + 8); q++) v[q] = 1; });
    // suaviza: a música desce em ~0,2 s e volta em ~0,5 s
    const out = new Array(dur + 1).fill(0);
    let y = v[0];
    for (let q = 0; q <= dur; q++) { y += (v[q] - y) * (v[q] > y ? 0.3 : 0.07); out[q] = y; }
    return out;
  }, [pal, dur]);
  // efeitos: POUCOS e variados, só nos momentos fortes (Vítor 30/10: som em cada palavra ficou repetitivo e irritante).
  // Regra: no máximo um efeito a cada ~1,2 s e nunca o mesmo som duas vezes seguidas.
  const cand: {em: number; som: string; vol: number}[] = [];
  const giro = ['ar', 'swish', 'whoosh'];
  cams.forEach((c, i) => {
    if (i === 0) return;
    if (c.modo === 'grade') cand.push({em: c.a, som: 'whoosh', vol: 0.4}, {em: c.a + 10, som: 'baque', vol: 0.4});
    else cand.push({em: c.a - 3, som: giro[i % giro.length], vol: 0.35});
  });
  if (palco.ia) {
    const k = palco.ia.marcas;
    cand.push({em: t(palco.ia.de) - 2, som: 'ar', vol: 0.4}, {em: t(k.carimbo), som: 'impact', vol: 0.4}, {em: t(k.claude), som: 'pop', vol: 0.3},
      {em: t(k.cheio), som: 'thud-suave', vol: 0.35}, {em: t(palco.ia.ate) - 2, som: 'whoosh', vol: 0.35});
  } else cand.push({em: cruAte, som: 'whoosh', vol: 0.35});
  if (palco.cta) cand.push({em: t(palco.cta.de), som: 'thud-suave', vol: 0.4});
  cand.sort((x, y) => x.em - y.em);
  const efeitos: typeof cand = [];
  cand.forEach((e) => {
    const u = efeitos[efeitos.length - 1];
    if (u && (e.em - u.em < 36 || e.som === u.som)) return;
    efeitos.push(e);
  });
  const audio = (
    <>
      <Audio src={staticFile(base.arquivo)} />
      {props.musica && <Audio src={staticFile(props.musica)} volume={(q) => 0.3 - 0.2 * (falando[Math.min(Math.round(q / k), dur)] ?? 0)} />}
      {efeitos.filter((e) => e.em >= 0).map((e, i) => (
        <Sequence key={i} from={Math.round(e.em * k)} durationInFrames={Math.round(60 * k)}><Audio src={staticFile(`sons/sfx_${e.som}.wav`)} volume={e.vol} /></Sequence>
      ))}
    </>
  );

  const poses = Array.from({length: n}, (_, i) => mistura(pose(ant, i, n), pose(atual, i, n), p));
  // pílula "02 / 05 · NOME" quando a câmera entra num cartão
  const entrou = atual.modo === 'foco' && (ant.modo !== 'foco' || ant.k !== atual.k) ? atual.k ?? 0 : -1;
  const entrouEm = entrou >= 1 ? entrou : -1; // o palco (0) não ganha pílula: é o vídeo "de verdade"
  const pilula = entrouEm >= 0 && f < atual.a + 50 ? clamp(Math.min((f - atual.a - 8) / 6, (atual.a + 50 - f) / 6)) : 0;
  const fechoIni = fecho ? t(fecho.de) : Infinity;

  return (
    <AbsoluteFill style={{background: fundo, perspective: 2600, overflow: 'hidden'}}>
      {audio}
      {(() => {
        const c = atual.modo === 'app' ? atual : ant.modo === 'app' && j > 0 ? ant : null;
        if (!c) return null;
        const op = c === atual ? clamp((f - atual.a) / 6) : 1 - clamp((f - atual.a) / 8); // entra em fade (sem corte seco)
        return <TelaClaude f={f} ini={c.a} envio={c.envio ? t(c.envio) : c.a + 15} comando={c.comando ?? '/editar-video'} nota={c.nota} miniatura={props.app?.miniatura} op={op} />;
      })()}
      {poses.map((ps, i) => {
        const visivel = Math.abs(ps.x) - (W * ps.s) / 2 < W / 2 + 40;
        if (!visivel) return null;
        if (atual.modo === 'app' && i === atual.k && f < (atual.envio ? t(atual.envio) : atual.a + 15)) return null; // ainda digitando
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, width: W, height: H,
            transform: `translate(${ps.x}px, ${ps.y}px) rotateY(${ps.ry}deg) rotate(${ps.rz}deg) scale(${ps.s})`, transformOrigin: '50% 50%'}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: col ? 0 : ps.r / Math.max(ps.s, 0.2), overflow: 'hidden',
              boxShadow: ps.foco < 1 ? (col
                ? `0 0 0 ${16 * (1 - ps.foco) / Math.max(ps.s, 0.2)}px ${tm.papel2}, 0 ${18 / Math.max(ps.s, 0.2)}px 0 ${20 / Math.max(ps.s, 0.2)}px rgba(0,0,0,${0.14 * (1 - ps.foco)})`
                : `0 0 0 ${3 / Math.max(ps.s, 0.2)}px rgba(255,255,255,${0.18 * (1 - ps.foco)})`) : 'none'}}>
              {conteudo(i)}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: H + 70 / ps.s * 0.4, display: 'flex', justifyContent: 'center', opacity: clamp(1 - ps.foco * 3)}}>
              <div style={{fontFamily: INTER, fontWeight: col || est ? 700 : 600, fontSize: 30 / Math.max(ps.s, 0.2), letterSpacing: col || est ? '0.1em' : '0.02em',
                textTransform: col || est ? 'uppercase' : 'none', color: col ? tm.papel : est ? tm.tinta : OSSO, background: col ? tm.tinta : est ? tm.papel2 : 'transparent',
                border: est ? `${1.5 / Math.max(ps.s, 0.2)}px solid rgba(255,255,255,.14)` : undefined, borderRadius: est ? 40 / Math.max(ps.s, 0.2) : 0,
                padding: col || est ? `${6 / Math.max(ps.s, 0.2)}px ${16 / Math.max(ps.s, 0.2)}px` : 0, transform: col ? `rotate(${(i % 2 ? 2 : -2)}deg)` : undefined}}>
                {rotulos[i]}
              </div>
            </div>
          </div>
        );
      })}
      {(() => {
        // leque atrás da cabeça: a pessoa do palco é desenhada de novo POR CIMA dos cartões, com a pose do palco
        const wA = atual.modo === 'atras' ? 1 : ant.modo === 'atras' && j > 0 ? 1 - clamp((f - atual.a) / 6) : 0;
        if (wA <= 0.01) return null;
        const p0 = poses[0];
        return (
          <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: wA,
            transform: `translate(${p0.x}px, ${p0.y}px) scale(${p0.s})`}}>
            <div style={{position: 'absolute', inset: 0, ...enquadra(f)}}><Pessoa src={pessoa} tm={tm} /></div>
            <LegendaEditorial f={f} pal={pal} fps={fps} y={H * 0.66} cor={OSSO} tm={tm} />
          </div>
        );
      })()}
      {atual.modo === 'app' && <Dissolve f={f} envio={atual.envio ? t(atual.envio) : atual.a + 15} op={1} />}
      {fecho && f >= fechoIni && (atual.modo === 'grade' || f < atual.a + 8) && (
        <div style={{position: 'absolute', left: W / 2 + W * 0.32 - (W * 0.29) / 2, top: H / 2 + H * 0.205 - (H * 0.29) / 2, width: W * 0.29, height: H * 0.29,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, paddingLeft: 18,
          opacity: atual.modo === 'grade' ? 1 : 1 - clamp((f - atual.a) / 8)}}>
          {fecho.linhas.map((l, i) => {
            const e = mola(f, fechoEm(i), 0.22, 0.85);
            return (
              <div key={i} style={{overflow: 'hidden'}}>
                <div style={{transform: `translateY(${(1 - e) * 100}%)`, ...(col ? {fontFamily: SERIFA, fontSize: 66} : est ? {fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '74%', fontSize: 54, textTransform: 'uppercase', whiteSpace: 'nowrap'} : {fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '110%', fontSize: 50}),
                  lineHeight: 1, color: est && i === fecho.linhas.length - 1 ? tm.tema : claro, letterSpacing: '-0.02em'}}>{l}</div>
              </div>
            );
          })}
        </div>
      )}
      {pilula > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: pilula,
          transform: `translateY(${(1 - pilula) * -16}px)`}}>
          <div style={{background: col ? tm.tinta : est ? tm.papel2 : OSSO, color: col ? tm.papel : est ? tm.tinta : PRETO, borderRadius: col ? 0 : 40, border: est ? '1.5px solid rgba(255,255,255,.14)' : undefined, transform: col ? 'rotate(-1.5deg)' : undefined, padding: '16px 30px', fontFamily: INTER, fontWeight: 700, fontSize: 32,
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums'}}>
            {String(entrouEm + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {rotulos[entrouEm].toUpperCase()}
          </div>
        </div>
      )}
      {col && <Grao f={f} />}
    </AbsoluteFill>
  );
};
