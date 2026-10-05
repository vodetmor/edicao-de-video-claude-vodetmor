// Composição principal da aula de ótica (refração → reflexão total → dispersão). Último quadro = quadro 0 (loop).
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './estilo';
import {useFontes} from './Fontes';
import {Palco} from './Palco';
import {Painel} from './Painel';
import {Cena3D} from './Cena3D';
import {Legenda} from './Legenda';
import {PilulaSeguir} from '../comp/PilulaSeguir';
import {FALA_SEGUIR} from './tempo';

// chamada para seguir no meio da aula, logo depois da resposta da questão (θ₂ ≈ 37°): longe do 1º e do último quadro, o loop fica intacto.
// Fala gravada à parte; o clique no botão (quadro 34 da pílula) cai no "segue" (1,62 s depois do início da fala).
export const SEGUIR_INI = FALA_SEGUIR.f + Math.round(1.62 * 30) - 34;

export const Aula: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill style={{background: C.fundo}}>
      <Audio src={staticFile('audio/mix.wav')} />
      <Palco />
      <Painel />
      <Cena3D />
      <Legenda />
      <PilulaSeguir inicio={SEGUIR_INI} x={1920 - 560 - 70} y={26} />
    </AbsoluteFill>
  );
};
