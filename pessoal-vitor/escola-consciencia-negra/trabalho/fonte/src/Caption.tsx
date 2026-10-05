import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, type Cue} from './captions';
import {C, E, clamp, f} from './lib';
import {SANS} from './kit';

// Legenda contínua: Inter 500, 50 px, linha de base da última linha a 87% da altura, sem caixa.
export const Caption: React.FC<{cues?: Cue[]}> = ({cues = CUES}) => {
  const frame = useCurrentFrame();
  const CUESX = cues;
  const cue = CUESX.find((c) => frame >= f(c.s) && frame < f(c.e));
  if (!cue) return null;
  const a = f(cue.s), b = f(cue.e);
  const next = CUESX.find((c) => f(c.s) >= b && f(c.s) - b <= 2);
  const inP = E.produtiva(clamp((frame - a) / 6));
  const outP = next ? 0 : clamp((frame - (b - 4)) / 4);
  const lines = cue.t.split('\n');
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 1080 - 940 - 14, textAlign: 'center',
          fontFamily: SANS, fontWeight: 500, fontSize: 50, lineHeight: '60px', letterSpacing: '-0.01em',
          color: C.papel, opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 6}px)`,
          textShadow: '0 2px 6px rgba(0,0,0,.55), 0 0 1px rgba(0,0,0,.7)',
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
