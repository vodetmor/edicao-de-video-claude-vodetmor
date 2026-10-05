import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, f, tween} from './lib';
import {Grain, NameTape, useFonts} from './kit';
import {Caption} from './Caption';
import {ARoll, Abertura, Titulo} from './scenes/Abertura';
import {Mesa} from './scenes/Mesa';
import {Mapa, Moradores, Rajada} from './scenes/Riscos';
import {Abolicao, Divisao, Hoje, Lei1850, NaPratica, Rebobina, VBlurDefs} from './scenes/Historia';

export const DURACAO = 82.3;

// A-roll 1 sai para cima (tilt contínuo para a mesa), com borrão vertical proporcional à velocidade
const ARoll1: React.FC = () => {
  const frame = useCurrentFrame();
  const y = tween(frame, f(8.15), f(8.62), 0, -1080, E.expressiva);
  const y2 = tween(frame + 1, f(8.15), f(8.62), 0, -1080, E.expressiva);
  const vb = Math.min(30, Math.round(Math.abs(y2 - y) / 5));
  return (
    <AbsoluteFill style={{transform: `translateY(${y}px)`, filter: vb > 0 ? `url(#vblur${vb})` : undefined}}>
      <ARoll from={6.28} to={8.62} srcFrom={2.48} zooms={[{at: 6.28, s: 1.0}]} />
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <VBlurDefs />
      <Abertura />
      <Mesa />
      <ARoll1 />
      <ARoll
        from={18.45} to={22.95} srcFrom={14.65} blurIn
        zooms={[
          {at: 18.45, s: 1.12, y: 40},
          {at: 21.02, s: 1.27, y: 90, rot: -1.2},
        ]}
      />
      <Titulo />
      <Rajada />
      <Mapa />
      <Moradores />
      <Lei1850 />
      <Rebobina />
      <Divisao />
      <Abolicao />
      <NaPratica />
      <Hoje />
      <NameTape name="Vítor Machado" start={f(20.5)} dur={f(2.1)} x={140} y={560} />
      <Caption />
      <Grain amount={0.1} vignette={0.7} />
    </AbsoluteFill>
  );
};
