import React from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/geist/index.css';
import '@fontsource/instrument-serif/400-italic.css';

// Segura o render até as fontes (e os pesos usados) estarem prontas: nenhum quadro sai com fonte de sistema.
export const useFontes = () => {
  const [h] = React.useState(() => delayRender('fontes'));
  React.useEffect(() => {
    const pesos = ["500 40px 'Inter Variable'", "600 40px 'Inter Variable'", "700 40px 'Inter Variable'", "800 40px 'Inter Variable'",
      "700 40px 'Archivo Variable'", "800 40px 'Archivo Variable'", "900 40px 'Archivo Variable'", "italic 400 40px 'Instrument Serif'", "800 40px 'Bricolage Grotesque Variable'", "700 40px 'Bricolage Grotesque Variable'",
      "500 40px 'Geist Variable'", "600 40px 'Geist Variable'", "700 40px 'Geist Variable'", "400 40px 'Instrument Serif'"];
    Promise.all(pesos.map((s) => document.fonts.load(s, 'AÇÃÊÍÕÚ açãêíõú 0123456789')))
      .then(() => document.fonts.ready)
      .finally(() => continueRender(h));
  }, [h]);
};
