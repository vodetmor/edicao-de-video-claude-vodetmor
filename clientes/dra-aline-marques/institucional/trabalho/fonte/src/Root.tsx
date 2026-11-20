import React from 'react';
import {Composition} from 'remotion';
import {TOTAL, Video} from './Video';

export const Root: React.FC = () => (
  <Composition id="Aline" component={Video} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
