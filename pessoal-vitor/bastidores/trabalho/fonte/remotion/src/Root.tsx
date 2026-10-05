import React from 'react';
import {Composition} from 'remotion';
import {Bastidores} from './Bastidores';
import tempo from './data/tempo.json';
export const Root: React.FC = () => (
  <Composition id="Bastidores" component={Bastidores} durationInFrames={tempo.frames} fps={30} width={1080} height={1920} />
);
