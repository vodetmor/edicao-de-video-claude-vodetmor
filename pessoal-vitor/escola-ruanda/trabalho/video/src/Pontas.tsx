import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence} from 'remotion';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/400-italic.css';
import '@fontsource/source-serif-4/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import {C, FONT} from './tema';
import creditos from './creditos.json';

export const DUR_ABERTURA = 8;
export const DUR_FIM = 24;

const Mono: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 2.4, textTransform: 'uppercase', color: C.muted, ...style}}>{children}</div>
);

export const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const z = interpolate(f, [0, D], [1.06, 1.16]);
  const cinza = interpolate(f, [2 * fps, 5 * fps], [0.1, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const foto = interpolate(f, [0, 20, D - 18, D], [0, 0.62, 0.62, 0], {extrapolateRight: 'clamp'});
  const t1 = spring({frame: f - 0.8 * fps, fps, config: {damping: 200}, durationInFrames: 30});
  const t2 = spring({frame: f - 1.6 * fps, fps, config: {damping: 200}, durationInFrames: 30});
  const sai = interpolate(f, [D - 16, D], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{opacity: foto, overflow: 'hidden'}}>
        <Img src={staticFile('fotos/kigali-colinas.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', transform: `scale(${z})`, filter: `grayscale(${cinza}) brightness(0.62)`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: sai}}>
        <Mono style={{opacity: t1, color: '#c9c4ba'}}>Trabalho escolar · História</Mono>
        <div style={{fontFamily: FONT.serif, fontSize: 200, color: C.white, letterSpacing: -4, marginTop: 6, opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`}}>Ruanda</div>
        <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 46, color: '#dcd7cc', opacity: t2}}>Guerra civil e genocídio · 1990–1994</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 46, width: '100%', textAlign: 'center', opacity: t2 * sai}}>
        <Mono style={{fontSize: 17, color: '#a8a398'}}>Este vídeo trata de um genocídio. Nenhuma imagem de violência é mostrada.</Mono>
      </div>
      <div style={{position: 'absolute', right: 28, bottom: 18, fontFamily: FONT.mono, fontSize: 14, color: 'rgba(245,243,238,0.6)', opacity: foto}}>Colinas de Kigali · Ana Kenk / Pexels</div>
    </AbsoluteFill>
  );
};

export const Encerramento: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const A = 7 * fps; // memória
  const m = interpolate(f, [0, 24, A - 18, A], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
  const rolo = interpolate(f, [A, D - 2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fim = interpolate(f, [D - 24, D], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Sequence durationInFrames={A}>
        <AbsoluteFill style={{opacity: m * 0.5}}>
          <Img src={staticFile('fotos/memorial-tumulos.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.9) brightness(0.6)', transform: `scale(${interpolate(f, [0, A], [1.04, 1.12])})`}} />
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: m}}>
          <Mono style={{color: '#cfcabf'}}>Kwibuka · “lembrar”, em kinyarwanda</Mono>
          <div style={{fontFamily: FONT.serif, fontSize: 84, color: C.white, marginTop: 14, textAlign: 'center', lineHeight: 1.1}}>Em memória das cerca de<br />800 mil vítimas.</div>
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{opacity: fim, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: interpolate(rolo, [0, 1], [1080, 1080 - (creditos.altura ?? 2400)]), textAlign: 'center'}}>
          {creditos.blocos.map((b: any, i: number) => (
            <div key={i} style={{marginBottom: 64}}>
              <Mono style={{fontSize: 20}}>{b.titulo}</Mono>
              {b.linhas.map((l: string, k: number) => (
                <div key={k} style={{fontFamily: b.pequeno ? FONT.mono : FONT.serif, fontSize: b.pequeno ? 19 : 44, color: b.pequeno ? '#bdb8ad' : C.white, marginTop: b.pequeno ? 6 : 10, lineHeight: 1.35, padding: '0 200px'}}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
