import React from 'react';
import {Composition} from 'remotion';
import {calcula, Video} from './motor/Video';
import type {EntradaVideo} from './motor/tipos';
import spec from '../specs/gancho-c2.json';
import words from './data/words_c2.json';
import {Teste} from './glsl/Teste';
import {TesteRay} from './glsl/TesteRay';
import {Vitrine, DURACAO} from './glsl/Vitrine';
import {Cavalo} from './glsl/Cavalo';

// Uma composição genérica: a fábrica (fabrica.mjs) troca spec + variante + palavras a cada render.
export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Cavalo" component={Cavalo} durationInFrames={120} fps={30} width={1920} height={1080} />
  <Composition id="GlslVitrine" component={Vitrine} durationInFrames={DURACAO} fps={30} width={1920} height={1080} />
  <Composition id="RayTeste" component={TesteRay} durationInFrames={30} fps={30} width={1920} height={1080} />
  <Composition id="GlslTeste" component={Teste} durationInFrames={60} fps={30} width={1920} height={1080} />
  <Composition
    id="Video"
    component={Video}
    calculateMetadata={calcula}
    defaultProps={{spec, variante: 'A', palavras: words.words} as unknown as EntradaVideo}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
