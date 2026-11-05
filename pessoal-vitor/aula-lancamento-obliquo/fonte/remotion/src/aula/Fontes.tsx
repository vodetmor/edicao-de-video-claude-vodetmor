import React from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource-variable/inter/opsz.css';
import 'katex/dist/katex.min.css';

// segura o render até Inter e as fontes do KaTeX estarem prontas
export const useFontes = () => {
  const [h] = React.useState(() => delayRender('fontes'));
  React.useEffect(() => {
    const specs = ["500 40px 'Inter Variable'", "600 40px 'Inter Variable'", "700 40px 'Inter Variable'", '40px KaTeX_Main', 'italic 40px KaTeX_Math', '40px KaTeX_Size1'];
    Promise.all(specs.map((s) => document.fonts.load(s, 'Aaθvx0123=,°')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h))
      .catch(() => continueRender(h));
  }, [h]);
};
