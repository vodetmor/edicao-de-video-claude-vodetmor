import React from 'react';
import {Composition} from 'remotion';
import {CriativoA, DUR_A} from './CriativoA';
import {CriativoB, DUR_B} from './CriativoB';

export const Root: React.FC = () => (
  <>
    <Composition id="CriativoA" component={CriativoA} durationInFrames={DUR_A} fps={30} width={1080} height={1920} />
    <Composition id="CriativoB" component={CriativoB} durationInFrames={DUR_B} fps={30} width={1080} height={1920} />
  </>
);
