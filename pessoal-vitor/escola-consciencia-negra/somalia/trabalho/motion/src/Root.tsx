import React from 'react';
import {Composition} from 'remotion';
import {AfricaPais, DUR_PAIS} from './AfricaPais';
import {Globo, DUR_GLOBO} from './Globo';
import {Partilha, DUR_PARTILHA} from './Partilha';
import {Ficha, Tempo, Atentado, Seca, Final} from './Numeros';
export const Root: React.FC = () => (
  <>
    <Composition id="AfricaPais" component={AfricaPais} durationInFrames={DUR_PAIS} fps={30} width={1920} height={1080} />
    <Composition id="Globo" component={Globo} durationInFrames={DUR_GLOBO} fps={30} width={1920} height={1080} />
    <Composition id="Partilha" component={Partilha} durationInFrames={DUR_PARTILHA} fps={30} width={1920} height={1080} />
    <Composition id="Ficha" component={Ficha} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="Tempo" component={Tempo} durationInFrames={240} fps={30} width={1920} height={1080} />
    <Composition id="Atentado" component={Atentado} durationInFrames={180} fps={30} width={1920} height={1080} />
    <Composition id="Seca" component={Seca} durationInFrames={210} fps={30} width={1920} height={1080} />
    <Composition id="Final" component={Final} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
