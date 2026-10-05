// Fórmula pequena em KaTeX (rótulos no palco). As derivações grandes vêm do Manim.
import React, {useMemo} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const Tex: React.FC<{t: string; size?: number; color?: string; style?: React.CSSProperties}> = ({t, size = 36, color = '#1D1D1F', style}) => {
  const html = useMemo(() => katex.renderToString(t, {throwOnError: false, displayMode: false}), [t]);
  return <span style={{fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', ...style}} dangerouslySetInnerHTML={{__html: html}} />;
};
