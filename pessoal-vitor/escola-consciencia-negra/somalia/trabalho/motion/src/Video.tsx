import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import tl from './data/timeline.json';
import {T} from './theme';
import {prog, approach, s, hash} from './kit';
import {AfricaPais} from './AfricaPais';
import {Globo} from './Globo';
import {Partilha} from './Partilha';
import {Ficha, Tempo, Atentado, Seca} from './Numeros';
import {Estrela5, Manchetes, Atlantico, Final, Sonho} from './Blocos';

// Vídeo inteiro. Planos e legendas vêm de src/data/timeline.json (scripts/timeline.py); o áudio é mixado à parte (scripts/mix.py).
export const DUR_VIDEO = Math.ceil(tl.total * 30);
const BLOCOS: Record<string, React.FC<any>> = {AfricaPais, Globo, Partilha, Tempo, Atentado, Seca, Estrela5, Manchetes, Atlantico, Final, Sonho};
const FADE = 8;
type Plano = typeof tl.planos[number] & Record<string, any>;
const grade = 'saturate(0.86) contrast(1.06) sepia(0.06)';

const Broll: React.FC<{p: Plano; dur: number}> = ({p, dur}) => {
  const f = useCurrentFrame();
  let filtro = grade;
  if (p.sepia_de) {
    const k = prog(f, s(p.sepia_de - p.t0), s(p.sepia_ate - p.t0));
    filtro = `saturate(${0.86 - 0.6 * k}) sepia(${0.06 + 0.7 * k}) contrast(1.06) brightness(${1 - 0.1 * k})`;
  }
  const zoom = (p.voa ? 1.17 : 1.0) * (1.02 + 0.06 * f / Math.max(1, dur));
  const origem = p.voa ? '30% 30%' : '50% 50%';
  // TV antiga desliga: a imagem achata numa linha, vira um ponto de luz e some
  let tv: React.CSSProperties = {};
  let ponto = 0;
  if (p.tv) {
    const t0 = s(p.tv - p.t0), a = prog(f, t0, t0 + 6), b = prog(f, t0 + 6, t0 + 11);
    if (a > 0) tv = {transform: `scale(${1 - 0.995 * b}, ${1 - 0.996 * a})`, filter: `brightness(${1 + 2.5 * a})`};
    ponto = b >= 1 ? 1 - prog(f, t0 + 11, t0 + 11 + s(p.tvfade ?? 2.6)) : b;
  }
  const rate = Math.min(p.lento || 1, Math.max(0.3, ((p.vdur || 99) - (p.inicio || 0) - 0.2) / ((dur + FADE) / 30)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{overflow: 'hidden', ...tv}}>
        {p.tipo === 'video' ? (
          <OffthreadVideo src={staticFile(p.src)} muted startFrom={Math.round((p.inicio || 0) * 30)} playbackRate={rate}
            style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: origem, filter: filtro}} />
        ) : (
          <Img src={staticFile(p.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(p.ax ?? 0.5) * 100}% ${(p.ay ?? 0.4) * 100}%`,
            transform: `scale(${1.03 + 0.08 * f / Math.max(1, dur)})`, filter: grade}} />
        )}
        {p.ficha && <Ficha />}
        {p.perolas !== undefined && <Perolas ini={s(p.perolas)} />}
      </AbsoluteFill>
      {ponto > 0 && <div style={{position: 'absolute', left: 960, top: 540, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, background: '#fff', opacity: ponto}} />}
    </AbsoluteFill>
  );
};

// "como quem junta pérolas": grãos no chão brilham por um instante
const Perolas: React.FC<{ini: number}> = ({ini}) => {
  const f = useCurrentFrame();
  if (f < ini - 4) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: 26}, (_, i) => {
        const t = f - ini - hash(i) * 14; const o = t < 0 ? 0 : Math.sin(Math.min(Math.PI, t / 36 * Math.PI));
        return <div key={i} style={{position: 'absolute', left: 300 + hash(i * 7) * 1320, top: 640 + hash(i * 13) * 360, width: 9, height: 9, borderRadius: 5, background: '#FFF8EC', opacity: o * 0.95}} />;
      })}
    </AbsoluteFill>
  );
};

const Legenda: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const c = tl.legendas.find(l => t >= l.t0 && t < l.t1);
  if (!c) return null;
  // em cima do papel sépia da partilha a legenda fica escura (nunca texto da mesma cor do fundo)
  const papel = tl.planos.some(p => p.src === 'Partilha' && t >= p.t0 + 1.4 && t < p.t1);
  return (
    <div style={{position: 'absolute', left: '5%', width: '90%', bottom: 140, textAlign: 'center', fontFamily: T.sans, fontSize: 50, lineHeight: 1.22,
      color: papel ? '#1E160D' : 'rgba(255,255,255,0.94)', fontWeight: papel ? 600 : 500,
      textShadow: papel ? '0 0 6px #F1E9D8, 0 0 14px #F1E9D8, 0 0 28px #F1E9D8, 0 0 3px #F1E9D8' : '0 2px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.6)', textWrap: 'balance' as any}}>{c.txt}</div>
  );
};

const Nome: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const n = tl.nomes.find(n => t >= n.t && t < n.t + 3.2);
  if (!n) return null;
  const papel = tl.planos.some(p => p.src === 'Partilha' && t >= p.t0 + 1.4 && t < p.t1);
  const k = prog(f, s(n.t), s(n.t) + 10) * (1 - prog(f, s(n.t + 2.7), s(n.t + 3.2)));
  return (
    <div style={{position: 'absolute', left: 96, top: 84, display: 'flex', alignItems: 'center', gap: 16, opacity: k, transform: `translateX(${(1 - k) * -16}px)`}}>
      <div style={{width: 5, height: 34, background: T.azul}} />
      <div style={{fontFamily: T.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.26em', color: papel ? '#1E160D' : '#fff', textShadow: papel ? '0 0 8px #F1E9D8, 0 0 18px #F1E9D8' : '0 2px 10px rgba(0,0,0,0.7)'}}>{n.nome.toUpperCase()}</div>
    </div>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: T.bg}}>
    {(tl.planos as Plano[]).map((p, i) => {
      const from = Math.round(p.t0 * 30), dur = Math.max(1, Math.round(p.t1 * 30) - from);
      const B = p.tipo === 'bloco' ? BLOCOS[p.src] : null;
      return (
        <Sequence key={i} from={from} durationInFrames={dur + FADE} layout="none">
          <Entra n={i}>{B ? <B {...(p.props || {})} /> : <Broll p={p} dur={dur} />}</Entra>
        </Sequence>
      );
    })}
    <Nome />
    <Legenda />
  </AbsoluteFill>
);

const Entra: React.FC<{n: number; children: React.ReactNode}> = ({n, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: n === 0 ? 1 : interpolate(f, [0, FADE], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
