import React from 'react';
import {Composition} from 'remotion';
import {Aula} from './aula/Aula';
import {DURACAO, FPS} from './aula/tempo';

export const Root: React.FC = () => (
  <>
    <Composition id="Aula" component={Aula} durationInFrames={DURACAO} fps={FPS} width={1920} height={1080} />
  </>
);
