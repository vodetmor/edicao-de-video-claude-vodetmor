import React from 'react';
import {Composition} from 'remotion';
import {Aula} from './aula/Aula';
import {Teste} from './aula/Teste';
import {DURACAO, FPS} from './aula/tempo';

export const Root: React.FC = () => (
  <>
    <Composition id="Aula" component={Aula} durationInFrames={DURACAO} fps={FPS} width={1920} height={1080} />
    <Composition id="Teste" component={Teste as any} durationInFrames={10} fps={30} width={1920} height={1080} defaultProps={{yaw: 0.25, el: 0.32, dist: 5.2, foc: 2.0, alvo: [0.7, 0.35, 0.2], frente: 20, aa: 1}} />
  </>
);
