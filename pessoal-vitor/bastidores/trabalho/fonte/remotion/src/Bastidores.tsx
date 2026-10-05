import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {F, FE, GAP_F, GAP_LEN, END_F, TOTAL, UI, PAPEL, TINTA, FPS} from './lib';
import {useFonts, DISPLAY, TEXT, MONO} from './Fonts';
import {spring, clamp, lerp, tween, E, prog, Cursor} from './kit';
import {Legenda} from './Legenda';
import {Janela, Sidebar, TelaProjetos, ModalNovo, LogoClaude, I} from './ClaudeUI';
import {TelaChat, TelaCoordenador, Codigo, ClipeAula, Chip, digitado} from './Cenas';

// ---------------- linha do tempo ----------------
const T = {
  faceA: F(18), ui1: F(30), claude: F(46), projetos: F(47), clica: F(55), modal: F(56) + 4, nomeA: F(68), nomeB: FE(72),
  ch1: F(81), ch2: F(82), ch3: F(83), criar: F(88), chat: F(89), digA: F(98), digB: FE(120), dica: F(121), manim: F(131), manimCode: F(134),
  manimClip: F(147), glsl: F(162), glslCode: F(166), glslClaude: F(174), aquiCima: F(182), gap: GAP_F, comp: F(193), compJunta: F(198),
  voz: F(205), vozNome: F(226), simples: F(237), ideia: F(261), coord: F(280), coordSep: F(289), coordSub: F(292), cta: F(297), bast: F(321), valeu: F(328), fim: END_F,
};
type Modo = 'split' | 'face' | 'full';
const MODOS: [number, Modo][] = [[0, 'split'], [T.faceA, 'face'], [T.ui1, 'split'], [T.dica, 'face'], [T.manim, 'split'], [T.gap, 'full'],
  [T.gap + GAP_LEN, 'split'], [T.simples, 'face'], [T.coord, 'split'], [T.cta, 'face'], [T.fim, 'full']];
const modoEm = (f: number) => { let m: [number, Modo] = MODOS[0], p = MODOS[0]; for (const x of MODOS) { if (f >= x[0]) { p = m; m = x; } } return {m: m[1], desde: m[0], antes: p[1]}; };

// enquadramento do rosto em cada modo: retângulo na tela + escala e ponto da fonte que fica no centro
type Q = {x: number; y: number; w: number; h: number; r: number; k: number; cx: number; cy: number; o: number};
const Q_FACE: Q = {x: 0, y: 0, w: 1080, h: 1920, r: 0, k: 1, cx: 540, cy: 960, o: 1};
const Q_SPLIT: Q = {x: 0, y: 1100, w: 1080, h: 820, r: 0, k: 1.0, cx: 540, cy: 760, o: 1};
const Q_FULL: Q = {x: 0, y: 1100, w: 1080, h: 820, r: 0, k: 1.0, cx: 540, cy: 760, o: 0};
const qDe = (m: Modo) => (m === 'face' ? Q_FACE : m === 'split' ? Q_SPLIT : Q_FULL);
const mixQ = (a: Q, b: Q, t: number): Q => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), r: lerp(a.r, b.r, t),
  k: lerp(a.k, b.k, t), cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), o: lerp(a.o, b.o, t)});
// zoom de ênfase no rosto (alterna a cada frase)
const ZOOMS: [number, number][] = [[T.faceA, 1.0], [F(28), 1.1], [T.dica, 1.0], [F(124), 1.1], [T.simples, 1.0], [F(241), 1.12], [F(252), 1.0], [F(260), 1.1],
  [F(271), 1.0], [T.cta, 1.0], [F(303), 1.1], [F(311), 1.0], [F(321), 1.1], [T.valeu, 1.22]];
const zoomEm = (f: number) => { let z = 1, zp = 1, t0 = 0; for (const [a, v] of ZOOMS) { if (f >= a) { zp = z; z = v; t0 = a; } } return lerp(zp, z, E.expr(prog(f, t0, 7))); };

const Rosto: React.FC = () => {
  const f = useCurrentFrame();
  const {m, desde, antes} = modoEm(f);
  const t = E.expr(prog(f, desde, 9));
  const q = mixQ(qDe(antes), qDe(m), t);
  if (q.o <= 0.001) return null;
  const k = q.k * (m === 'face' ? zoomEm(f) : 1);
  const fonte = (src: number, de: number, ate: number) => (
    <Sequence from={de} durationInFrames={ate - de} layout="none">
      <OffthreadVideo src={staticFile('video/face.mp4')} startFrom={src} muted
        style={{position: 'absolute', width: 1080, height: 1920, left: q.w / 2 - q.cx * k, top: q.h / 2 - q.cy * k, transform: `scale(${k})`, transformOrigin: '0 0',
          filter: 'contrast(1.09) saturate(1.14) brightness(1.04)'}} />
    </Sequence>
  );
  return (
    <div style={{position: 'absolute', left: q.x, top: q.y, width: q.w, height: q.h, overflow: 'hidden', borderRadius: q.r, opacity: q.o, background: '#000'}}>
      {fonte(0, 0, T.gap)}
      {fonte(T.gap, T.gap + GAP_LEN, T.fim)}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(255,170,100,0.06)', mixBlendMode: 'soft-light'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.45))'}} />
    </div>
  );
};

// ---------------- barra de passos ----------------
const PASSOS = [['Projeto', T.ui1], ['Pedido', T.chat], ['Código', T.dica], ['Voz', T.voz]] as const;
const Passos: React.FC = () => {
  const f = useCurrentFrame();
  const sIn = spring(f, F(28), 0.4, 0.8);
  const sOut = 1 - prog(f, T.cta, 10);
  if (f < F(28) || sOut <= 0 || (f >= T.gap && f < T.gap + GAP_LEN)) return null;
  return (
    <div style={{position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, opacity: sIn * sOut, transform: `translateY(${(1 - sIn) * -30}px)`}}>
      {PASSOS.map(([nome, a], i) => {
        const prox = PASSOS[i + 1]?.[1] ?? T.simples;
        const atual = f >= a && f < prox; const feito = f >= prox;
        const s = spring(f, a, 0.5, 0.6);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, height: 60, padding: '0 22px', borderRadius: 30, fontFamily: TEXT, fontWeight: 700, fontSize: 25,
            background: atual ? UI.coral : 'rgba(20,20,20,0.72)', color: atual ? '#fff' : feito ? '#fff' : 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.12)', transform: `scale(${atual ? 1 + 0.08 * (1 - Math.abs(1 - s)) + 0.04 : 1})`, backdropFilter: 'blur(10px)'}}>
            <span style={{width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
              background: atual ? 'rgba(255,255,255,0.25)' : feito ? '#3DBE74' : 'rgba(255,255,255,0.12)'}}>{feito ? '✓' : i + 1}</span>{nome}
          </div>
        );
      })}
    </div>
  );
};

// ---------------- painel de cima ----------------
const camJanela = (f: number) => {
  // [quadro, escala, focoX, focoY] em coordenadas da janela (1440 x 1460)
  const K: [number, number, number, number][] = [[T.projetos, 0.66, 720, 730], [T.clica - 6, 0.9, 1100, 330], [T.modal + 2, 0.78, 890, 760], [T.nomeA - 4, 1.0, 890, 340],
    [T.ch1 - 8, 0.86, 890, 900], [T.criar + 14, 0.66, 720, 730], [T.chat, 0.66, 720, 730], [T.digA - 6, 0.98, 890, 1180], [T.digB + 4, 0.66, 720, 730]];
  let a = K[0], b = K[0];
  for (const k of K) { if (f >= k[0]) { a = b === K[0] && a === K[0] ? k : b; b = k; } }
  let i = 0; for (let j = 0; j < K.length; j++) if (f >= K[j][0]) i = j;
  const p = K[Math.max(0, i - 1)], c = K[i];
  const t = E.cam(prog(f, c[0], 16));
  return {s: lerp(p[1], c[1], t), x: lerp(p[2], c[2], t), y: lerp(p[3], c[3], t)};
};

const Topo: React.FC = () => {
  const f = useCurrentFrame();
  const AREA = {w: 1080, h: 1100, cx: 540, cy: 600};
  // fundo e conteúdo de acordo com o trecho
  if (f < T.faceA) return <Gancho f={f} />;
  if (f >= T.ui1 && f < T.dica) {
    const ent = spring(f, T.ui1, 0.35, 0.85);
    if (f < T.projetos) {
      // "algum aplicativo de IA" -> logo do Claude
      const sl = spring(f, T.claude - 4, 0.4, 0.62);
      const apps = ['Claude', 'ChatGPT', 'Gemini'];
      return (
        <AbsoluteFill style={{background: '#0E0E0E', alignItems: 'center', justifyContent: 'center', opacity: ent}}>
          <div style={{display: 'flex', gap: 30, marginTop: 80}}>
            {apps.map((a, i) => {
              const s = spring(f, T.ui1 + 4 + i * 4, 0.45, 0.7);
              const esc = f >= T.claude - 4 ? (i === 0 ? 1 + 0.25 * sl : 1 - 0.6 * sl) : 1;
              return <div key={a} style={{width: 260, height: 300, borderRadius: 36, background: i === 0 ? '#1C1A18' : '#161616', border: `1.5px solid ${i === 0 && f >= T.claude - 4 ? UI.coral : '#2A2A2A'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: s * (i > 0 && f >= T.claude - 4 ? 1 - 0.75 * sl : 1),
                transform: `scale(${(0.7 + 0.3 * s) * esc})`, fontFamily: TEXT, fontSize: 32, fontWeight: 600, color: '#fff'}}>
                {i === 0 ? <LogoClaude s={120} /> : <div style={{width: 110, height: 110, borderRadius: 55, background: '#2A2A2A'}} />}{a}</div>;
            })}
          </div>
        </AbsoluteFill>
      );
    }
    const c = camJanela(f);
    const noModal = f >= T.modal && f < T.criar + 10;
    const sm = spring(f, T.modal, 0.45, 0.78);
    const smOut = prog(f, T.criar + 4, 8);
    const nome = digitado(f, [['Edição de Vídeo com IA', T.nomeA, T.nomeB]]);
    const chips = [[I.book, 'Biblioteca de motion e lições', T.ch1], [I.key, 'APIs: ElevenLabs, Pexels, Apify', T.ch2], [I.music, 'Músicas livres (Kevin MacLeod)', T.ch3]] as const;
    const cardNovo = spring(f, T.criar + 10, 0.4, 0.7);
    const naChat = f >= T.chat;
    const press = f >= T.clica && f < T.clica + 8 ? Math.sin(((f - T.clica) / 8) * Math.PI) : 0;
    const pressC = f >= T.criar && f < T.criar + 8 ? Math.sin(((f - T.criar) / 8) * Math.PI) : 0;
    // cursor (coordenadas da janela)
    const cur = f < T.clica ? {x: lerp(900, 1150, E.expr(prog(f, T.clica - 14, 14))), y: lerp(900, 330, E.expr(prog(f, T.clica - 14, 14)))} : {x: 1150, y: 330};
    const texto = digitado(f, [['Claude, preciso que você faça um vídeo sobre lançamento oblíquo e explique através de fórmulas como você pode fazer isso.', T.digA, T.digB]]);
    return (
      <AbsoluteFill style={{background: '#0B0B0B'}}>
        <div style={{position: 'absolute', left: AREA.cx, top: AREA.cy + 30, transform: `scale(${c.s * (0.94 + 0.06 * ent)})`, opacity: ent}}>
          <div style={{position: 'absolute', left: -c.x, top: -c.y, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 140px rgba(0,0,0,0.7)', border: '1px solid #2A2A2A'}}>
            <Janela side={<Sidebar ativo={naChat ? 'fixado' : 'projetos'} projeto={naChat || f >= T.criar + 10} />}>
              {!naChat ? (
                <>
                  <TelaProjetos press={press} hl={f >= T.clica - 14 && f < T.modal ? 1 : 0}
                    cards={f >= T.criar + 10 ? [{nome: 'Edição de Vídeo com IA', quando: 'agora mesmo', o: cardNovo, s: 0.85 + 0.15 * cardNovo}] : []} />
                  {noModal && (
                    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.55 * sm * (1 - smOut)})`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 70}}>
                      <div style={{transform: `scale(${(0.92 + 0.08 * sm) * (1 - 0.05 * smOut)})`, opacity: sm * (1 - smOut)}}>
                        <ModalNovo f={f} nome={nome} digitando={f >= T.nomeA - 6 && f < T.ch1} criar={pressC}
                          chips={chips.filter((ch) => f >= ch[2]).map((ch) => ({icon: ch[0], t: ch[1], s: spring(f, ch[2], 0.45, 0.75)}))} />
                      </div>
                    </div>
                  )}
                  {f >= T.clica - 16 && f < T.modal + 4 && <div style={{position: 'absolute', left: cur.x - 340, top: cur.y}}><Cursor x={0} y={0} press={press} scale={1.6} /></div>}
                </>
              ) : (
                <TelaChat f={f} texto={texto} enviado={prog(f, T.digB + 4, 10)} trabalhando={prog(f, T.digB + 14, 60)} />
              )}
            </Janela>
          </div>
        </div>
        <Rotulo f={f} a={T.projetos + 4} b={T.clica - 8} t="1. Crie um projeto" />
        <Rotulo f={f} a={T.ch1 - 4} b={T.criar} t="Tudo que a IA pode usar" />
        <Rotulo f={f} a={T.chat + 2} b={T.digA - 4} t="2. Peça como numa conversa" />
      </AbsoluteFill>
    );
  }
  if (f >= T.manim && f < T.gap) {
    if (f < T.glsl) {
      const ent = spring(f, T.manim, 0.4, 0.8);
      const clip = spring(f, T.manimClip - 2, 0.4, 0.8);
      const manim = ['from manim import *', '', 'class Alcance(Scene):', '  def construct(self):', '    a = MathTex("A = v_{0x} \\cdot T")', '    self.play(Write(a))',
        '    h = MathTex("A = v_0^2 \\sin 2\\theta / g")', '    self.play(TransformMatchingTex(a, h))'];
      return (
        <AbsoluteFill style={{background: f < T.manimClip ? '#0B0B0B' : PAPEL}}>
          {f < T.manimClip + 8 && (
            <div style={{position: 'absolute', left: 40, right: 40, top: 150, opacity: ent * (1 - prog(f, T.manimClip, 8)), transform: `translateY(${(1 - ent) * 60}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26}}>
                <Chip s={spring(f, F(141) - 3, 0.5, 0.6)} tam={56}><Img src={staticFile('img/python.svg')} style={{width: 50, height: 50, filter: 'invert(1)'}} />manim.py</Chip>
                <span style={{fontFamily: TEXT, color: 'rgba(255,255,255,0.7)', fontSize: 30, opacity: spring(f, F(141) + 6, 0.4, 0.9)}}>biblioteca Python de matemática</span>
              </div>
              <Codigo f={f} arquivo="aula.py" icon="img/python.svg" linhas={manim} a={T.manimCode} b={T.manimClip - 6} tam={29} />
            </div>
          )}
          {f >= T.manimClip - 2 && (
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: clip}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: TINTA, letterSpacing: -1, marginTop: 40, marginBottom: 34, transform: `translateY(${(1 - clip) * 30}px)`}}>O código vira isso:</div>
              <ClipeAula de={90} inicio={T.manimClip - 2} w={1020} style={{transform: `scale(${0.9 + 0.1 * clip})`}} />
              <div style={{fontFamily: TEXT, fontSize: 30, color: '#6E6E73', marginTop: 30}}>Manim, a mesma ferramenta do canal 3Blue1Brown</div>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      );
    }
    // GLSL
    const ent = spring(f, T.glsl, 0.4, 0.8);
    const tit = spring(f, F(165) - 3, 0.5, 0.6);
    const glsl = ['// posição da bola no tempo t (física da aula)', 'vec3 posB(float v0, float th, float t) {', '  float x = v0 * cos(th) * t;', '  float y = v0 * sin(th) * t - 5.0 * t * t;',
      '  return vec3(x, RB + max(y, 0.0), 0.0);', '}', 'float bola = length(p - posB(v0, th, t)) - RB;'];
    const claude = spring(f, T.glslClaude, 0.5, 0.65);
    const aqui = spring(f, T.aquiCima, 0.5, 0.6);
    return (
      <AbsoluteFill style={{background: '#0B0B0B'}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 140, opacity: ent}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: '#fff', letterSpacing: -3, transform: `scale(${0.7 + 0.3 * tit})`, transformOrigin: 'left bottom', opacity: tit}}>3D =</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: UI.coral, letterSpacing: -3, opacity: spring(f, F(165) + 6, 0.5, 0.6)}}>GLSL</div>
          </div>
          <div style={{fontFamily: TEXT, fontSize: 32, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 30, opacity: spring(f, F(167), 0.4, 0.9)}}>
            uma linguagem que desenha 3D só com matemática
          </div>
          <div style={{boxShadow: aqui > 0.01 ? `0 0 0 ${5 * aqui}px rgba(217,119,87,${0.8 * aqui})` : 'none', borderRadius: 24}}>
            <Codigo f={f} arquivo="cena3d.glsl" icon="img/opengl.svg" linhas={glsl} a={T.glslCode} b={T.aquiCima + 10} tam={27} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, opacity: claude, transform: `translateY(${(1 - claude) * 30}px)`}}>
            <LogoClaude s={58} /><span style={{fontFamily: TEXT, fontWeight: 600, fontSize: 32, color: '#fff'}}>Quem escreveu esse código: o Claude</span>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (f >= T.comp && f < T.voz) return <Camadas f={f} />;
  if (f >= T.voz && f < T.simples) return <Voz f={f} />;
  if (f >= T.coord && f < T.cta) {
    const ent = spring(f, T.coord, 0.4, 0.85);
    return (
      <AbsoluteFill style={{background: '#0B0B0B'}}>
        <div style={{position: 'absolute', left: 40, top: 150, width: 1440, height: 1150, transform: `scale(${0.69 * (0.95 + 0.05 * ent)})`, transformOrigin: '0 0', opacity: ent,
          background: UI.bg, borderRadius: 30, border: '1px solid #2A2A2A', overflow: 'hidden'}}>
          <TelaCoordenador f={f} tIn={T.coord + 2} tSep={Math.min(T.coordSep, T.coord + 24)} tSub={Math.min(T.coordSub + 10, T.coord + 60)} />
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};

const Rotulo: React.FC<{f: number; a: number; b: number; t: string}> = ({f, a, b, t}) => {
  if (f < a || f > b + 8) return null;
  const s = spring(f, a, 0.5, 0.7) * (1 - prog(f, b, 8));
  return <div style={{position: 'absolute', left: 0, right: 0, top: 128, display: 'flex', justifyContent: 'center'}}>
    <Chip s={s} tam={44}>{t}</Chip></div>;
};

// ---------------- gancho: a aula rodando + números ----------------
const Gancho: React.FC<{f: number}> = ({f}) => {
  const it: [string, number][] = [['4 MIN', F(3)], ['SOM', F(6)], ['MÚSICA', F(7)], ['3D', F(9)]];
  const ia = spring(f, F(11) - 2, 0.5, 0.6);
  const hora = spring(f, F(13) - 2, 0.45, 0.55);
  const zoom = 1 + 0.06 * (f / T.faceA);
  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <div style={{position: 'absolute', left: -60, top: 300, transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>
        <ClipeAula de={247.4} inicio={0} w={1200} raio={0} style={{boxShadow: 'none'}} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
        {it.map(([t, a], i) => <Chip key={i} s={spring(f, a - 2, 0.55, 0.55)} tam={50} fundo={TINTA}>{t}</Chip>)}
      </div>
      <div style={{position: 'absolute', top: 980, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center'}}>
        <Chip s={ia} tam={62}>uma IA montou</Chip>
        <Chip s={hora} tam={62} fundo={TINTA} style={{transform: `scale(${0.6 + 0.4 * hora}) rotate(${-4 + (1 - hora) * -8}deg)`}}>&lt; 1 hora</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- pausa: resultado em 3D ----------------
const Resultado3D: React.FC<{f: number}> = ({f}) => {
  const s = spring(f, 0, 0.35, 0.8);
  const t = spring(f, 6, 0.5, 0.6);
  return (
    <AbsoluteFill style={{background: PAPEL, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${1.25 + 0.12 * (f / GAP_LEN)})`, opacity: s}}><ClipeAula de={270.2} inicio={T.gap} w={1080} raio={0} style={{boxShadow: 'none'}} /></div>
      <div style={{position: 'absolute', top: 360}}><Chip s={t} tam={64} fundo={TINTA}>Resultado: 3D sem modelar nada</Chip></div>
      <div style={{position: 'absolute', bottom: 470, fontFamily: TEXT, fontWeight: 600, fontSize: 36, color: '#6E6E73', opacity: spring(f, 18, 0.4, 0.9)}}>a bola, a luz e a sombra saem do código</div>
    </AbsoluteFill>
  );
};

// ---------------- camadas que viram o vídeo ----------------
const Camadas: React.FC<{f: number}> = ({f}) => {
  const ent = spring(f, T.comp, 0.4, 0.85);
  const junta = E.expr(prog(f, T.compJunta, 22));
  const cam = [['Música', '#7A6CF0', I.music], ['Voz IA', '#3DA5F0', I.mic], ['Legendas e montagem', '#2FBF8F', I.film], ['3D em GLSL', '#F0A13D', I.box], ['Fórmulas no Manim', UI.coral, I.book]] as const;
  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <div style={{position: 'absolute', left: 540, top: 600, perspective: 2400}}>
        <div style={{transformStyle: 'preserve-3d', transform: `rotateX(${lerp(58, 0, junta)}deg) rotateZ(${lerp(-38, 0, junta)}deg)`}}>
          {cam.map(([nome, cor, ic], i) => {
            const s = spring(f, T.comp + i * 4, 0.45, 0.75);
            const z = lerp((i - 2) * 130, 0, junta) + (1 - s) * 400;
            const ultimo = i === cam.length - 1;
            return (
              <div key={i} style={{position: 'absolute', left: -380, top: -214, width: 760, height: 428, borderRadius: 26, transform: `translateZ(${z}px)`, opacity: clamp(s * 1.3) * (ultimo ? 1 : 1 - clamp(junta * 1.4 - 0.4)),
                background: `${cor}22`, border: `3px solid ${cor}`, display: 'flex', alignItems: 'flex-start', padding: 26, gap: 14, fontFamily: TEXT, fontWeight: 700, fontSize: 34, color: TINTA, backdropFilter: 'blur(2px)'}}>
                <span style={{color: cor, display: 'flex'}}>{ic}</span>{nome}
              </div>
            );
          })}
          {junta > 0.6 && <div style={{position: 'absolute', left: -380, top: -214, opacity: clamp((junta - 0.6) * 3)}}><ClipeAula de={205} inicio={T.compJunta + 12} w={760} raio={26} /></div>}
        </div>
      </div>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: TINTA, letterSpacing: -1, opacity: ent}}>
        {junta < 0.5 ? '5 camadas, 1 vídeo' : 'tudo junto: 4:37 de aula'}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- voz ----------------
const Voz: React.FC<{f: number}> = ({f}) => {
  const ent = spring(f, T.voz, 0.4, 0.85);
  const nome = spring(f, T.vozNome - 3, 0.5, 0.65);
  const seta = E.expr(prog(f, F(212), 14));
  return (
    <AbsoluteFill style={{background: '#0B0B0B'}}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 150, opacity: ent, fontFamily: TEXT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Img src={staticFile('img/elevenlabs.svg')} style={{width: 58, height: 58, filter: 'invert(1)'}} />
          <span style={{fontSize: 46, fontWeight: 700, color: '#fff'}}>ElevenLabs</span>
          <span style={{fontSize: 26, color: 'rgba(255,255,255,0.6)', marginLeft: 8}}>texto vira voz</span>
        </div>
        <div style={{marginTop: 34, borderRadius: 22, background: '#161616', border: '1px solid #2A2A2A', padding: '26px 30px', fontSize: 30, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)'}}>
          "Você chuta uma bola. Ela sobe, faz uma curva perfeita e cai lá na frente..."
          <div style={{fontSize: 22, color: 'rgba(255,255,255,0.45)', marginTop: 10}}>roteiro escrito pelo Claude</div>
        </div>
        <div style={{height: 70, display: 'flex', justifyContent: 'center', alignItems: 'center', color: UI.coral, fontSize: 54, opacity: seta, transform: `translateY(${(1 - seta) * -20}px)`}}>↓</div>
        <div style={{borderRadius: 22, background: '#161616', border: `1.5px solid ${nome > 0.5 ? UI.coral : '#2A2A2A'}`, padding: '26px 30px', opacity: seta}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <span style={{width: 80, height: 80, borderRadius: 40, background: 'linear-gradient(135deg,#E9A27E,#B5653F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: '#fff'}}>JM</span>
            <div style={{opacity: nome, transform: `translateX(${(1 - nome) * 30}px)`}}><div style={{fontSize: 38, fontWeight: 700, color: '#fff'}}>Juliano Magalhães</div>
              <div style={{fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 4}}>Voz em português · gerada por IA</div></div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 120, marginTop: 20}}>
            {Array.from({length: 46}).map((_, i) => {
              const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9 + f * 0.35) * Math.sin(i * 0.37 + f * 0.13));
              return <div key={i} style={{flex: 1, height: `${a * 100}%`, borderRadius: 4, background: i / 46 < prog(f, F(212), 70) ? UI.coral : '#3A3A38'}} />;
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- sobreposições no rosto ----------------
const Sobre: React.FC = () => {
  const f = useCurrentFrame();
  // dica
  if (f >= T.dica && f < T.manim) {
    const s = spring(f, T.dica + 2, 0.45, 0.7) * (1 - prog(f, T.manim - 8, 8));
    const ls = [['Manim', 'fórmulas'], ['GLSL', '3D'], ['Remotion', 'vídeo']];
    return (
      <div style={{position: 'absolute', left: 60, right: 60, top: 180, opacity: s, transform: `translateY(${(1 - s) * -40}px)`}}>
        <div style={{borderRadius: 30, background: 'rgba(16,16,16,0.82)', border: '1px solid rgba(255,255,255,0.14)', padding: '30px 34px', backdropFilter: 'blur(14px)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Chip s={s} tam={36}>DICA</Chip>
            <span style={{fontFamily: TEXT, fontWeight: 700, fontSize: 36, color: '#fff'}}>uma linguagem certa pra cada tarefa</span></div>
          <div style={{display: 'flex', gap: 14, marginTop: 24}}>
            {ls.map(([a, b], i) => { const si = spring(f, F(127) + i * 5, 0.5, 0.7); return (
              <div key={a} style={{flex: 1, borderRadius: 18, background: 'rgba(255,255,255,0.06)', padding: '18px 20px', opacity: si, transform: `translateY(${(1 - si) * 20}px)`, fontFamily: TEXT}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: UI.coral}}>{a}</div><div style={{fontSize: 26, color: 'rgba(255,255,255,0.75)', marginTop: 4}}>→ {b}</div></div>); })}
          </div>
        </div>
      </div>
    );
  }
  // boa ideia -> IA executa
  if (f >= T.ideia - 2 && f < T.coord) {
    const a = spring(f, T.ideia - 2, 0.5, 0.6), b = spring(f, F(271) - 2, 0.5, 0.6);
    const out = 1 - prog(f, T.coord - 8, 8);
    return (
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: out}}>
        <Chip s={a} tam={58} fundo="#fff" cor={TINTA}>boa ideia</Chip>
        <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff', opacity: b, textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>→</span>
        <Chip s={b} tam={58}>IA executa</Chip>
      </div>
    );
  }
  // comente a próxima matéria
  if (f >= T.cta && f < T.fim) {
    const mats = [['Biologia', '#2FBF8F', -1], ['Química', '#3DA5F0', 1], ['Matemática', UI.coral, -1], ['História', '#F0A13D', 1], ['Física 2', '#7A6CF0', -1]] as const;
    return (
      <>
        {mats.map(([m, cor, lado], i) => {
          const a = F(303) - 4 + i * 6;
          const s = spring(f, a, 0.5, 0.62);
          if (f < a) return null;
          const y = 190 + i * 150 - (f - a) * 0.6;
          return (
            <div key={m} style={{position: 'absolute', top: y, left: lado < 0 ? 60 : undefined, right: lado > 0 ? 60 : undefined, opacity: clamp(s * 1.4) * (1 - prog(f, T.bast - 6, 10)),
              transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: lado < 0 ? 'left center' : 'right center', display: 'flex', alignItems: 'center', gap: 16,
              background: '#fff', borderRadius: 28, padding: '16px 26px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', fontFamily: TEXT}}>
              <span style={{width: 50, height: 50, borderRadius: 25, background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24}}>{m[0]}</span>
              <div><div style={{fontSize: 20, color: '#8A8A8E'}}>comentou</div><div style={{fontSize: 34, fontWeight: 700, color: TINTA}}>faz de {m}!</div></div>
            </div>
          );
        })}
        {f >= T.bast - 4 && (
          <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
            <Chip s={spring(f, T.bast - 4, 0.5, 0.6) * (1 - prog(f, T.valeu - 4, 6))} tam={56}>sempre com os bastidores</Chip>
          </div>
        )}
      </>
    );
  }
  return null;
};

// ---------------- cartão final ----------------
const Final: React.FC = () => {
  const f = useCurrentFrame() - T.fim;
  if (f < 0) return null;
  const s = spring(f, 0, 0.35, 0.8);
  const clique = 30;
  const segue = f >= clique + 3;
  const press = f >= clique && f < clique + 8 ? Math.sin(((f - clique) / 8) * Math.PI) : 0;
  const cx = lerp(980, 640, E.expr(prog(f, 10, 18))), cy = lerp(1500, 1105, E.expr(prog(f, 10, 18)));
  return (
    <AbsoluteFill style={{background: PAPEL, alignItems: 'center', justifyContent: 'center', opacity: clamp(s * 1.5), fontFamily: TEXT}}>
      <div style={{width: 300, height: 300, borderRadius: 150, overflow: 'hidden', border: `8px solid ${UI.coral}`, transform: `scale(${0.7 + 0.3 * s})`}}>
        <Img src={staticFile('img/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 88, color: TINTA, marginTop: 34, letterSpacing: -2}}>Vítor</div>
      <div style={{fontSize: 36, color: '#6E6E73', marginTop: 6}}>testando o limite da IA</div>
      <div style={{marginTop: 50, width: 440, height: 110, borderRadius: 55, background: segue ? '#E3E3E6' : UI.coral, color: segue ? TINTA : '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 14, fontSize: 46, fontWeight: 800, transform: `scale(${1 - 0.07 * press + (segue ? 0.04 * spring(f, clique + 3, 0.6, 0.4) * Math.exp(-(f - clique - 3) / 8) : 0)})`}}>
        {segue ? <>Seguindo <span style={{color: '#2FBF8F'}}>✓</span></> : '+ Seguir'}
      </div>
      <div style={{fontSize: 34, color: TINTA, marginTop: 50, opacity: spring(f, 44, 0.4, 0.9), fontWeight: 600}}>Próxima aula: você escolhe nos comentários</div>
      <div style={{position: 'absolute', bottom: 120, display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#8A8A8E'}}><LogoClaude s={40} />editado pelo Claude</div>
      {f > 8 && <div style={{position: 'absolute', left: cx, top: cy}}><Cursor x={0} y={0} press={press} scale={1.7} /></div>}
    </AbsoluteFill>
  );
};

export const Bastidores: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1100, overflow: 'hidden'}}><Topo /></div>
      {f >= T.gap && f < T.gap + GAP_LEN && <Resultado3D f={f - T.gap} />}
      <Rosto />
      <Sobre />
      <Passos />
      <Legenda y={1545} hide={(fr) => fr >= T.fim} />
      <Final />
    </AbsoluteFill>
  );
};
