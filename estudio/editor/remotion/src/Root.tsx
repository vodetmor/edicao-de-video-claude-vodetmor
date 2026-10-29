import React from 'react';
import {Composition} from 'remotion';
import {EditorVideo, calcula} from './EditorVideo';
import type {Entrada} from './tipos';

// Uma composição só. renderizar.mjs (ou o Studio com --props) entrega roteiro, palavras, rosto e base de cada projeto.
const vazio: Entrada = {
  roteiro: {estilo: 'split', formato: '9:16', cenas: [{de: '@0', layout: 'tela', elementos: [
    {tipo: 'titulo', texto: 'Editor de vídeo', apoio: 'abra com --props=projeto/entrada.json', de: '@0'}]}]},
  palavras: [],
  rosto: null,
  base: {arquivo: '', fps: 30, duracao: 3, largura: 1080, altura: 1920},
};

export const RemotionRoot: React.FC = () => (
  <Composition id="Editor" component={EditorVideo} calculateMetadata={calcula} defaultProps={vazio}
    durationInFrames={90} fps={30} width={1080} height={1920} />
);
