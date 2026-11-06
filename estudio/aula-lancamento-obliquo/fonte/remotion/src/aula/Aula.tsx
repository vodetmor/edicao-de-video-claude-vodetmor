// Composição principal da aula de lançamento oblíquo.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './estilo';
import {useFontes} from './Fontes';
import {Palco} from './Palco';
import {CamadaManim} from './CamadaManim';
import {Cena3D} from './Cena3D';
import {Legenda} from './Legenda';
import {P, PAUSA} from './tempo';

export const Aula: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill style={{background: C.papel}}>
      <Audio src={staticFile('audio/mix.wav')} />
      <Palco />
      <CamadaManim />
      <Cena3D />
      <Legenda some={(f) => (f >= P(28) - 2 && f < PAUSA(31).ate ? 1 : 0)} />
    </AbsoluteFill>
  );
};
