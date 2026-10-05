// Visual system (locked; see /mnt/project-files/anuncio-vslplay/BRIEF.md "VISUAL SYSTEM")
export const C = {
  black: '#0B0B0C',
  paper: '#F2F1EE',
  ink: '#111113',
  white: '#FFFFFF',
  gray: '#8A8A8E',
  line: '#D9D7D2',
  // flat colors sampled from the real logo ribbons
  coral: '#EC5F78',
  cyan: '#3DCBEE',
  violet: '#6A10D8',
  sun: '#FFD84D',
  player: '#000000',
};

export const DISPLAY = "'Archivo Variable', 'Archivo', sans-serif";
export const TEXT = "'Inter Variable', 'Inter', sans-serif";

export const W = 1920;
export const H = 1080;

// Player (paper stage), right aligned with a 96 px margin
export const PL = {x: 672, y: 216, w: 1152, h: 648};
// Real player CSS is written in rem (16 px); we render it at 22 px per rem
export const REM = 22;
export const COL = {x: 96, w: 504}; // left text column
