// Tela do app do Claude entre as versões (modelo: vídeo-demonstração de efeitos que o Vítor mandou em 30/10/2026):
// digita a skill no teclado, envia, aparece "Editando com ..." e a versão surge numa miniatura com dissolução em pixels;
// depois a câmera dá zoom da miniatura para a tela cheia. O cartão em si é desenhado pela Vitrine (pose 'app').
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp} from './kit';

export const APP = {fundo: '#262624', fundo2: '#1F1E1D', tecla: '#454542', texto: '#E8E6DF', suave: '#9C9A92', laranja: '#D97757'};
// onde a miniatura fica (centro relativo ao quadro, escala): à esquerda, logo abaixo da linha de status
export const MINI = {x: -0.175, y: 0.01, s: 0.5};
const INTER = "'Inter Variable', 'Inter', sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', 'Menlo', monospace";
const W = 1080;
const H = 1920;

const Topo: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 170, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{position: 'absolute', left: 72, display: 'flex', flexDirection: 'column', gap: 9}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: i === 2 ? 26 : 38, height: 4, borderRadius: 2, background: APP.suave}} />)}
    </div>
    <div style={{display: 'flex', background: APP.fundo2, borderRadius: 40, padding: 6, fontFamily: INTER, fontSize: 30, fontWeight: 500}}>
      <div style={{padding: '10px 26px', color: APP.suave}}>Chat</div>
      <div style={{padding: '10px 26px', color: APP.texto, background: '#3A3936', borderRadius: 34}}>Code</div>
    </div>
    <div style={{position: 'absolute', right: 72, width: 40, height: 40, border: `4px solid ${APP.suave}`, borderRadius: 8}} />
  </div>
);

const LINHAS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const Teclado: React.FC<{tecla?: string}> = ({tecla}) => (
  <div style={{position: 'absolute', left: 30, right: 30, top: 1010, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center'}}>
    {LINHAS.map((l, r) => (
      <div key={r} style={{display: 'flex', gap: 14}}>
        {l.split('').map((c) => (
          <div key={c} style={{width: 86, height: 108, borderRadius: 14, background: c === tecla ? '#6B6A66' : APP.tecla, color: APP.texto,
            fontFamily: INTER, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: c === tecla ? 'translateY(-6px) scale(1.08)' : undefined}}>{c}</div>
        ))}
      </div>
    ))}
    <div style={{display: 'flex', gap: 14}}>
      <div style={{width: 150, height: 108, borderRadius: 14, background: '#3A3936', color: APP.texto, fontFamily: INTER, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>123</div>
      <div style={{width: 460, height: 108, borderRadius: 14, background: APP.tecla, color: APP.texto, fontFamily: INTER, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>espaço</div>
      <div style={{width: 260, height: 108, borderRadius: 14, background: tecla === '/' ? '#6B6A66' : '#3A3936', color: APP.texto, fontFamily: INTER, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>/</div>
    </div>
  </div>
);

// fundo do app (fica ATRÁS do cartão): fase 1 digitando, fase 2 enviado + status
export const TelaClaude: React.FC<{f: number; ini: number; envio: number; comando: string; nota?: string; miniatura?: string; op: number}> = ({f, ini, envio, comando, nota, miniatura, op}) => {
  const enviado = f >= envio;
  const n = Math.min(comando.length, Math.max(0, Math.floor(((f - ini) / Math.max(1, envio - ini - 2)) * comando.length)));
  const digitado = comando.slice(0, n);
  const cursor = Math.floor(f / 8) % 2 === 0;
  const nome = comando.replace(/^\//, '');
  const pontos = '.'.repeat(1 + (Math.floor(f / 6) % 3));
  const thumb = (tam: number) => miniatura
    ? <Img src={staticFile(miniatura)} style={{width: tam, height: tam * 1.4, objectFit: 'cover', borderRadius: 10}} />
    : <div style={{width: tam, height: tam * 1.4, borderRadius: 10, background: '#444'}} />;
  return (
    <div style={{position: 'absolute', inset: 0, background: APP.fundo, opacity: op}}>
      <Topo />
      {!enviado ? (
        <>
          <div style={{position: 'absolute', left: 60, right: 60, top: 520, background: '#33332F', borderRadius: 22, padding: '22px 30px', fontFamily: INTER}}>
            <div style={{fontSize: 36, fontWeight: 600, color: APP.texto}}>{nome}</div>
            {nota && <div style={{fontSize: 26, color: APP.suave, marginTop: 4}}>{nota}</div>}
          </div>
          <div style={{position: 'absolute', left: 60, right: 60, top: 680, height: 230, background: '#30302C', borderRadius: 26, padding: 26}}>
            {thumb(56)}
            <div style={{marginTop: 16, fontFamily: INTER, fontSize: 42, color: APP.texto}}>
              {digitado}<span style={{opacity: cursor ? 1 : 0, color: APP.laranja}}>|</span>
            </div>
            <div style={{position: 'absolute', right: 26, bottom: 26, width: 64, height: 64, borderRadius: 16, background: APP.laranja,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 40, fontWeight: 700}}>↑</div>
          </div>
          <Teclado tecla={digitado.slice(-1)} />
        </>
      ) : (
        <>
          <div style={{position: 'absolute', right: 120, top: 270}}>{thumb(92)}</div>
          <div style={{position: 'absolute', right: 120, top: 410, fontFamily: INTER, fontSize: 38, color: APP.laranja}}>{comando}</div>
          <div style={{position: 'absolute', left: 81, top: 462, fontFamily: INTER, fontSize: 28, color: APP.laranja, opacity: 0.9}}>
            ✱ <span style={{color: APP.suave}}>Editando com {nome}{pontos}</span>
          </div>
          <div style={{position: 'absolute', right: 120, top: 466, fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: APP.suave, opacity: 0.6}}>ACELERADO</div>
        </>
      )}
    </div>
  );
};

// dissolução em pixels por cima da miniatura (antes do envio a Vitrine nem desenha o cartão): depois do envio os quadradinhos somem em ordem aleatória,
// alguns piscando em laranja (como a revelação da referência)
export const Dissolve: React.FC<{f: number; envio: number; dur?: number; op: number}> = ({f, envio, dur = 14, op}) => {
  const k = clamp((f - envio) / dur);
  if (f < envio || k >= 1 || op <= 0) return null;
  const cw = W * MINI.s;
  const ch = H * MINI.s;
  const left = W / 2 + MINI.x * W - cw / 2;
  const top = H / 2 + MINI.y * H - ch / 2;
  const nx = 18;
  const ny = 32;
  const lado = cw / nx;
  const cel: React.ReactNode[] = [];
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const r = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1; // ordem pseudoaleatória fixa (sem padrão visível)
    if (k > r) continue;
    const brilha = k > 0 && r - k < 0.12;
    cel.push(<div key={x + '-' + y} style={{position: 'absolute', left: x * lado, top: y * (ch / ny), width: lado + 0.5, height: ch / ny + 0.5,
      background: brilha ? APP.laranja : APP.fundo, opacity: brilha ? 0.85 : 1}} />);
  }
  return <div style={{position: 'absolute', left, top, width: cw, height: ch, opacity: op, borderRadius: 18, overflow: 'hidden'}}>{cel}</div>;
};
