import React from 'react';
import {ICONES} from './icones';

// Ícone Phosphor por nome ("check", "rocket"; "check:linha" = traço). Nome desconhecido = aviso visível, nunca some calado.
export const Icone: React.FC<{nome: string; tam: number; cor: string; style?: React.CSSProperties}> = ({nome, tam, cor, style}) => {
  const svg = ICONES[nome] ?? ICONES[nome.replace(/-fill$/, '')];
  if (!svg) {
    return <div style={{width: tam, height: tam, border: `2px dashed ${cor}`, fontSize: tam * 0.2, color: cor, ...style}}>?{nome}</div>;
  }
  return (
    <svg viewBox="0 0 256 256" width={tam} height={tam} fill={cor} style={{display: 'block', flex: 'none', ...style}}
      dangerouslySetInnerHTML={{__html: svg}} />
  );
};
