// Composição principal da aula de ótica (refração → reflexão total → dispersão). Último quadro = quadro 0 (loop).
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './estilo';
import {useFontes} from './Fontes';
import {Palco} from './Palco';
import {Painel} from './Painel';
import {Cena3D} from './Cena3D';
import {Legenda} from './Legenda';

export const Aula: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Audio src={staticFile('audio/mix.wav')} />
      <Palco />
      <Painel />
      <Cena3D />
      <Legenda />
    </AbsoluteFill>
  );
};
