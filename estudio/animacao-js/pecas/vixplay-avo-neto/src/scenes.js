// =====================================================================
//  VIXPLAY TV · "A vovó e o neto" — animação 2D em papel recortado (identidade VixPlay: verdes + neon).
//  6 cenas de corte seco, uma por batida de história: a TV não funciona, o neto chega, três passos,
//  o tutorial do aparelho + suporte, a novela, preço e botão. Logo real só no final.
// =====================================================================
const T0 = TIMELINE.cues;
function wall(c, p) { cut(rect(-30, -30, W + 60, H + 60, 0), c, { key: 'wall' + c, shadow: false, tear: 0, pat: p, grain: 0.8, shade: false }); }
function floorW(key, c = PAL.woodD) { cut(rect(-30, 1230, W + 60, 900, 0), c, { key, tear: 0, sy: -6, pat: pat.grainWood('rgba(0,0,0,0.2)') }); }
function tvSet(x, y, w, h, key, inner) {
  cut(rect(x - 12, y - 12, w + 24, h + 24, 20), '#0b140d', { key: key + 'f' });
  cut(rect(x, y, w, h, 10), '#0d4a22', { key: key + 's', shadow: false });
  if (inner) inner(x, y, w, h);
  cut(rect(x + w / 2 - 70, y + h + 12, 140, 28, 6), '#0b140d', { key: key + 'b' });
}
function sofa(x, y, w, key, col = PAL.teal) {
  cut(rect(x, y - 190, w, 250, 60), col, { key: key + 'bk', pat: pat.stripes('rgba(255,255,255,0.10)', 16, 44) });
  cut(rect(x - 40, y - 20, 90, 200, 36), PAL.woodL, { key: key + 'al' });
  cut(rect(x + w - 50, y - 20, 90, 200, 36), PAL.woodL, { key: key + 'ar' });
}
function sofaFront(x, y, w, key, col = PAL.teal) { cut(rect(x, y + 20, w, 170, 40), col, { key: key + 'fr', pat: pat.stripes('rgba(255,255,255,0.14)', 16, 44) }); }
function phone(x, y, s, key, lines = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(rect(-60, -110, 120, 220, 18), '#0b140d', { key: key + 'p' });
  cut(rect(-50, -94, 100, 186, 8), '#f2f7ee', { key: key + 's', shadow: false });
  if (lines) for (let i = 0; i < 4; i++) cut(rect(-40, -80 + i * 38, 80 - (i % 2) * 24, 22, 6), i === 0 ? PAL.orange : '#cfe9d6', { key: key + 'l' + i, shadow: false });
  ctx.restore();
}
function bubble(x, y, w, h, str, size, o = {}) {
  const k = o.s ?? 1; if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  cut(rect(-w / 2, -h / 2, w, h, h / 2.4), o.fill ?? PAL.paper, { key: 'bub' + str });
  cut([[-30, h / 2 - 4], [-6, h / 2 - 4], [-50, h / 2 + 44]], o.fill ?? PAL.paper, { key: 'bubt' + str, shadow: false });
  handText(str, -handW(str, size) / 2, size * 0.34, size, o.color ?? PAL.ink, { key: 'bubx' + str });
  ctx.restore();
}
const AVO = { skin: PAL.skin2, hair: '#c9cfc9', shirt: PAL.teal, glasses: true };
const NETO = { skin: PAL.skin3, hair: '#1b1410', shirt: PAL.orange };


// ================= PLANOS CURTOS (corte a cada 1,5-2 s), palavra por palavra, 2D =================
const WALLS = [[PAL.navy, 'd'], [PAL.teal, 's'], [PAL.mint, 'd'], [PAL.night, 'd'], [PAL.woodD, 's']];
function wallN(n) { const [c, k] = WALLS[n % WALLS.length]; wall(c, k === 'd' ? pat.dots('rgba(255,255,255,0.10)', 4, 64) : pat.stripes('rgba(255,255,255,0.09)', 28, 76)); }
function confete(n, t0) {
  const R = RNG('cf' + n);
  for (let i = 0; i < 9; i++) {
    const x = R.r(60, 1020), sp = R.r(60, 160), ph = R.r(0, 6), sz = R.r(16, 40);
    const y = 1900 - (((TT - t0) * sp + i * 210) % 2000);
    ctx.save(); ctx.translate(x + Math.sin(TT * 2 + ph) * 30, y); ctx.rotate(TT * 1.4 + ph);
    cut(rect(-sz / 2, -sz / 2, sz, sz * 0.7, 3), [PAL.orange, PAL.yellow, PAL.paper, PAL.mint][i % 4], { key: 'cf' + n + i, shadow: false, grain: false, shade: false });
    ctx.restore();
  }
}
function bigWord(str, cx, cy, size, bg, fg, rot, k) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `700 ${size}px "Segoe Print", "Ink Free", cursive`; const w = ctx.measureText(str).width;
  cut(rect(-w / 2 - 34, -size * 0.82, w + 68, size * 1.36, 16), bg, { key: 'bw' + str, tear: 1.5 });
  ctx.font = `700 ${size}px "Segoe Print", "Ink Free", cursive`; ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.fillText(str, -w / 2, size * 0.26);
  ctx.restore();
}
function palavras(n, t0, itens, o = {}) {
  wallN(n); confete(n, t0);
  const cores = [[PAL.paper, PAL.ink], [PAL.orange, PAL.ink], [PAL.yellow, PAL.ink], [PAL.ink, PAL.paper]];
  const gap = o.gap ?? 230, y0 = (o.y ?? 760) - (itens.length - 1) * gap / 2;
  itens.forEach((w, i) => {
    const k = popS(t0 + 0.05 + i * 0.25); const [bg, fg] = cores[(i + n) % cores.length];
    bigWord(w, 540 + (i % 2 ? 24 : -24), y0 + i * gap + Math.sin(TT * 3 + i) * 6, o.size ?? 150, bg, fg, (i % 2 ? 1 : -1) * 0.035, k);
  });
}
function passo(n, t0, a, b, wall0, rot) {
  wallN(wall0); const k = popS(t0); ctx.save(); ctx.translate(540, 760); ctx.scale(k, k); ctx.rotate(rot);
  cut(ellipsePts(0, -220, 150, 150, 0, 40), PAL.orange, { key: 'n' + n, crayon: PAL.orangeD }); handText(String(n), -40, -170, 190, PAL.ink, { key: 'nt' + n });
  bigWord(a, 0, 120, 150, PAL.paper, PAL.ink, 0.02, 1); bigWord(b, 0, 360, 150, PAL.yellow, PAL.ink, -0.02, popS(t0 + 0.4)); ctx.restore(); confete(n + 4, t0);
}
const SHOTS_FN = [
  () => { palavras(0, 0.0, ['A VOVÓ'], { size: 190 }); const k = popS(0.4); if (k > 0.01) { ctx.save(); ctx.translate(540, 1500); ctx.scale(k, k); person(0, Math.sin(TT * 5) * 8, 1.0, { ...AVO, mood: 'happy', key: 'a0' }); ctx.restore(); } },
  () => { wallN(1); tvSet(520, 470, 440, 300, 'tv1', (x, y, w, h) => { const R = RNG('nz' + (B % 6)); for (let i = 0; i < 24; i++) cut(rect(x + R.r(0, w - 60), y + R.r(0, h - 20), R.r(30, 120), 12, 2), 'rgba(184,255,31,' + R.r(0.2, 0.5) + ')', { key: 'nz' + i + (B % 6), shadow: false, grain: false, shade: false }); handText('?', x + w / 2 - 36, y + h / 2 + 50, 150, PAL.paper, { key: 'q1' }); });
    floorW('f1'); sofa(150, 1220, 640, 'sf1'); person(430, 1010 + Math.sin(TT * 4) * 7, 1.25, { ...AVO, mood: TT < 3.0 ? 'sad' : 'wow', key: 'avo1' }); sofaFront(150, 1220, 640, 'sf1');
    hand(640, 1190 - 20 * Math.sin(TT * 6), 0.8, -0.35, PAL.skin2, PAL.teal, { key: 'h1' }); bubble(330, 640 + Math.sin(TT * 2) * 8, 460, 120, 'Como é que liga?', 52, { s: popS(2.3) }); },
  () => palavras(2, 4.0, ['ATÉ QUE', 'O NETO', 'CHEGA'], { size: 150, gap: 250 }),
  () => { wallN(3); floorW('f3'); sofa(120, 1220, 760, 'sf3', PAL.navy); person(340, 1010 + Math.sin(TT * 4) * 6, 1.25, { ...AVO, mood: 'smile', key: 'avo3' }); const e = popS(5.5); ctx.save(); ctx.translate((1 - e) * 600, 0); person(740, 1030 + Math.sin(TT * 6) * 8, 1.15, { ...NETO, mood: 'happy', key: 'neto3' }); hand(640, 1160, 0.75, -1.1, PAL.skin3, PAL.orange, { key: 'h3' }); phone(690, 1010, 1.0, 'ph3'); ctx.restore(); sofaFront(120, 1220, 760, 'sf3', PAL.navy); bubble(740, 640, 520, 120, 'Eu te mostro, vó!', 52, { s: popS(6.5) }); },
  () => { palavras(4, 7.5, ['TUTORIAL'], { size: 170, y: 600 }); const k = popS(7.9); ctx.save(); ctx.translate(540, 1250); ctx.rotate(Math.sin(TT * 3) * 0.08); ctx.scale(2.2 * k, 2.2 * k); phone(0, 0, 1.0, 'ph4'); ctx.restore(); },
  () => passo(1, 9.0, 'ESCOLHE', 'O PLANO', 2, -0.03),
  () => passo(2, 10.5, 'PAGA', 'POR PIX', 1, 0.03),
  () => { passo(3, 12.0, 'RECEBE', 'O ACESSO', 3, -0.02); const w = popS(12.8); ctx.save(); ctx.translate(880, 1380 - Math.abs(Math.sin(TT * 4)) * 30); ctx.scale(w, w); cut(rect(-90, -60, 180, 120, 36), PAL.paper, { key: 'wa7' }); cut([[-40, 56], [-10, 56], [-60, 100]], PAL.paper, { key: 'wat7', shadow: false }); cut(ellipsePts(0, 0, 26, 26, 0, 24), PAL.green, { key: 'waf7', shadow: false }); ctx.restore(); },
  () => palavras(0, 13.5, ['PARA CADA', 'APARELHO'], { size: 150, gap: 250 }),
  () => { wallN(3); const t0 = 15.0; const k1 = popS(t0 + 0.05), k2 = popS(t0 + 0.3), k3 = popS(t0 + 0.55);
    ctx.save(); ctx.translate(250, 700 - Math.abs(Math.sin(TT * 5)) * 24); ctx.scale(k1, k1); tvSet(-190, -130, 380, 250, 'tv9', (x, y, w, h) => { [[x + 30, y + 40, 120], [x + 170, y + 40, 100], [x + 30, y + 130, 140], [x + 190, y + 130, 120]].forEach(([a, b, c], i) => cut(rect(a, b, c, 70, 8), [PAL.orange, PAL.yellow, PAL.pink, PAL.teal][i], { key: 'tl9' + i, shadow: false })); }); ctx.restore();
    ctx.save(); ctx.translate(780, 900 - Math.abs(Math.sin(TT * 5 + 1)) * 24); ctx.scale(k2, k2); cut(rect(-150, -60, 300, 120, 18), '#0b140d', { key: 'box9' }); cut(rect(-130, -32, 80, 14, 4), PAL.orange, { key: 'box9l', shadow: false }); ctx.restore();
    ctx.save(); ctx.translate(430, 1280 - Math.abs(Math.sin(TT * 5 + 2)) * 24); ctx.scale(k3 * 1.6, k3 * 1.6); phone(0, 0, 1.0, 'ph9'); ctx.restore();
    bigWord('TV · BOX · CELULAR', 540, 1560, 80, PAL.paper, PAL.ink, -0.01, popS(t0 + 0.9)); confete(9, t0); },
  () => palavras(1, 17.0, ['DÚVIDA?'], { size: 200 }),
  () => { wallN(0); confete(11, 18.5); const t0 = 18.5; bubble(540, 520, 700, 150, 'Deu dúvida?', 72, { s: popS(t0 + 0.05), fill: PAL.orange }); bubble(540, 780, 860, 150, 'Suporte no WhatsApp', 66, { s: popS(t0 + 0.6) }); const k = popS(t0 + 1.1); ctx.save(); ctx.translate(540, 1250); ctx.scale(k, k); person(0, Math.sin(TT * 5) * 8, 1.1, { ...NETO, mood: 'happy', key: 'n11' }); ctx.restore(); },
  () => palavras(2, 20.5, ['NOVELA!'], { size: 200 }),
  () => { wallN(2); tvSet(110, 380, 860, 520, 'tv13', (x, y, w, h) => { [['Canais', PAL.teal], ['Filmes', PAL.orange], ['Séries', PAL.yellow], ['Novelas', PAL.pink]].forEach(([t, c], i) => { const k = popS(22.0 + i * 0.25); if (k <= 0.01) return; ctx.save(); ctx.translate(x + 40 + (i % 2) * 400 + 180, y + 40 + Math.floor(i / 2) * 220 + 90); ctx.scale(k, k); cut(rect(-180, -90, 360, 180, 18), c, { key: 'tile13' + i, shadow: false }); handText(t, -handW(t, 66) / 2, 24, 66, PAL.ink, { key: 'tlt13' + i }); ctx.restore(); }); });
    floorW('f13'); sofa(170, 1330, 680, 'sf13'); person(400, 1120 + Math.sin(TT * 5) * 9, 1.15, { ...AVO, mood: 'happy', key: 'a13' }); person(640, 1140 + Math.sin(TT * 5 + 1.6) * 9, 1.0, { ...NETO, mood: 'happy', key: 'n13' }); sofaFront(170, 1330, 680, 'sf13'); for (let i = 0; i < 6; i++) sparkle(150 + i * 160 + Math.sin(TT * 3 + i) * 10, 1000 - ((B + i * 3) % 6) * 14, 14 + (i % 2) * 6, PAL.yellow); },
  () => { palavras(3, 24.0, ['R$ 35'], { size: 260, y: 700 }); bigWord('no primeiro mês', 540, 1000, 80, PAL.paper, PAL.ink, -0.02, popS(24.6)); },
  () => { wallN(4); confete(15, 25.5); [['PIX', 460], ['SEM CARTÃO', 760], ['SEM FIDELIDADE', 1060]].forEach(([t, y], i) => bigWord(t, 540, y, 110, [PAL.paper, PAL.yellow, PAL.orange][i], PAL.ink, (i % 2 ? 1 : -1) * 0.03, popS(25.55 + i * 0.3))); },
  () => { wall(PAL.night, pat.dots('rgba(153,226,0,0.12)', 4, 64)); confete(16, 27.0); const k2 = popS(27.6); ctx.save(); ctx.translate(540, 1000 + Math.sin(TT * 4) * 8); ctx.scale(k2, k2); cut(rect(-340, -90, 680, 180, 90), PAL.orange, { key: 'btn', crayon: PAL.orangeD }); ctx.font = '700 88px "Segoe Print", "Ink Free", cursive'; ctx.fillStyle = PAL.ink; ctx.textAlign = 'left'; ctx.fillText('SAIBA MAIS', -ctx.measureText('SAIBA MAIS').width / 2, 30); ctx.restore(); bigWord('teste grátis de 4 horas', 540, 1260, 62, PAL.paper, PAL.ink, 0.01, popS(28.2)); },
];
function shot(i) { SHOTS_FN[i](); }
