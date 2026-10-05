// Camada das derivações do Manim: sequências PNG com alfa, cada uma no seu quadro de início.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import M from '../data/manim.json';

export const CamadaManim: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Object.entries(M as Record<string, {ini: number; n: number}>).map(([nome, {ini, n}]) => {
        const k = f - ini;
        if (k < 0 || k >= n) return null;
        return <Img key={nome} src={staticFile(`manim/${nome}/${String(k).padStart(4, '0')}.png`)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />;
      })}
    </>
  );
};
