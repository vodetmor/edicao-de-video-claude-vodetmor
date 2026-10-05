import React from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter/opsz.css';

// Block rendering until both variable fonts (and the weights/widths we use) are ready.
export const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const specs = [
      "900 100px 'Archivo Variable'",
      "800 100px 'Archivo Variable'",
      "400 40px 'Inter Variable'",
      "500 40px 'Inter Variable'",
      "600 40px 'Inter Variable'",
      "700 40px 'Inter Variable'",
    ];
    Promise.all(specs.map((s) => document.fonts.load(s, 'AÇÃÊÍÕÚ açãêíõú 0123456789')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};
