// Batida: linhas de título (Archivo 900) que sobem da máscara, cada linha presa à sua palavra.
import React from 'react';
import {C} from '../../theme';
import {RiseText} from '../../kit';
import type {BlocoProps} from '../tipos';

type P = {linhas: string[]; em?: string[]; cores?: string[]; tam?: number; y?: number; alinhar?: 'center' | 'left'; sai?: string; cor?: string};

export const Batida: React.FC<BlocoProps<P>> = ({f, dur, h, t, p}) => {
  const tam = p.tam ?? 150;
  const sai = p.sai ? t(p.sai) : dur - 9;
  const center = (p.alinhar ?? 'center') === 'center';
  return (
    <div style={{position: 'absolute', left: center ? 0 : 72, right: center ? 0 : undefined, top: (p.y ?? 0.3) * h, transform: 'translateY(-50%)'}}>
      {p.linhas.map((ln, i) => {
        const start = p.em?.[i] ? t(p.em[i]) - 2 : i * 5;
        return (
          <RiseText
            key={i}
            f={f}
            text={ln}
            size={tam}
            color={(C as any)[p.cores?.[i] ?? ''] ?? p.cores?.[i] ?? (C as any)[p.cor ?? ''] ?? C.ink}
            stretch={66}
            opts={{start, stagger: 1.2, exitAt: sai + i * 2, exitStagger: 0.6}}
            style={{justifyContent: center ? 'center' : 'flex-start', marginTop: i ? -tam * 0.02 : 0}}
          />
        );
      })}
    </div>
  );
};
