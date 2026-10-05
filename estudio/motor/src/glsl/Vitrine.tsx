// Vídeo-vitrine "Isso não foi filmado": camada GLSL (cena 3D, dissolve, acabamento) + React (tipo, HUD, legenda).
// Cada momento é preso a uma palavra da locução (src/data/glsl_palavras.json) via chaves().
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import {useFonts} from '../Fonts';
import {approach, clamp, E, prog, RiseText, spring, WordsLine} from '../kit';
import {TEXT} from '../theme';
import {relogio, type Palavra} from '../motor/ancora';
import {chave, type Chave} from '../motor/chaves';
import {Legenda} from '../motor/blocos/Legenda';
import {Shader} from './Shader';
import {CENA} from './cena';
import {ACABAMENTO, DISSOLVE} from './overlays';
import {PALETA} from './comum';
import dados from '../data/glsl_palavras.json';

export const PALAVRAS = (dados as any).words as Palavra[];
export const DURACAO = Math.round((dados as any).dur * 30);
const MONO = "'JetBrains Mono', monospace";
const {papel: PAPEL, tinta: TINTA, azul: AZUL, cinza: CINZA} = PALETA;

// legenda: "G L S L." vira uma palavra só, "GLSL"
const LEG: Palavra[] = (() => {
  const i = PALAVRAS.findIndex((p) => p.w === 'G');
  if (i < 0) return PALAVRAS;
  const fim = PALAVRAS[i + 3];
  return [...PALAVRAS.slice(0, i), {...PALAVRAS[i], w: 'GLSL.', e: fim.e, fe: fim.fe}];
})();

// ---- roteiro dos uniforms (âncora, valor, curva, duração em quadros)
const K: Record<string, Chave[]> = {
  yaw: [['@0', 0.55], ['modelado-3', 0.55 + Math.PI, 'cam', 16], ['Agora', 0.55 + Math.PI * 2 - 0.3, 'cam', 40]],
  el: [['@0', 0.3], ['matemática-6', 1.18, 'cam', 42], ['transição+30', 0.22, 'corte'], ['Agora', 0.34, 'cam', 36]],
  dist: [['@0', 6.0], ['@1', 5.5, 'cam', 120], ['fórmula', 5.5, 'cam', 40], ['mesma', 5.2, 'cam', 50], ['transição+30', 4.6, 'corte'], ['Agora', 9.0, 'cam', 40]],
  oy: [['@0', 0], ['mesma', 0.1, 'cam', 40], ['transição+30', 0, 'corte'], ['Agora', 0.2, 'cam', 40]],
  ox: [['@0', 0.29], ['transição+30', 0.0, 'corte'], ['Agora', 0.0]],
  luzAz: [['@0', 2.2], ['luz-2', 3.5, 'cam', 26], ['sombra-2', 5.4, 'cam', 30], ['transição+30', 1.0, 'corte'], ['Agora', 2.4, 'cam', 30]],
  envRot: [['@0', 0], ['reflexo-2', 1.5, 'cam', 30]],
  scan: [['@0', 0], ['uma-8', 1.0, 'cam', 46], ['O-14', 0.0, 'expr', 18]],
  pix: [['@0', 1], ['pixel-1', 44, 'expr', 6], ['pixel#2', 1, 'corte']],
  derrete: [['@0', 0], ['mesma-6', 1, 'exit', 22], ['transição+30', 0, 'corte']],
  tinta: [['@0', 0], ['mesma+12', 1.0, 'enter', 60], ['transição+30', 0, 'corte']],
  palco: [['@0', 1], ['transição+30', 0, 'corte'], ['Agora+4', 1, 'expr', 24]],
  dissolve: [['@0', 0], ['transição-4', 1, 'expr', 30], ['acabamento-6', 0, 'expr', 28]],
  corte: [['@0', 1], ['acabamento+2', 0.5, 'cam', 24], ['Agora-6', 0.0, 'cam', 20]],
  grao: [['@0', 0.05], ['acabamento', 0.11, 'expr', 10], ['Agora', 0.06, 'expr', 20]],
  vinheta: [['@0', 0.0], ['acabamento', 0.55, 'expr', 10], ['Agora', 0.18, 'expr', 20]],
};

// ---- tipografia
const Linha2: React.FC<{f: number; a: number; b: number; sai: number; pequena: string; grande: string; risca?: number; cor: string}> = ({
  f, a, b, sai, pequena, grande, risca, cor,
}) => {
  if (f < a - 4 || f > sai + 14) return null;
  const r = risca === undefined ? 0 : E.expr(prog(f, risca, 9));
  const out = E.exit(prog(f, sai, 10));
  return (
    <div style={{position: 'absolute', left: 120, top: 360, opacity: 1 - prog(f, sai + 4, 8)}}>
      <WordsLine f={f} text={pequena} start={a} size={44} weight={500} color={CINZA} exitAt={sai} />
      <div style={{position: 'relative', marginTop: 4, transform: `translateY(${-out * 30}px)`}}>
        <RiseText f={f} text={grande} size={150} weight={700} stretch={100} tracking={-0.035} family={TEXT} upper={false} color={cor}
          opts={{start: b, stagger: 1.4, k: 0.2, rot: -6, exitAt: sai, exitStagger: 0.6}} />
        {risca !== undefined && (
          <div style={{position: 'absolute', left: -6, top: '54%', height: 9, width: r > 0 ? `calc(${r * 100}% + 12px)` : 0, background: AZUL, borderRadius: 5, opacity: 1 - out}} />
        )}
      </div>
    </div>
  );
};

const Formula: React.FC<{f: number; a: number; sai: number}> = ({f, a, sai}) => {
  const txt = 'd = min( toro(p), toro(q) )';
  const n = Math.floor(clamp((f - a) / 1.1, 0, txt.length));
  if (f < a || f > sai + 10) return null;
  const op = 1 - prog(f, sai, 8);
  return (
    <div style={{position: 'absolute', left: 120, top: 660, fontFamily: MONO, fontSize: 34, color: TINTA, opacity: op, letterSpacing: '0.01em'}}>
      <span style={{color: AZUL}}>{'// distância até a superfície'}</span>
      <div style={{marginTop: 10}}>
        {txt.slice(0, n)}
        <span style={{display: 'inline-block', width: 18, height: 36, background: AZUL, marginLeft: 4, transform: 'translateY(6px)', opacity: Math.floor(f / 8) % 2 || n < txt.length ? 1 : 0}} />
      </div>
    </div>
  );
};

const Lista: React.FC<{f: number; q: (a: string) => number}> = ({f, q}) => {
  const itens = [['luz', 'luz'], ['sombra', 'sombra'], ['reflexo', 'reflexo']] as const;
  const sai = q('pixel-8');
  if (f < q('O-4') || f > sai + 14) return null;
  const ativo = itens.reduce((k, [, a], i) => (f >= q(a) - 2 ? i : k), -1);
  return (
    <div style={{position: 'absolute', left: 120, top: 330}}>
      <WordsLine f={f} text="O código calcula" start={q('O-2')} size={44} weight={500} color={CINZA} exitAt={sai} />
      {itens.map(([txt, a], i) => {
        const s = q(a) - 2;
        if (f < s) return null;
        const y = approach(f, s, 46, 0, 0.2);
        const op = clamp((f - s + 1) / 3) * (1 - prog(f, sai + i * 2, 8));
        const on = i === ativo;
        return (
          <div key={txt} style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 14, transform: `translateY(${y}px)`, opacity: op}}>
            <div style={{width: 22, height: 22, borderRadius: 11, background: on ? AZUL : '#C7C7CC', transform: `scale(${0.9 + 0.1 * spring(f, s, 0.5, 0.6)})`}} />
            <div style={{fontFamily: TEXT, fontWeight: 700, fontSize: 104, letterSpacing: '-0.035em', lineHeight: 1.04, color: on ? TINTA : '#B9B9BE'}}>{txt}</div>
          </div>
        );
      })}
    </div>
  );
};

const Bloco: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
  if (f < a + 3 || f >= b) return null;
  // um bloco real da grade do shader (que nasce no canto de baixo: gl_FragCoord); no CSS o topo é 0
  const B = 44, x = Math.floor(1090 / B) * B, yy = 1080 - (Math.floor((1080 - 560) / B) + 1) * B;
  const s = spring(f, a + 3, 0.45, 0.7);
  const lb = prog(f, a + 6, 7);
  return (
    <>
      <div style={{position: 'absolute', left: x - 3, top: yy - 3, width: B + 6, height: B + 6, border: `4px solid ${AZUL}`, borderRadius: 4, transform: `scale(${0.6 + 0.4 * s})`, opacity: clamp(s * 2)}} />
      <div style={{position: 'absolute', left: x - 30 - 280 * E.expr(lb), top: yy + B / 2 - 1, width: 280 * E.expr(lb), height: 2, background: AZUL}} />
      <div style={{position: 'absolute', right: 1920 - (x - 330), top: yy + B / 2 - 44, textAlign: 'right', fontFamily: MONO, fontSize: 30, lineHeight: 1.5, color: TINTA, opacity: prog(f, a + 9, 6)}}>
        pixel ({Math.round(x + B / 2)}, {Math.round(yy + B / 2)})<br />
        <span style={{color: AZUL}}>cor = luz × sombra × material</span>
      </div>
    </>
  );
};

const Hud: React.FC<{f: number; total: number; escuro: number}> = ({f, total, escuro}) => {
  const cor = escuro > 0.5 ? '#8E8E93' : '#8E8E93';
  const s = (f / 30).toFixed(3).replace('.', ',');
  const st: React.CSSProperties = {position: 'absolute', top: 54, fontFamily: MONO, fontSize: 22, letterSpacing: '0.04em', color: cor};
  return (
    <>
      <div style={{...st, left: 64}}>t = {s.padStart(6, '0')} s</div>
      <div style={{...st, right: 64}}>quadro {String(f + 1).padStart(4, '0')} / {total}</div>
    </>
  );
};

const Final: React.FC<{f: number; q: (a: string) => number}> = ({f, q}) => {
  const a = q('Agora+6');
  if (f < a) return null;
  const letras = [['G', 'G'], ['L', 'L'], ['S', 'S'], ['L', 'L#2']] as const;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <RiseText f={f} text="Estúdio" size={120} weight={700} stretch={100} tracking={-0.035} family={TEXT} upper={false} color={TINTA} opts={{start: a, stagger: 1.4, k: 0.2, rot: -6}} />
      <div style={{display: 'flex', gap: 34, marginTop: 18, fontFamily: MONO, fontWeight: 500, fontSize: 58, color: AZUL}}>
        <span style={{color: CINZA, opacity: prog(f, q('fala-2'), 6), fontSize: 36, alignSelf: 'center', marginRight: 10}}>React +</span>
        {letras.map(([l, an], i) => {
          const s = q(an) - 1;
          const sp = spring(f, s, 0.55, 0.62);
          return <span key={i} style={{display: 'inline-block', opacity: clamp((f - s) / 2), transform: `translateY(${(1 - sp) * 26}px) scale(${1.25 - 0.25 * sp})`}}>{l}</span>;
        })}
      </div>
    </div>
  );
};

// uniforms da cena num quadro (fracionário dentro do motion blur)
const uCena = (f: number, q: (a: string | number) => number) => {
  const k = (n: string) => chave(f, q, K[n]);
  return {
    yaw: k('yaw') + (f / 30) * 0.11, el: k('el'), dist: k('dist'), ox: k('ox'), oy: k('oy'), luzAz: k('luzAz'), envRot: k('envRot'), scan: k('scan'),
    pix: Math.round(k('pix')), derrete: k('derrete'), tinta: k('tinta'), palco: k('palco'), giro: (f / 30) * 0.32, aa: 2,
  };
};
const CenaLayer: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  return <Shader frag={CENA} u={uCena(f, relogio(PALAVRAS, total))} />;
};

export const Vitrine: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {durationInFrames: total} = useVideoConfig();
  const q = relogio(PALAVRAS, total);
  const k = (n: string) => chave(f, q, K[n]);
  const u = uCena(f, q);
  const escuro = 1 - u.palco;
  const dis = k('dissolve');
  const legCor = escuro > 0.5 ? PAPEL : TINTA;
  return (
    <AbsoluteFill style={{background: PAPEL}}>
      {f >= q('modelado-4') && f <= q('modelado+14') ? (
        <CameraMotionBlur samples={8} shutterAngle={200}>
          <CenaLayer total={total} />
        </CameraMotionBlur>
      ) : (
        <CenaLayer total={total} />
      )}
      <Linha2 f={f} a={q('Isso')} b={q('filmado') - 3} sai={q('E-6')} pequena="Isso não foi" grande="filmado." risca={q('filmado:fim')} cor={TINTA} />
      <Linha2 f={f} a={q('também')} b={q('modelado') - 3} sai={q('uma-10')} pequena="E também não foi" grande="modelado." risca={q('modelado:fim')} cor={TINTA} />
      <Linha2 f={f} a={q('uma-4')} b={q('fórmula') - 3} sai={q('O-10')} pequena="É uma" grande="fórmula." cor={AZUL} />
      <Formula f={f} a={q('uma')} sai={q('O-10')} />
      <Lista f={f} q={q} />
      <Bloco f={f} a={q('pixel')} b={q('pixel#2')} />
      <Linha2 f={f} a={q('mesma-3')} b={q('textura') - 3} sai={q('transição-2')} pequena="A mesma matemática vira" grande="textura," cor={TINTA} />
      <Shader frag={DISSOLVE} u={{prog: dis, escala: 2.2}} />
      {f >= q('acabamento') && f < q('Agora') + 4 && (
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, fontFamily: MONO, fontSize: 28, letterSpacing: '0.06em', color: '#AEAEB2', opacity: prog(f, q('acabamento') + 8, 8) * (1 - prog(f, q('Agora') - 8, 8))}}>
          <span style={{position: 'absolute', right: 960 + 300}}>SEM</span>
          <span style={{position: 'absolute', left: 960 + 300}}>COM</span>
        </div>
      )}
      <Final f={f} q={q} />
      <Hud f={f} total={total} escuro={escuro} />
      <Legenda f={f} dur={total} w={1920} h={1080} inicio={0} t={(a) => q(a)} palavras={LEG} p={{cor: legCor, base: 0.9}} />
      <Shader frag={ACABAMENTO} u={{grao: k('grao'), vinheta: k('vinheta'), corte: k('corte'), quadro: f}} style={{mixBlendMode: 'overlay'}} />
      {f >= q('acabamento') && f < q('Agora') && (
        <div style={{position: 'absolute', top: 0, bottom: 0, left: k('corte') * 1920 - 1, width: 2, background: AZUL, opacity: k('corte') < 0.999 && k('corte') > 0.001 ? 0.9 : 0}} />
      )}
      <Audio src={staticFile('audio/glsl/mix.wav')} />
    </AbsoluteFill>
  );
};
