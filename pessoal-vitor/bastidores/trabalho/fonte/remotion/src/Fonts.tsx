import React from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/source-serif-4/600.css';
export const DISPLAY = "'Archivo Variable', sans-serif";
export const TEXT = "'Inter Variable', sans-serif";
export const MONO = "'JetBrains Mono', monospace";
export const SERIF = "'Source Serif 4', serif";
export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const specs = ["900 100px 'Archivo Variable'", "800 100px 'Archivo Variable'", "400 40px 'Inter Variable'", "500 40px 'Inter Variable'",
      "600 40px 'Inter Variable'", "700 40px 'Inter Variable'", "400 30px 'JetBrains Mono'", "700 30px 'JetBrains Mono'", "600 60px 'Source Serif 4'"];
    Promise.all(specs.map((s) => document.fonts.load(s, 'AÇÃÊÍÕÚ açãêíõú 0123456789'))).then(() => document.fonts.ready)
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
