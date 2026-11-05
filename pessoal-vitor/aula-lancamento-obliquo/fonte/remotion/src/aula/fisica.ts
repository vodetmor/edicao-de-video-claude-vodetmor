// Física do lançamento (valores do exemplo do vídeo). Tudo em SI.
// θ com sen = 0,8 e cos = 0,6 (θ ≈ 53,13°): números redondos para conferir na tela.
export const V0 = 20, G = 10, SEN = 0.8, COS = 0.6;
export const TH = Math.atan2(SEN, COS);
export const VX = V0 * COS;         // 12 m/s
export const VY = V0 * SEN;         // 16 m/s
export const TS = VY / G;           // 1,6 s
export const T = 2 * TS;            // 3,2 s
export const H = (VY * VY) / (2 * G); // 12,8 m
export const A = (V0 * V0 * 2 * SEN * COS) / G; // 38,4 m
export const pos = (t: number, v0 = V0, th = TH) => ({x: v0 * Math.cos(th) * t, y: v0 * Math.sin(th) * t - 0.5 * G * t * t});
export const vel = (t: number, v0 = V0, th = TH) => ({x: v0 * Math.cos(th), y: v0 * Math.sin(th) - G * t});
export const voo = (v0 = V0, th = TH) => (2 * v0 * Math.sin(th)) / G;
export const alcance = (v0 = V0, th = TH) => (v0 * v0 * Math.sin(2 * th)) / G;
export const alturaMax = (v0 = V0, th = TH) => (v0 * Math.sin(th)) ** 2 / (2 * G);
export const fmt = (x: number, casas = 1) => x.toFixed(casas).replace('.', ',');
