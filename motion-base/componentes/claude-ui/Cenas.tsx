import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame, Sequence} from 'remotion';
import {UI, PAPEL, TINTA, FPS} from './lib';
import {DISPLAY, TEXT, MONO} from './Fonts';
import {spring, clamp, tween, E, lerp, prog} from './kit';
import {I, LogoClaude, Caret} from './ClaudeUI';

// ---------- texto digitado em sincronia com a fala ----------
// partes: [texto, quadroInicio, quadroFim]; cada parte aparece letra a letra no intervalo
export const digitado = (f: number, partes: [string, number, number][]) => {
  let out = '';
  for (const [t, a, b] of partes) {
    if (f < a) break;
    const n = Math.round(t.length * clamp((f - a) / Math.max(1, b - a)));
    out += t.slice(0, n);
    if (n < t.length) break;
  }
  return out;
};

// ---------- chat do projeto ----------
export const TelaChat: React.FC<{f: number; texto: string; enviado: number; trabalhando: number; zoom?: number}> = ({f, texto, enviado, trabalhando}) => {
  const env = clamp(enviado);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: TEXT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '34px 40px', borderBottom: `1px solid ${UI.line}`}}>
        <span style={{width: 50, height: 50, borderRadius: 10, background: UI.card, border: `1px solid ${UI.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: UI.mute}}>{I.box}</span>
        <span style={{fontSize: 30, fontWeight: 500}}>Edição de Vídeo com IA</span>
        <span style={{marginLeft: 'auto', fontSize: 25, color: UI.text, display: 'flex', gap: 10, alignItems: 'center'}}>{I.check}Visão Geral</span>
      </div>
      {env > 0 && (
        <div style={{position: 'absolute', right: 40, top: lerp(1080, 160, E.outCubic(env)), width: 820, borderRadius: 18, background: UI.card, border: `1px solid ${UI.line}`,
          padding: '26px 30px', fontSize: 29, lineHeight: 1.45, opacity: env}}>{texto}</div>
      )}
      {trabalhando > 0 && (
        <div style={{position: 'absolute', left: 60, top: 600, display: 'flex', alignItems: 'center', gap: 20, fontSize: 30, color: UI.mute, opacity: clamp(trabalhando * 2)}}>
          <span style={{display: 'flex', gap: 7}}>{[0, 1, 2].map((k) => <span key={k} style={{width: 10, height: 10, borderRadius: 5, background: UI.coral,
            opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f / 4 - k * 1.2))}} />)}</span>
          Claude está trabalhando <span style={{color: UI.faint}}>{Math.floor(trabalhando * 40)} s</span>
        </div>
      )}
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 60, borderRadius: 22, background: UI.card, border: `1px solid ${env < 1 && texto ? '#4A4A47' : UI.line}`,
        padding: '28px 30px 22px', opacity: 1}}>
        <div style={{fontSize: 34, lineHeight: 1.42, minHeight: 150, color: env > 0 ? UI.faint : UI.text}}>
          {env > 0 ? 'Responder...' : texto ? <>{texto}<Caret f={f} /></> : <span style={{color: UI.faint}}>Responder...<Caret f={f} /></span>}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, color: UI.mute, marginTop: 14}}>
          {I.plus}{I.mic}
          <span style={{marginLeft: 'auto', width: 54, height: 54, borderRadius: 14, background: texto && env === 0 ? UI.coral : '#3A3A38', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.12 * clamp(enviado * 6) * (1 - clamp(enviado * 6 - 1))})`}}>{I.send}</span>
        </div>
      </div>
    </div>
  );
};

// ---------- coordenador + subagentes (painel de conversas do projeto) ----------
export const TelaCoordenador: React.FC<{f: number; tIn: number; tSep: number; tSub: number}> = ({f, tIn, tSep, tSub}) => {
  const s0 = spring(f, tIn, 0.4, 0.8);
  const itens = [['Roteiro da aula', 'Texto pronto pra voz'], ['Voz e sincronia', '534 palavras com tempo'], ['Fórmulas no Manim', '10 cenas'],
    ['3D em GLSL', 'Abertura e replay'], ['Montagem, legenda e som', 'Remotion']];
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: TEXT, padding: '60px 56px', color: UI.text}}>
      <div style={{fontSize: 26, color: UI.mute, display: 'flex', alignItems: 'center', gap: 14}}>{I.chat}Conversas <span style={{background: UI.blue, color: '#fff', borderRadius: 8, padding: '1px 10px', fontSize: 20}}>5</span></div>
      <div style={{marginTop: 34, display: 'flex', alignItems: 'center', gap: 26, padding: '28px 30px', borderRadius: 20, background: UI.card, border: `1.5px solid ${UI.coral}`,
        opacity: s0, transform: `scale(${0.9 + 0.1 * s0})`, transformOrigin: 'left center'}}>
        <LogoClaude s={70} />
        <div><div style={{fontSize: 34, fontWeight: 600}}>Coordenador</div><div style={{fontSize: 24, color: UI.mute, marginTop: 6}}>Lê o pedido e divide o trabalho</div></div>
      </div>
      <svg width={1328} height={940} style={{position: 'absolute', left: 56, top: 250}}>
        {itens.map((_, k) => {
          const p = clamp((f - tSep - k * 5) / 14);
          const y = 92 + k * 168;
          return <path key={k} d={`M 60 0 L 60 ${y - 20} Q 60 ${y} 80 ${y} L 120 ${y}`} stroke={UI.coral} strokeWidth={3} fill="none"
            strokeDasharray={1000} strokeDashoffset={1000 * (1 - p)} opacity={0.8} />;
        })}
      </svg>
      {itens.map(([t, sub], k) => {
        const s = spring(f, tSep + k * 5 + 6, 0.45, 0.75);
        const done = f > tSub + k * 9;
        return (
          <div key={k} style={{position: 'absolute', left: 190, top: 290 + k * 168, width: 1130, height: 128, borderRadius: 18, background: UI.card,
            border: `1px solid ${UI.line}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', opacity: clamp(s * 1.4), transform: `translateX(${(1 - s) * 80}px)`}}>
            <span style={{width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'rgba(80,200,120,0.15)' : 'rgba(217,119,87,0.15)', color: done ? '#5BD08A' : UI.coral}}>
              {done ? I.check : <span style={{width: 18, height: 18, borderRadius: 9, border: `3px solid ${UI.coral}`, borderTopColor: 'transparent', transform: `rotate(${f * 18}deg)`}} />}
            </span>
            <div><div style={{fontSize: 31, fontWeight: 600}}>{t}</div><div style={{fontSize: 23, color: UI.mute, marginTop: 4}}>{sub}</div></div>
            <span style={{marginLeft: 'auto', fontSize: 22, color: done ? '#5BD08A' : UI.coral}}>{done ? 'Concluído' : 'Em andamento'}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- editor de código (digitação) ----------
const KW = /\b(class|def|self|return|float|vec2|vec3|vec4|for|int|if|break|import|from|const)\b/g;
const pinta = (linha: string) => {
  const out: React.ReactNode[] = [];
  const re = /(#.*$|\/\/.*$)|("[^"]*")|(\b\d+(?:\.\d+)?\b)|(\b(?:class|def|self|return|float|vec2|vec3|vec4|for|int|if|break|import|from|const)\b)|(\b[A-Za-z_]\w*(?=\())/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(linha))) {
    if (m.index > last) out.push(linha.slice(last, m.index));
    const cor = m[1] ? '#7C7A75' : m[2] ? '#A8D18B' : m[3] ? '#F2B36B' : m[4] ? '#E58B6B' : '#7FB4F5';
    out.push(<span key={k++} style={{color: cor}}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  out.push(linha.slice(last));
  return out;
};
export const Codigo: React.FC<{f: number; arquivo: string; linhas: string[]; a: number; b: number; icon?: string; tam?: number}> = ({f, arquivo, linhas, a, b, icon, tam = 30}) => {
  const total = linhas.join('\n').length;
  const n = Math.round(total * clamp((f - a) / Math.max(1, b - a)));
  let resto = n;
  return (
    <div style={{borderRadius: 24, background: '#111110', border: `1px solid ${UI.line}`, overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.5)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 26px', background: '#1A1A19', borderBottom: `1px solid ${UI.line}`, fontFamily: MONO, fontSize: 24, color: UI.text}}>
        <span style={{display: 'flex', gap: 9}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</span>
        {icon && <Img src={staticFile(icon)} style={{width: 26, height: 26, filter: 'invert(1)', marginLeft: 16}} />}<span>{arquivo}</span>
      </div>
      <div style={{padding: '24px 26px', fontFamily: MONO, fontSize: tam, lineHeight: 1.55, color: '#E6E4DF', whiteSpace: 'pre'}}>
        {linhas.map((l, i) => {
          const vis = l.slice(0, Math.max(0, resto)); const cheia = resto >= l.length; resto -= l.length + 1;
          if (vis.length === 0 && !cheia && resto < -l.length) return <div key={i} style={{height: tam * 1.55}} />;
          return <div key={i}><span style={{color: '#4F4E4A', display: 'inline-block', width: tam * 1.6}}>{i + 1}</span>{pinta(vis)}{!cheia && vis.length >= 0 && resto < 0 && resto > -l.length - 1 ? <Caret f={f} /> : null}</div>;
        })}
      </div>
    </div>
  );
};

// ---------- trecho da aula (16:9) ----------
// inicio = quadro do vídeo final em que o trecho começa a tocar (o vídeo anda junto com a composição)
export const ClipeAula: React.FC<{de: number; inicio: number; w?: number; raio?: number; style?: React.CSSProperties}> = ({de, inicio, w = 1000, raio = 28, style}) => (
  <div style={{width: w, height: (w * 9) / 16, borderRadius: raio, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.25)', position: 'relative', ...style}}>
    <Sequence from={inicio} layout="none">
      <OffthreadVideo src={staticFile('video/aula.mp4')} startFrom={Math.round(de * FPS)} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    </Sequence>
  </div>
);

// ---------- selo / chip ----------
export const Chip: React.FC<{s: number; children: React.ReactNode; cor?: string; fundo?: string; tam?: number; style?: React.CSSProperties}> = ({s, children, cor = '#fff', fundo = UI.coral, tam = 54, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: `${tam * 0.28}px ${tam * 0.55}px`, borderRadius: tam * 0.5, background: fundo, color: cor,
    fontFamily: DISPLAY, fontWeight: 900, fontSize: tam, letterSpacing: -0.5, opacity: clamp(s * 1.5), transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6}deg)`,
    boxShadow: '0 14px 40px rgba(0,0,0,0.25)', ...style}}>{children}</div>
);
