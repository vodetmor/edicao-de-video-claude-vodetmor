import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, E, approach, arrive, clamp, f, tween} from '../lib';
import {NameTape, Photo, Rain, SERIF} from '../kit';

// 0,0-0,8 silêncio em preto · 0,9-3,2 aviso digitado · 3,35 relâmpago · 3,8-6,3 chuva sobre a cidade
export const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const aviso = [
    {t: 'Baseado na obra', it: false},
    {t: 'Racismo Ambiental: Entenda essa Luta', it: true},
    {t: '(Canal Preto, 2021)', it: false},
  ];
  const avisoStart = f(0.9);
  const cps = 34;
  let offset = 0;
  const avisoOut = clamp((frame - f(3.05)) / 6);

  // relâmpago: dois clarões e depois a cena assenta
  const flash = (a: number, b: number) => (frame >= f(a) && frame < f(b) ? 1 : 0);
  const clarao = Math.max(flash(3.35, 3.45) * 1, flash(3.58, 3.63) * 0.7);
  const cenaOn = frame >= f(3.35) && !(frame >= f(3.45) && frame < f(3.58));
  const brilho = clarao > 0 ? 1.9 + clarao : tween(frame, f(3.63), f(4.2), 1.4, 1, E.saida);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {frame < f(3.3) && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - avisoOut}}>
          <div style={{textAlign: 'center', color: C.papel, fontFamily: SERIF, fontWeight: 500, fontSize: 38, lineHeight: '52px'}}>
            {aviso.map((l, li) => {
              const start = avisoStart + (offset / cps) * 30 + li * 4;
              offset += l.t.length;
              return (
                <div key={li} style={{fontStyle: l.it ? 'italic' : 'normal', opacity: l.it ? 0.95 : 0.62, fontSize: l.it ? 50 : 36}}>
                  {l.t.split('').map((ch, i) => {
                    const on = frame >= start + (i / cps) * 30;
                    return (
                      <span key={i} style={{opacity: on ? 1 : 0}}>
                        {ch}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      {cenaOn && frame < f(6.35) && (
        <AbsoluteFill style={{filter: `brightness(${brilho})`}}>
          <Photo src="fotos/chuva-cidade.jpg" from={f(3.35)} zoom0={1.08} zoomRate={0.022} filter="atual" />
          <Rain start={f(3.35)} intensity={1.1} opacity={0.55} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// A-roll do Vítor: 100/112/125% por frase, entrada desfoque → foco (Tinoco 1:00)
export const ARoll: React.FC<{from: number; to: number; srcFrom: number; zooms: {at: number; s: number; rot?: number; x?: number; y?: number}[]; blurIn?: boolean}> = ({
  from, to, srcFrom, zooms, blurIn,
}) => {
  const frame = useCurrentFrame();
  if (frame < f(from) || frame >= f(to)) return null;
  const z = [...zooms].reverse().find((q) => frame >= f(q.at)) ?? zooms[0];
  const drift = 1 + 0.0009 * (frame - f(z.at)); // nunca congela
  const blur = blurIn ? tween(frame, f(from), f(from) + 8, 14, 0, E.entrada) : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Sequence from={f(from)} layout="none">
        <AbsoluteFill
          style={{
            transform: `translate(${z.x ?? 0}px, ${z.y ?? 0}px) scale(${z.s * drift}) rotate(${z.rot ?? 0}deg)`,
            filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
          }}
        >
          <OffthreadVideo src={staticFile('vitor.mp4')} startFrom={f(srcFrom)} muted style={{width: '100%', height: '100%'}} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// Título: RACISMO (23,1) e AMBIENTAL (24,14) sobem da linha de base, letra a letra, com borrão vertical.
// Em 25,6 o título encolhe e sobe para virar cabeçalho de "É quando os riscos de um país".
export const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < f(23.0) || frame >= f(27.32)) return null;
  const palavra = (txt: string, start: number, size: number) => (
    <div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', height: size * 1.02, paddingTop: size * 0.02}}>
      {txt.split('').map((ch, i) => {
        const s0 = start + i * 1.35;
        const y = approach(frame, s0, size * 1.05, 0, 0.19);
        const v = frame < s0 ? 0 : size * 1.05 * 0.19 * Math.pow(0.81, frame - s0); // velocidade → borrão
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', transform: `translateY(${frame < s0 ? size * 1.1 : y}px)`,
              filter: v > 1 ? `blur(${Math.min(9, v / 7)}px)` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
  const enc = tween(frame, f(25.55), f(26.25), 1, 0.36, E.expressiva);
  const sobe = tween(frame, f(25.55), f(26.25), 0, -330, E.expressiva);
  const push = 1 + 0.0012 * (frame - f(23.1)); // deriva lenta enquanto segura
  const linha = arrive(frame, f(25.9), 0.14);
  return (
    <AbsoluteFill style={{background: C.fundo, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `translateY(${sobe}px) scale(${enc * push})`, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 250, lineHeight: 1, color: C.vermelho, letterSpacing: '0.02em'}}>
          {palavra('RACISMO', f(23.1), 250)}
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 250, lineHeight: 1, color: C.papel, letterSpacing: '0.02em', marginTop: -10}}>
          {palavra('AMBIENTAL', f(24.14), 250)}
        </div>
      </div>
      <div
        style={{
          position: 'absolute', top: 540 - 330 + 205, left: 960 - 280 * linha, width: 560 * linha, height: 3, background: C.vermelho,
        }}
      />
    </AbsoluteFill>
  );
};

export {Img};
