// =====================================================================
//  MUNDOS, CÂMERAS, PONTES — "Um vídeo é uma função do tempo" (lido por kit/morph.js)
//  Pontes: a lente da câmera vira o mostrador do cronômetro; o 4º cartão vira a folha de contato.
//  O corte seco (15,5 s) é o único: a virada, na pancada mais alta, depois do silêncio.
// =====================================================================
const ERA_BG = ['#f2ead8', '#f2ead8', '#efe6d0', '#f2ead8'];
function pieceCam(era, t) {
  if (era === 0) return push(t, 3.55, 4.35, { z: 1.3, p: [LENS.x, LENS.y], to: [540, 760] });                         // chega na lente
  if (era === 1) return push(t, 8.6, 9.35, { z: 1.3, p: [CARD.xs[3], CARD.y], to: [600, 900] });                        // chega no 4º cartão
  return null;
}
const BRIDGES = [
  { tc: 4.5, A: () => ({ P: loopPts(LENS.x, LENS.y, LENS.r, LENS.r, 0, 0, 64), c: SK.sheet }), B: () => ({ P: watchFace(), c: SK.sheet }) },
  { tc: 9.5, A: () => ({ P: sketchBox(CARD.xs[3] - CARD.w / 2, CARD.y - CARD.h / 2, CARD.w, CARD.h, 10, 0), c: SK.sheet }), B: () => ({ P: sheetOutline(), c: SK.sheet }) },
];
