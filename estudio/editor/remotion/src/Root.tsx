import React from 'react';
import {Composition} from 'remotion';
import {EditorVideo, calcula} from './EditorVideo';
import type {Entrada} from './tipos';
import {Vitrine, calculaVitrine, type VitrineProps} from './Vitrine';

// Uma composição só. renderizar.mjs (ou o Studio com --props) entrega roteiro, palavras, rosto e base de cada projeto.
const vazio: Entrada = {
  roteiro: {estilo: 'split', formato: '9:16', cenas: [{de: '@0', layout: 'tela', elementos: [
    {tipo: 'titulo', texto: 'Editor de vídeo', apoio: 'abra com --props=projeto/entrada.json', de: '@0'}]}]},
  palavras: [],
  rosto: null,
  base: {arquivo: '', fps: 30, duracao: 3, largura: 1080, altura: 1920},
};

const vitrineVazia: VitrineProps = {...vazio, pessoa: '', estilos: [], rotulos: ['', ''], camera: [{de: '@0', modo: 'foco'}],
  palco: {cruAte: '@0', atras: []}, orbita: {de: '@0'}};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Editor" component={EditorVideo} calculateMetadata={calcula} defaultProps={vazio}
      durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="Vitrine" component={Vitrine} calculateMetadata={calculaVitrine} defaultProps={vitrineVazia}
      durationInFrames={90} fps={30} width={1080} height={1920} />
  </>
);
