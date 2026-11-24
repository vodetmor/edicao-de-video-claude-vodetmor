import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Segmento, SegProps, duracaoSeg} from './Segmento';
import {Abertura, Encerramento, DUR_ABERTURA, DUR_FIM} from './Pontas';
import {FPS, W, H} from './tema';

// Cada parte é renderizada sozinha: npx remotion render Segmento --props=public/segmentos/<id>.json
const padrao: SegProps = {id: 'anna-julia', parte: 1, total: 6, titulo: '', data: '', falante: '', anoAtivo: 0, eventos: []};

export const Root: React.FC = () => (
  <>
    <Composition id="Segmento" component={Segmento as any} fps={FPS} width={W} height={H} durationInFrames={300}
      defaultProps={{...padrao, marcas: {}} as any}
      calculateMetadata={async ({props}: any) => {
        const marcas = await (await fetch(staticFile('docs/marcas.json'))).json();
        let fala = null;
        if (!props.aguardando) fala = await (await fetch(staticFile(`falas/${props.id}.json`))).json();
        const p = {...props, fala, marcas};
        return {props: p, durationInFrames: duracaoSeg(p)};
      }} />
    <Composition id="Abertura" component={Abertura} fps={FPS} width={W} height={H} durationInFrames={Math.round(DUR_ABERTURA * FPS)} />
    <Composition id="Encerramento" component={Encerramento} fps={FPS} width={W} height={H} durationInFrames={Math.round(DUR_FIM * FPS)} />
  </>
);
