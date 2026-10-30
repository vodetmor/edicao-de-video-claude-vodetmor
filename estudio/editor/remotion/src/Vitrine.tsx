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
import {clamp, lerp, mola, tween, E} from './kit';
import {Legendas, montaCues} from './Legendas';
import {montaMarca} from './marca';
import {Orbita} from './Orbita';
import type {Entrada, Palavra, Roteiro} from './tipos';

type Camera = {de: string; modo: 'foco' | 'leque' | 'atras' | 'grade'; k?: number};
type Atras = {de: string; ate?: string; texto: string};
export type VitrineProps = Entrada & {
  pessoa: string;
  estilos: Roteiro[]; // cartões 1..n-2
  rotulos: string[]; // um por cartão
  camera: Camera[];
  palco: {cruAte: string; atras: Atras[]; cta?: {de: string; texto: string}};
  orbita: {de: string; atras?: Atras[]};
  fecho?: {de: string; linhas: string[]};
  musica?: string; // arquivo na pasta pública (ex.: assets/musica.mp3); a voz manda e a música abaixa sob a fala
};

export const calculaVitrine: CalculateMetadataFunction<VitrineProps> = ({props}) => {
  const fps = props.base.fps || 30;
  return {width: 1080, height: 1920, fps, durationInFrames: Math.max(1, Math.round(props.base.duracao * fps))};
};

const W = 1080;
const H = 1920;
const PRETO = '#0A0A0B';
const OSSO = '#F2F2EF';
const ARCHIVO = "'Archivo Variable', 'Archivo', sans-serif";
const INTER = "'Inter Variable', 'Inter', sans-serif";

type Pose = {x: number; y: number; s: number; ry: number; rz: number; r: number; foco: number};

const pose = (c: Camera, i: number, n: number): Pose => {
  const k = c.k ?? 0;
  const d = i - k;
  if (c.modo === 'foco') return {x: d * W * 1.12, y: 0, s: 1, ry: 0, rz: 0, r: 0, foco: 1};
  if (c.modo === 'atras') {
    // as outras versões abrem em leque ATRÁS da cabeça (como cartas na mão); o palco continua na tela inteira
    if (i === 0) return {x: 0, y: 0, s: 1, ry: 0, rz: 0, r: 0, foco: 1};
    const j = i - 1 - (n - 2) / 2;
    return {x: j * W * 0.215, y: -H * 0.2 + j * j * 34, s: 0.25, ry: 0, rz: j * 9, r: 70, foco: 0};
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
const TextoAtras: React.FC<{f: number; ini: number; fim: number; texto: string; cor: string; topo?: number}> = ({f, ini, fim, texto, cor, topo}) => {
  if (f < ini - 1 || f >= fim) return null;
  const palavras = texto.split(' ');
  const sai = tween(f, fim - 8, 8, 0, 1, E.saida);
  // cada linha cabe na largura (Archivo 800 a 125% tem ~0,82 em por letra maiúscula)
  const tam = Math.min(300, ...palavras.map((p) => (W * 0.92) / (Math.max(3, p.length) * 0.82)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: H * (topo ?? (palavras.length > 1 ? 0.05 : 0.09)), display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '125%', fontSize: tam, lineHeight: 0.86, letterSpacing: '-0.03em',
      textTransform: 'uppercase', color: cor, opacity: 1 - sai}}>
      {palavras.map((p, i) => {
        const e = mola(f, ini + i * 4, 0.22, 0.82);
        return (
          <div key={i} style={{overflow: 'hidden', paddingTop: 8}}>
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
const SERIFA = "'Instrument Serif', 'Georgia', serif";
const LegendaEditorial: React.FC<{f: number; pal: Palavra[]; fps: number; y: number; cor: string}> = ({f, pal, fps, y, cor}) => {
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

const Pessoa: React.FC<{src: string}> = ({src}) => (
  <OffthreadVideo src={staticFile(src)} transparent muted style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover'}} />
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
  const f = useCurrentFrame();
  const {base, palavras, rosto, estilos, rotulos, camera, palco, orbita, fecho, pessoa} = props;
  const fps = base.fps || 30;
  const dur = Math.round(base.duracao * fps);
  const m = montaMarca(props.marca, {legenda: '#FFFFFF', destaqueLegenda: '#FFFFFF'});
  const pal: Palavra[] = React.useMemo(() => palavras.map((p) => ({...p, f: Math.round(p.s * fps), fe: Math.round(p.e * fps)})), [palavras, fps]);
  const t = React.useMemo(() => relogio(pal, dur, fps), [pal, dur, fps]);
  const n = estilos.length + 2;

  // estado da câmera neste quadro
  const cams = camera.map((c) => ({...c, a: t(c.de)})).sort((x, y) => x.a - y.a);
  let j = 0;
  cams.forEach((c, i) => { if (f >= c.a) j = i; });
  const atual = cams[j];
  const ant = cams[Math.max(0, j - 1)];
  const p = j === 0 ? 1 : mola(f, atual.a, 0.2, 0.92);

  const cruAte = t(palco.cruAte);
  const legenda = (zonaY: number) => (
    <Legendas f={f} W={W} H={H} fps={fps} pal={pal} estilo="limpa" marca={m} zona={{y: zonaY, x: 90, w: W - 180, sobre: 'video'}} />
  );

  const palcoCartao = () => {
    const vira = mola(f, cruAte, 0.16, 1); // o quarto vai embora e fica o estúdio
    const atras = palco.atras.map((a, i) => ({...a, ini: t(a.de), fim: a.ate ? t(a.ate) : (palco.atras[i + 1] ? t(palco.atras[i + 1].de) : dur)}));
    const cta = palco.cta ? {ini: t(palco.cta.de), texto: palco.cta.texto} : null;
    return (
      <AbsoluteFill style={{background: PRETO}}>
        {vira < 0.999 && (
          <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${vira * 100}% 0)`}}>
            <Base src={base.arquivo} filtro={`saturate(${1 - vira * 0.6})`} />
          </div>
        )}
        {atras.map((a, i) => <TextoAtras key={i} f={f} ini={a.ini} fim={a.fim} texto={a.texto} cor={OSSO} topo={a.ini < cruAte ? 0.15 : undefined} />)}
        {cta && <TextoAtras f={f} ini={cta.ini} fim={dur + 10} texto={cta.texto} cor={OSSO} />}
        <Pessoa src={pessoa} />
        <InterfaceBruto f={f} fps={fps} op={1 - clamp(vira * 2)} />
        {cta && f >= cta.ini && (
          <div style={{position: 'absolute', left: 90, right: 90, bottom: 300, display: 'flex', justifyContent: 'center',
            transform: `translateY(${(1 - mola(f, cta.ini + 6, 0.2, 0.8)) * 60}px)`, opacity: clamp((f - cta.ini - 6) / 6)}}>
            <div style={{background: OSSO, color: PRETO, borderRadius: 60, padding: '26px 44px', fontFamily: INTER, fontSize: 44, fontWeight: 600, display: 'flex', gap: 18, alignItems: 'center'}}>
              <span style={{opacity: 0.5}}>Comente</span>
              <span style={{fontWeight: 800}}>{cta.texto.slice(0, Math.max(0, Math.floor((f - cta.ini - 10) / 2)))}</span>
              <span style={{width: 3, height: 46, background: PRETO, opacity: Math.floor(f / 10) % 2 ? 1 : 0}} />
            </div>
          </div>
        )}
        {f < cruAte ? legenda(H * 0.87) : (!cta || f < cta.ini) && <LegendaEditorial f={f} pal={pal} fps={fps} y={H * 0.66} cor={OSSO} />}
      </AbsoluteFill>
    );
  };

  const orbitaCartao = () => {
    const ini = t(orbita.de);
    return (
      <AbsoluteFill style={{background: '#E9E9E6'}}>
        {(orbita.atras ?? []).map((a, i) => <TextoAtras key={i} f={f} ini={t(a.de)} fim={a.ate ? t(a.ate) : dur} texto={a.texto} cor={PRETO} topo={0.14} />)}
        <Orbita ini={ini} lado="atras" />
        <Pessoa src={pessoa} />
        <Orbita ini={ini} lado="frente" />
        {legenda(H * 0.87)}
      </AbsoluteFill>
    );
  };

  const conteudo = (i: number) => {
    if (i === 0) return palcoCartao();
    if (i === n - 1) return orbitaCartao();
    return <EditorVideo roteiro={estilos[i - 1]} palavras={palavras} rosto={rosto} base={base} marca={props.marca} mudo />;
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
  const efeitos: {em: number; som: string; vol: number}[] = [];
  cams.forEach((c, i) => {
    if (i === 0) return;
    const a = cams[i - 1];
    if (c.modo === 'leque') { efeitos.push({em: c.a - 26, som: 'riser', vol: 0.35}, {em: c.a, som: 'whoosh', vol: 0.55}); }
    else if (c.modo === 'grade') { efeitos.push({em: c.a, som: 'whoosh', vol: 0.5}, {em: c.a + 8, som: 'thud', vol: 0.5}); }
    else if (a.modo === 'foco') efeitos.push({em: c.a - 2, som: 'swish', vol: 0.5});
    else efeitos.push({em: c.a - 3, som: 'whoosh', vol: 0.5});
  });
  efeitos.push({em: cruAte, som: 'whoosh', vol: 0.4});
  palco.atras.forEach((a) => efeitos.push({em: t(a.de), som: 'thud', vol: 0.45}));
  if (palco.cta) efeitos.push({em: t(palco.cta.de), som: 'thud', vol: 0.5}, {em: t(palco.cta.de) + 6, som: 'pop', vol: 0.4});
  if (fecho) fecho.linhas.forEach((_, i) => efeitos.push({em: t(fecho.de) + i * 9, som: 'tick', vol: 0.4}));
  const audio = (
    <>
      <Audio src={staticFile(base.arquivo)} />
      {props.musica && <Audio src={staticFile(props.musica)} volume={(q) => 0.26 - 0.19 * (falando[Math.min(q, dur)] ?? 0)} />}
      {efeitos.filter((e) => e.em >= 0).map((e, i) => (
        <Sequence key={i} from={Math.round(e.em)} durationInFrames={60}><Audio src={staticFile(`sons/sfx_${e.som}.wav`)} volume={e.vol} /></Sequence>
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
    <AbsoluteFill style={{background: PRETO, perspective: 2600, overflow: 'hidden'}}>
      {audio}
      {poses.map((ps, i) => {
        const visivel = Math.abs(ps.x) - (W * ps.s) / 2 < W / 2 + 40;
        if (!visivel) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, width: W, height: H,
            transform: `translate(${ps.x}px, ${ps.y}px) rotateY(${ps.ry}deg) rotate(${ps.rz}deg) scale(${ps.s})`, transformOrigin: '50% 50%'}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: ps.r / Math.max(ps.s, 0.2), overflow: 'hidden',
              boxShadow: ps.foco < 1 ? `0 0 0 ${3 / Math.max(ps.s, 0.2)}px rgba(255,255,255,${0.18 * (1 - ps.foco)})` : 'none'}}>
              {conteudo(i)}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: H + 70 / ps.s * 0.4, textAlign: 'center', fontFamily: INTER,
              fontWeight: 600, fontSize: 30 / Math.max(ps.s, 0.2), letterSpacing: '0.02em', color: OSSO, opacity: clamp(1 - ps.foco * 3)}}>
              {rotulos[i]}
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
            <Pessoa src={pessoa} />
            <LegendaEditorial f={f} pal={pal} fps={fps} y={H * 0.66} cor={OSSO} />
          </div>
        );
      })()}
      {fecho && f >= fechoIni && (atual.modo === 'grade' || f < atual.a + 8) && (
        <div style={{position: 'absolute', left: W / 2 + W * 0.32 - (W * 0.29) / 2, top: H / 2 + H * 0.205 - (H * 0.29) / 2, width: W * 0.29, height: H * 0.29,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, paddingLeft: 18,
          opacity: atual.modo === 'grade' ? 1 : 1 - clamp((f - atual.a) / 8)}}>
          {fecho.linhas.map((l, i) => {
            const e = mola(f, fechoIni + i * 9, 0.22, 0.85);
            return (
              <div key={i} style={{overflow: 'hidden'}}>
                <div style={{transform: `translateY(${(1 - e) * 100}%)`, fontFamily: ARCHIVO, fontWeight: 800, fontStretch: '110%', fontSize: 50,
                  lineHeight: 1, color: OSSO, letterSpacing: '-0.02em'}}>{l}</div>
              </div>
            );
          })}
        </div>
      )}
      {pilula > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: pilula,
          transform: `translateY(${(1 - pilula) * -16}px)`}}>
          <div style={{background: OSSO, color: PRETO, borderRadius: 40, padding: '16px 30px', fontFamily: INTER, fontWeight: 700, fontSize: 32,
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums'}}>
            {String(entrouEm + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {rotulos[entrouEm].toUpperCase()}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
