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
import {Vix, Quadro, calcula as calcVix} from './vix/Vix';
import {Terceirao, DUR as DUR_TERCEIRAO} from './obras/terceirao/Terceirao';
import {Final, DUR_FINAL} from './obras/terceirao/Final';
import {Saudade3, DUR_SAUDADE3} from './obras/saudade/Saudade3';
import {Saudade, DUR_SAUDADE} from './obras/saudade/Saudade';
import {Gratis, DUR_GRATIS} from './obras/gratis/Gratis';
import {VslVixplay, DUR_VSL_VIXPLAY} from './obras/vsl-vixplay/VslVixplay';

// Uma composição genérica: a fábrica (fabrica.mjs) troca spec + variante + palavras a cada render.
export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Gratis" component={Gratis} durationInFrames={DUR_GRATIS} fps={30} width={1080} height={1920} />
  <Composition id="VslVixplay" component={VslVixplay} durationInFrames={DUR_VSL_VIXPLAY} fps={30} width={1080} height={1920} />
  <Composition id="Terceirao" component={Terceirao} durationInFrames={DUR_TERCEIRAO} fps={30} width={1920} height={1080} />
      <Composition id="Saudade3" component={Saudade3} durationInFrames={DUR_SAUDADE3} fps={30} width={1920} height={1080} />
      <Composition id="Saudade" component={Saudade} durationInFrames={DUR_SAUDADE} fps={30} width={1920} height={1080} />
      <Composition id="Final" component={Final} durationInFrames={DUR_FINAL} fps={30} width={1920} height={1080} />
  <Composition id="Quadro" component={Quadro as any} defaultProps={{} as any} durationInFrames={300} fps={30} width={1080} height={1920} />
  <Composition id="Vix" component={Vix} calculateMetadata={calcVix} defaultProps={{id: 'r1'}} durationInFrames={750} fps={30} width={1080} height={1920} />
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
