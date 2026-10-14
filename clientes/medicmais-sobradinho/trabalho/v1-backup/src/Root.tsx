import React from 'react';
import {Composition} from 'remotion';
import cues from './cues.json';
import {Video} from './Video';

export const Root: React.FC = () => (
  <Composition id="MedicMais" component={Video} durationInFrames={cues.dur} fps={30} width={1080} height={1920} />
);
