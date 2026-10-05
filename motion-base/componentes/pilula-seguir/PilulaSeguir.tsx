// Pílula "Seguir" para o meio de vídeos em loop: foto, @ e botão que o cursor clica (vira "Seguindo ✓").
// Entra, é clicada e sai em ~3,2 s, longe do primeiro e do último quadro, então o loop continua intacto.
// Só depende do Remotion. Precisa de public/img/avatar.jpg (cópia de pessoal-vitor/marca/foto-perfil.jpg).
// Som (sons.py): tick no quadro inicio+CLIQUE e chime curto em inicio+CLIQUE+3 (ver LEIA-ME.md).
import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const HANDLE = '@vitormach._'; // igual no TikTok e no Instagram
export const PILULA_DUR = 96; // quadros a 30 fps
export const CLIQUE = 34;     // quadro (relativo) do clique

type Props = {
  inicio: number;              // quadro em que a pílula começa a entrar
  x: number; y: number;        // canto superior esquerdo da pílula
  escala?: number;
  escuro?: boolean;            // fundo escuro (aulas) ou claro (bastidores)
  frase?: string;              // linha pequena embaixo do @
  fonte?: string;
};

const Cursor: React.FC<{press: number}> = ({press}) => (
  <svg width={34} height={46} viewBox="0 0 34 46" style={{transform: `scale(${1 - 0.15 * press})`, transformOrigin: '4px 4px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.45))'}}>
    <path d="M3 3 L3 37 L12 29 L18 43 L24 40 L18 27 L30 27 Z" fill="#fff" stroke="#111" strokeWidth={2.4} strokeLinejoin="round" />
  </svg>
);

export const PilulaSeguir: React.FC<Props> = ({inicio, x, y, escala = 1, escuro = true, frase = 'mais aulas assim', fonte = "'Inter Variable', Inter, sans-serif"}) => {
  const f = useCurrentFrame() - inicio;
  const {fps} = useVideoConfig();
  if (f < 0 || f > PILULA_DUR) return null;
  const entra = spring({frame: f, fps, config: {damping: 14, stiffness: 160, mass: 0.8}});
  const sai = interpolate(f, [PILULA_DUR - 16, PILULA_DUR], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t)});
  const press = f >= CLIQUE && f < CLIQUE + 8 ? Math.sin(((f - CLIQUE) / 8) * Math.PI) : 0;
  const segue = f >= CLIQUE + 3;
  const pulo = segue ? spring({frame: f - CLIQUE - 3, fps, config: {damping: 8, stiffness: 260}}) : 0;
  const ok = segue ? 1 + 0.06 * Math.sin(pulo * Math.PI) : 1;
  // cursor: entra de baixo à direita, para sobre o botão, clica, some
  const W = 560, H = 112;
  const bx = W - 150, by = H / 2;           // centro do botão
  const ida = interpolate(f, [10, CLIQUE - 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)});
  const cx = interpolate(ida, [0, 1], [bx + 190, bx - 6]), cy = interpolate(ida, [0, 1], [by + 150, by - 4]);
  const cursorOp = interpolate(f, [10, 16, CLIQUE + 14, CLIQUE + 22], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tinta = escuro ? '#F5F5F7' : '#111114', cinza = escuro ? '#A1A1A6' : '#6E6E73';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: W, height: H, transform: `translateX(${(1 - entra) * 60 + sai * 60}px) scale(${escala * (0.92 + 0.08 * entra)})`, transformOrigin: 'right center',
      opacity: Math.min(1, entra * 1.4) * (1 - sai), fontFamily: fonte}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: H / 2, background: escuro ? '#1C1C1F' : '#FFFFFF', boxShadow: escuro ? 'inset 0 0 0 1.5px #3A3A3F, 0 14px 40px rgba(0,0,0,.55)' : '0 14px 40px rgba(0,0,0,.16)',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 18}}>
        <div style={{width: 84, height: 84, borderRadius: 42, overflow: 'hidden', flexShrink: 0, boxShadow: `0 0 0 3px ${segue ? '#2FBF8F' : '#FE2C55'}`}}>
          <Img src={staticFile('img/avatar.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontWeight: 800, fontSize: 32, color: tinta, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>{HANDLE}</div>
          <div style={{fontWeight: 500, fontSize: 22, color: cinza, marginTop: 2, whiteSpace: 'nowrap'}}>{frase}</div>
        </div>
        <div style={{width: 200, height: 70, borderRadius: 35, flexShrink: 0, background: segue ? (escuro ? '#2C2C30' : '#E3E3E6') : '#FE2C55', color: segue ? tinta : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 28, transform: `scale(${(1 - 0.08 * press) * ok})`}}>
          {segue ? <>Seguindo <span style={{color: '#2FBF8F'}}>✓</span></> : 'Seguir'}
        </div>
      </div>
      <div style={{position: 'absolute', left: cx, top: cy, opacity: cursorOp}}><Cursor press={press} /></div>
    </div>
  );
};
