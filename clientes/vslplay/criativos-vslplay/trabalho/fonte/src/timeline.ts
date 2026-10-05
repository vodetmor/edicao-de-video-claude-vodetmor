// Single source of truth for timing. 30 fps, one beat = 14 frames (128.57 BPM, measured on ref-brain).
export const FPS = 30;
export const BEAT = 14;
export const DURATION = 1440;

export const T = {
  // 1 · the mark builds itself (black)
  dropStart: 4,
  impacts: [14, 28, 42, 56],
  launch: 58,
  lineRetract: 56,
  triDraw: 58,
  snap: 70,
  ribbons: {cool: 72, warm: 76, purple: 80},
  press: 98,
  dotDrop: 98,
  dotLand: 112,
  pullback: 112,
  pullbackDur: 40,
  vsl: 128,
  play: 136,
  tagline: 172,
  // 2 · deconstruction
  decon: 224,
  split: 236,
  // 3 · chapter 1, Atenção (coral)
  cardA: 252,
  collapseA: 280,
  smart: 294,
  smartClick: 336,
  thumbs: 364,
  thumbsClick: 392,
  cont: 434,
  contClick: 462,
  wipeB: 490,
  // 4 · chapter 2, Retenção (cyan)
  cardB: 504,
  barra: 532,
  chart: 588, // the fictitious bar rises into the chart's time axis
  chartKnee: 630,
  chartKpi: 654,
  wipeC: 714,
  // 5 · chapter 3, Conversão (violet)
  cardC: 728,
  delay: 756,
  delayHit: 798,
  controles: 826,
  aparencia: 896,
  stretch: 930,
  // 6 · price (paper)
  price: 966,
  priceStamp: 1013, // the pill draws; it fills on the beat at +9
  // 7 · more (black)
  more: 1078,
  // 8 · integrations (paper)
  integr: 1162,
  integrGrid: 1204, // YouTube + MP4 first, then the 14 integrations
  // 9 · the mark rebuilds (black)
  final: 1260,
  anticip: 1304,
  release: 1316,
  rebuildLand: 1344,
  wordmark2: 1354,
  cta: 1376,
  end: 1440,
};
