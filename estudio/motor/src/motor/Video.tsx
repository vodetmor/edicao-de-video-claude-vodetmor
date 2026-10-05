import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../Fonts';
import {C} from '../theme';
import {relogio} from './ancora';
import {BLOCOS} from './blocos';
import {FORMATOS} from './formatos';
import type {EntradaVideo, Evento} from './tipos';

const cor = (c?: string) => (c && c in C ? (C as any)[c] : c) ?? C.paper;

export const calcula: CalculateMetadataFunction<EntradaVideo> = ({props}) => {
  const v = props.spec.variantes.find((x) => x.id === props.variante);
  if (!v) throw new Error(`variante não existe: ${props.variante}`);
  const q = relogio(props.palavras, 0);
  const {w, h} = FORMATOS[v.formato];
  return {durationInFrames: q(props.spec.duracao), fps: props.spec.fps ?? 30, width: w, height: h};
};

const Bloco: React.FC<{ev: Evento; inicio: number; dur: number; entrada: EntradaVideo; w: number; h: number; total: number}> = ({
  ev,
  inicio,
  dur,
  entrada,
  w,
  h,
  total,
}) => {
  const f = useCurrentFrame();
  const B = BLOCOS[ev.bloco!];
  if (!B) throw new Error(`bloco não existe no catálogo: ${ev.bloco}`);
  const q = relogio(entrada.palavras, total);
  return <B f={f} dur={dur} w={w} h={h} inicio={inicio} t={(a) => q(a) - inicio} palavras={entrada.palavras} p={ev.props ?? {}} />;
};

export const Video: React.FC<EntradaVideo> = (entrada) => {
  useFonts();
  const {spec, variante, palavras} = entrada;
  const v = spec.variantes.find((x) => x.id === variante)!;
  const {w, h} = FORMATOS[v.formato];
  const total = relogio(palavras, 0)(spec.duracao);
  const q = relogio(palavras, total);
  return (
    <AbsoluteFill style={{background: cor(v.fundo), overflow: 'hidden'}}>
      {v.eventos.map((ev, i) => {
        const de = Math.max(0, q(ev.de));
        const ate = ev.ate ? q(ev.ate) : total;
        return (
          <React.Fragment key={i}>
            {ev.bloco && (
              <Sequence from={de} durationInFrames={Math.max(1, ate - de)} layout="none">
                <Bloco ev={ev} inicio={de} dur={ate - de} entrada={entrada} w={w} h={h} total={total} />
              </Sequence>
            )}
            {ev.som && (
              <Sequence from={de} layout="none">
                <Audio src={staticFile(`audio/${ev.som}.wav`)} volume={ev.vol ?? 0.5} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
      <Audio src={staticFile(spec.audio.voz)} />
      {spec.audio.cama && <Audio src={staticFile(spec.audio.cama)} volume={spec.audio.camaVol ?? 0.5} />}
    </AbsoluteFill>
  );
};
