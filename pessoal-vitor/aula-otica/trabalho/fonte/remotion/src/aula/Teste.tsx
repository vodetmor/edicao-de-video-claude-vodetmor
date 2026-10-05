import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Shader} from '../glsl/Shader';
import {PRISMA} from './cenaPrisma';
import {FIBRA} from './cenaFibra';
export const Teste: React.FC<{yaw: number; el: number; dist: number; foc: number; alvo: number[]; frente: number; aa: number; fibra?: boolean; escala?: number}> = (p) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Shader frag={p.fibra ? FIBRA : PRISMA} u={{yaw: p.yaw, el: p.el, dist: p.dist, foc: p.foc, alvo: p.alvo, frente: p.frente, cauda: -1, luz: 1, amb: 1, tela: 1, expo: 1.4, aa: p.aa}} escala={p.escala ?? 1} />
  </AbsoluteFill>
);
