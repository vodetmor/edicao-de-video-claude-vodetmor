import React from 'react';
import {Composition} from 'remotion';
import {AfricaPais, DUR_PAIS} from './AfricaPais';
import {Globo, DUR_GLOBO} from './Globo';
import {Partilha, DUR_PARTILHA} from './Partilha';
import {Ficha, Tempo, Atentado, Seca} from './Numeros';
import {Estrela5, Manchetes, Atlantico, Final} from './Blocos';
import {Video, DUR_VIDEO} from './Video';
import {Thumb} from './Thumb';
export const Root: React.FC = () => (
  <>
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Video" component={Video} durationInFrames={DUR_VIDEO} fps={30} width={1920} height={1080} />
    <Composition id="Estrela5" component={Estrela5} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="Manchetes" component={Manchetes} durationInFrames={270} fps={30} width={1920} height={1080} />
    <Composition id="Atlantico" component={Atlantico} durationInFrames={240} fps={30} width={1920} height={1080} />
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
