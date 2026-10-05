import React from 'react';
import {Composition} from 'remotion';
import {Main, DURACAO} from './Main';
import {Parte3, DURACAO_P3} from './p3/Parte3';
import {Parte4, DURACAO_P4} from './p4/Parte4';
import {Parte5, DURACAO_P5} from './p5/Parte5';
import {Parte7, DURACAO_P7} from './p7/Parte7';
import {Parte2, DURACAO_P2} from './p2/Parte2';
import {Parte6, DURACAO_P6} from './p6/Parte6';
import {FPS} from './lib';

const comp = {fps: FPS, width: 1920, height: 1080};
export const Root: React.FC = () => (
  <>
    <Composition id="Parte1Vitor" component={Main} durationInFrames={Math.round(DURACAO * FPS)} {...comp} />
    <Composition id="Parte3Caina" component={Parte3} durationInFrames={Math.round(DURACAO_P3 * FPS)} {...comp} />
    <Composition id="Parte4Luisa" component={Parte4} durationInFrames={Math.round(DURACAO_P4 * FPS)} {...comp} />
    <Composition id="Parte5AnnaAugusta" component={Parte5} durationInFrames={Math.round(DURACAO_P5 * FPS)} {...comp} />
    <Composition id="Parte2MariaEduarda" component={Parte2} durationInFrames={Math.round(DURACAO_P2 * FPS)} {...comp} />
    <Composition id="Parte6MariaAlice" component={Parte6} durationInFrames={Math.round(DURACAO_P6 * FPS)} {...comp} />
    <Composition id="Parte7AnnaJulia" component={Parte7} durationInFrames={Math.round(DURACAO_P7 * FPS)} {...comp} />
  </>
);
