// =====================================================================
//  CENAS — "Um vídeo é uma função do tempo". Mundo 1080x1920 (a página); tempo TT em 2s; ev / popS para eventos.
//  Uma constante: a bolinha terracota (o herói) aparece em todo mundo, desenhada quadro a quadro.
// =====================================================================
const LENS = { x: 560, y: 730, r: 95 };
const WATCH = { x: 540, y: 650, r: 160 };
const CARD = { w: 200, h: 230, y: 1112, xs: [170, 390, 610, 830] };
const SHEET = { x: 130, y: 390, s: 820, cell: 240, gap: 25 };
const HOME = { x: 290, y: 1052, r: 100 };   // onde o herói está no primeiro e no último quadro
const fmtT = (v) => v.toFixed(2).replace('.', ',');

// ---- ajudantes ------------------------------------------------------
// pose de um pulo: ph 0..1 (agacha, sobe, topo, desce, aterrissa)
function hopPose(ph) {
  const up = Math.sin(Math.PI * clamp(ph)), sq = Math.max(0, 1 - Math.min(ph, 1 - ph) / 0.14);
  return { up, sx: 1 + 0.14 * sq - 0.06 * up, sy: 1 - 0.14 * sq + 0.1 * up, arms: [lerp(-0.7, 1.25, up), lerp(-0.7, 1.25, up)] };
}
// um quadro do filme: folha branca, chão, o herói numa pose do pulo. o: key, part, num, wrong, mood, hide
function frameCard(cx, cy, w, h, ph, o = {}) {
  const key = o.key ?? 'fc' + cx + cy, part = o.part ?? 1;
  if (part <= 0) return;
  const P = sketchBox(cx - w / 2, cy - h / 2, w, h, 10, 0);
  gfill(P, SK.sheet, { off: [4, 4], key: key + 'f', a: clamp(part * 2) });
  gline(sketchBox(cx - w / 2, cy - h / 2, w, h, 10), { w: 4, key: key + 'o', part });
  if (o.num != null && part > 0.5) handLetter(String(o.num), cx - w / 2 + 16, cy - h / 2 + 34, 30, { face: 'marker', col: SK.graph, align: 'left', key: key + 'n' });
  if (part < 0.6 || o.hide) return;
  const gy = cy + h * 0.33;
  gpencil([[cx - w * 0.4, gy], [cx + w * 0.4, gy + 2]], { key: key + 'g', w: 2.4, a: 0.7, passes: 1 });
  const r = w * 0.13, p = hopPose(ph), hx = cx + lerp(-0.2, 0.2, ph) * w, hy = gy - r * 1.42 - p.up * h * 0.3;
  if (o.wrong) doodleHero(hx, gy - r * 1.6, r, { key: key + 'h', legs: true, mood: 'puzzled', rot: Math.PI, arms: [-0.8, -0.8] });
  else doodleHero(hx, hy, r, { key: key + 'h', legs: true, mood: o.mood ?? (p.up > 0.5 ? 'wow' : 'happy'), look: [0.8, -0.3], sx: p.sx, sy: p.sy, arms: p.arms });
}
// vida no fundo: estrelas da margem que piscam em 2s, um aviãozinho de papel em oito
function marginLife(key, o = {}) {
  if (o.stars !== false) [[96, 560, 0], [150, 760, 1], [84, 930, 2]].forEach(([x, y, i]) => doodleStar(x, y, 22 + 7 * ((B + i) % 3 === 0), key + 'st' + i, { w: 3.2 }));
  if (o.plane !== false) {
    const at = (p) => [860 + 110 * Math.sin(TAU * p), 1560 + 50 * Math.sin(2 * TAU * p)];
    const p = TT / 3.5, trail = [];
    for (let i = 0; i <= 24; i++) trail.push(at(p - 0.35 + 0.35 * i / 24));
    ctx.save(); ctx.setLineDash([10, 12]); gpencil(trail, { key: key + 'tr', w: 2.2, a: 0.55, passes: 1, amp: 1 }); ctx.restore();
    const [x, y] = at(p), [x2, y2] = at(p + 0.01);
    paperPlane(x, y, Math.atan2(y2 - y, x2 - x), 1.15, key + 'pl');
  }
}
function ant(x, y, s, key) {
  for (let i = 0; i < 3; i++) { ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.ellipse(x + (i - 1) * 11 * s, y - 6 * s, (i === 1 ? 5 : 6.5) * s, 5 * s, 0, 0, TAU); ctx.fill(); }
  const k = B % 2 ? 1 : -1;
  for (let i = 0; i < 3; i++) gline([[x + (i - 1) * 8 * s, y - 4 * s], [x + (i - 1) * 8 * s + k * (i % 2 ? 5 : -5) * s, y + 3 * s]], { w: 1.8 * s, key: key + i, amp: 0.3, second: false, step: 4 });
}
function ground(key) { gpencil([[70, 1205], [400, 1199], [720, 1207], [1010, 1201]], { key, w: 3, a: 0.75 }); }

// ---- mundo 0: sem câmera ------------------------------------------
function cameraParts() {
  const body = sketchBox(330, 600, 440, 270, 28, 0);
  const reelA = loopPts(440, 520, 78, 78, 0.05), reelB = loopPts(640, 520, 78, 78, 0.05);
  const lens = loopPts(LENS.x, LENS.y, LENS.r, LENS.r, 0.06), lensIn = loopPts(LENS.x, LENS.y, 52, 52, 0.08);
  const vf = sketchBox(250, 640, 80, 70, 10, 0);
  return { body, reelA, reelB, lens, lensIn, vf };
}
function sceneCamera() {
  const cu = TIMELINE.cues;
  sketchPage({ grid: 'dots' });
  ground('g0');
  ant(600 + 90 * TT, 1203, 1.4, 'ant0');
  marginLife('m0');
  const C = cameraParts(), all = [C.reelA, C.reelB, C.body, C.vf, C.lens, C.lensIn], n = all.length;
  const pc = ev(cu.camDraw, cu.camInk - cu.camDraw), pi = ev(cu.camInk, 0.4);
  // lápis primeiro (construção), depois tinta, depois sombra hachurada
  all.forEach((P, i) => gpencil(P, { closed: true, key: 'cp' + i, w: 2.6, a: 0.65, part: seg(pc, i / n, (i + 1) / n) }));
  if (pi > 0) {
    gfill(C.body, SK.sheet, { off: [5, 4], key: 'cbf', a: clamp(pi * 3) });
    gfill(C.lens, SK.sheet, { off: [4, 3], key: 'clf', a: clamp(pi * 3) });
    if (TT >= cu.camFill) { ctx.save(); gclip(C.body); ghatch(330, 600, 770, 870, { ang: -0.8, gap: 11, col: SK.graph, w: 2, a: 0.4 * ev(cu.camFill, 0.3), key: 'cbh' }); ctx.restore(); }
    all.forEach((P, i) => gline(P, { closed: true, key: 'ci' + i, w: i === 5 ? 4 : 6, part: seg(pi, i / n * 0.6, i / n * 0.6 + 0.4) }));
    for (const [x, y] of [[440, 520], [640, 520]]) for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.4; gline([[x, y], [x + Math.cos(a) * 46, y + Math.sin(a) * 46]], { w: 3.5, key: 'sp' + x + k, second: false, part: pi }); }
  }
  // o X vermelho: sem filmar nada
  const x1 = ev(cu.cross, 0.12), x2 = ev(cu.cross + 0.12, 0.12);
  gline([[290, 450], [540, 660], [810, 900]], { w: 16, col: SK.red, key: 'xa', part: x1, amp: 2, second: false, step: 10 });
  gline([[810, 450], [560, 680], [290, 905]], { w: 16, col: SK.red, key: 'xb', part: x2, amp: 2, second: false, step: 10 });
  // o lápis que desenha
  if (TT >= cu.camDraw && TT < cu.cross + 0.4) {
    let tip;
    if (TT < cu.camInk) { const k = Math.min(n - 1, Math.floor(pc * n)); tip = writeEnd(closeP(all[k]), clamp(pc * n - k)); }
    else if (TT < cu.cross) tip = writeEnd(closeP(C.body), pi);
    else { const k = EZ.i2(ev(cu.cross, 0.4)); tip = [lerp(560, 1150, k), lerp(680, 300, k)]; }
    pencilTool(tip[0], tip[1], -0.75 + 0.08 * Math.sin(B * 1.7), 1);
  }
  // o herói: confuso, depois "!" quando a câmera é riscada
  const hop = Math.sin(Math.PI * ev(cu.wow, 0.25)), sq = Math.sin(Math.PI * ev(cu.wow + 0.25, 0.17)), wow = TT >= cu.wow;
  doodleHero(HOME.x, HOME.y - 60 * hop, HOME.r, { key: 'hero', legs: true, mood: wow ? 'wow' : 'puzzled', look: [0.8, -0.9], sx: 1 + 0.1 * sq - 0.05 * hop, sy: 1 - 0.1 * sq + 0.08 * hop, arms: wow ? [1.2, 1.3] : [-0.9, 0.9] });
  if (!wow) handLetter('?', HOME.x + 150, 1000 + 6 * Math.sin(B * 0.9), 96, { col: SK.graph, key: 'q', jit: 1.5 });
  else handLetter('!', HOME.x + 160, 990 - 30 * hop, 110, { face: 'marker', col: SK.ink, key: 'bang', reveal: ev(cu.wow, 0.08) });
  pageTag('sem câmera');
  pageCaption(['um vídeo inteiro', 'sem filmar nada'], [[1, 'sem filmar']]);
}

// ---- mundo 1: f(t) ------------------------------------------------
function watchFace() { return loopPts(WATCH.x, WATCH.y, WATCH.r, WATCH.r, 0, 0, 64); }
function sceneRelogio() {
  const cu = TIMELINE.cues, t = TT - 4.5, { x, y, r } = WATCH;
  sketchPage({ grid: 'dots' });
  marginLife('m1', { plane: false, stars: false });
  // o cronômetro: coroa, botão, mostrador, 12 marcas; o ponteiro é o tempo
  gfill(sketchBox(x - 26, y - r - 62, 52, 46, 8, 0), SK.sheet, { off: [3, 3], key: 'crf' });
  gline(sketchBox(x - 26, y - r - 62, 52, 46, 8), { w: 5, key: 'cro' });
  gline([[x - 14, y - r - 16], [x - 14, y - r + 4]], { w: 5, key: 'st1', second: false });
  gline([[x + 14, y - r - 16], [x + 14, y - r + 4]], { w: 5, key: 'st2', second: false });
  const press = Math.max(0, ...[cu.card0, cu.card1, cu.card2, cu.card3].map((c) => Math.sin(Math.PI * ev(c - 0.08, 0.16))));
  gline([[x + r * 0.72, y - r * 0.72], [x + r * 0.86 - 6 * press, y - r * 0.9 + 6 * press]], { w: 10, key: 'btn', second: false });
  gfill(watchFace(), SK.sheet, { off: [6, 5], key: 'wf' });
  litHatch(watchFace(), { ang: -0.8, gap: 10, col: SK.graph, w: 2, a: 0.3, key: 'wh', lx: 0.25, ly: 0.25 });
  gline(loopPts(x, y, r, r, 0.07), { w: 7, key: 'wo' });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = r * (i % 3 ? 0.82 : 0.72); gline([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], { w: i % 3 ? 3 : 5, key: 'tk' + i, second: false, amp: 0.4, step: 6 }); }
  const ang = -Math.PI / 2 + TAU * t / 4;
  gline([[x - Math.cos(ang) * r * 0.16, y - Math.sin(ang) * r * 0.16], [x + Math.cos(ang) * r * 0.8, y + Math.sin(ang) * r * 0.8]], { w: 6, key: 'hand', second: false, amp: 0.5 });
  ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
  // a leitura do tempo, escrita à mão
  handLetter('t = ' + fmtT(Math.max(0, t)) + ' s', x, 900, 72, { face: 'marker', key: 'tread', reveal: ev(4.7, 0.3), jit: 0.8 });
  // f(t) = um desenho: a cada batida o cronômetro "clica" e sai um cartão com o herói numa pose do pulo
  handLetter('f(t) =', 70, CARD.y - 140, 54, { face: 'marker', align: 'left', col: SK.graph, key: 'ft', reveal: ev(5.4, 0.3) });
  [cu.card0, cu.card1, cu.card2, cu.card3].forEach((c, i) => {
    const k = popS(c); if (k <= 0) return;
    ctx.save(); ctx.translate(CARD.xs[i], CARD.y); ctx.rotate([-0.05, 0.03, -0.02, 0.04][i]); ctx.scale(k, k);
    frameCard(0, 0, CARD.w, CARD.h, i / 3 * 0.5, { key: 'card' + i, part: ev(c, 0.15), num: i + 1 });
    ctx.restore();
    sparkle(CARD.xs[i] + 92, CARD.y - 130, 34, ev(c, 0.4), 'cs' + i);
  });
  pageTag('f(t)');
  pageCaption(['cada tempo t', 'vira um desenho'], [[1, 'desenho']]);
}

// ---- mundo 2: confere ---------------------------------------------
const cellC = (i) => [SHEET.x + 35 + (i % 3) * (SHEET.cell + SHEET.gap) + SHEET.cell / 2, SHEET.y + 35 + Math.floor(i / 3) * (SHEET.cell + SHEET.gap) + SHEET.cell / 2];
const checkT = (i) => { const cu = TIMELINE.cues; return i < 5 ? cu.checks + i * 0.25 : cu.fixed + (i - 5) * 0.25; };
function sheetOutline() { return sketchBox(SHEET.x, SHEET.y, SHEET.s, SHEET.s, 18, 0); }
function sceneConfere() {
  const cu = TIMELINE.cues, [wx, wy] = cellC(5);
  sketchPage({ grid: 'dots' });
  marginLife('m2', { plane: false });
  smudge(SHEET.x + SHEET.s / 2 + 18, SHEET.y + SHEET.s + 10, SHEET.s * 0.46, 22, 0.25, 0);
  gfill(sheetOutline(), SK.sheet, { off: [6, 6], key: 'shf' });
  gline(sketchBox(SHEET.x, SHEET.y, SHEET.s, SHEET.s, 18), { w: 5, key: 'sho' });
  for (let i = 0; i < 9; i++) {
    const [cx, cy] = cellC(i), part = ev(cu.grid + i * E16, 0.18);
    const wrong = i === 5 && TT < cu.redraw, hide = i === 5 && TT >= cu.redraw && ev(cu.redraw, cu.fixed - cu.redraw) < 0.4;
    frameCard(cx, cy, SHEET.cell, SHEET.cell, i / 8, { key: 'cell' + i, part, num: i + 1, wrong, hide });
    const ck = ev(checkT(i), 0.15);
    if (ck > 0) checkMark(cx + 84, cy - 80, 0.9, ck, SK.green, 'ck' + i);
  }
  // a borracha cobre o quadro errado com papel e deixa farelos de grafite
  const erase = ev(cu.erase, cu.redraw - cu.erase);
  if (erase > 0 && TT < cu.redraw) {
    ctx.save(); gclip(sketchBox(wx - 112, wy - 92, 224, 196, 10, 0));
    ctx.globalAlpha = clamp(erase * 1.4); ctx.fillStyle = SK.sheet; ctx.fillRect(wx - 120, wy - 100, 240, 210); ctx.restore();
    graphiteScribble(wx, wy + 30, 150 * (1 - erase) + 20, 70 * (1 - erase) + 10, 'mess');
  }
  // o quadro errado: círculo vermelho e "!"
  if (TT >= cu.wrong && TT < cu.fixed + 0.25) {
    gline(loopPts(wx, wy, 150, 150, 0.12), { w: 7, col: SK.red, key: 'wr', part: ev(cu.wrong, 0.2), second: false, amp: 2, step: 10 });
    handLetter('!', wx + 40, wy - 168, 110, { face: 'marker', col: SK.red, key: 'wbang', reveal: ev(cu.wrong + 0.1, 0.08) });
  }
  // a borracha e o lápis
  if (TT >= cu.erase && TT < cu.redraw) eraserTool(wx + 60 * Math.sin(B * 1.9), wy + 20 + 30 * Math.cos(B * 1.3), -0.5, 0.75);
  if (TT >= cu.redraw && TT < cu.fixed) { const k = ev(cu.redraw, cu.fixed - cu.redraw); pencilTool(wx - 30 + 60 * k + 15 * Math.sin(B * 2.3), wy + 10 - 30 * Math.sin(Math.PI * k), -0.75, 0.9); }
  if (TT >= cu.checks && TT < cu.wrong) { const i = Math.min(4, Math.floor((TT - cu.checks) / 0.25)), [cx, cy] = cellC(i); pencilTool(cx + 96, cy - 64, -0.75, 0.8); }
  if (TT >= cu.fixed && TT < 14.95) { const i = Math.min(8, 5 + Math.floor((TT - cu.fixed) / 0.25)), [cx, cy] = cellC(i); pencilTool(cx + 96, cy - 64, -0.75, 0.8); }
  pageTag('confere');
  pageCaption(['ele confere', 'cada quadro'], [[0, 'confere']]);
}

// ---- mundo 3: vivo ------------------------------------------------
function filmStrip(off, key) {
  const y0 = 420, h = 230, fw = 210, span = fw * 8;
  gfill([[-200, y0], [1280, y0 - 6], [1280, y0 + h - 6], [-200, y0 + h]], SK.ink, { off: [0, 0], key: key + 'b', amp: 1.2 });
  for (let k = 0; k < 8; k++) {
    const x = ((k * fw - off) % span + span) % span - fw * 1.5;
    if (x < -fw * 1.5 || x > W + fw) continue;
    for (const yy of [y0 + 14, y0 + h - 30]) for (let s = 0; s < 4; s++) { ctx.fillStyle = SK.paper; ctx.fillRect(x + 22 + s * 52, yy, 26, 16); }
    frameCard(x + fw / 2, y0 + h / 2, fw - 36, h - 86, (k % 4) / 3 * 0.5 + 0.05, { key: key + 'f' + (k % 4) });
  }
}
function sceneVivo() {
  const cu = TIMELINE.cues;
  sketchPage({ grid: 'dots' });
  ground('g3');
  marginLife('m3');
  // o filme correndo atrás; na volta para casa ele sai pela esquerda
  const roll = EZ.i2(ev(cu.home, 0.9));
  if (roll < 1) { ctx.save(); ctx.translate(-1500 * roll, 0); filmStrip((TT - cu.payoff) * 300, 'film'); ctx.restore(); }
  // o play riscado de marca-texto: a única coisa que "acende"
  const pk = popS(cu.payoff + 0.04);
  if (pk > 0 && roll < 1) {
    ctx.save(); ctx.translate(820 - 1500 * roll, 330); ctx.scale(pk, pk);
    const tri = [[-34, -44], [50, 0], [-34, 44]];
    scribbleFill(tri, SK.hilite, { key: 'playf', gap: 9, w: 4, a: 0.95, base: 0.35 });
    gline(closeP(tri), { w: 6, key: 'play' });
    gline(loopPts(4, 0, 80, 80, 0.08), { w: 4, key: 'playc', second: false });
    ctx.restore();
  }
  // o herói vivo: pula para a direita em cada batida, depois volta para casa e para
  let hx, hy, pose, look = [0.8, -0.3], mood;
  if (TT < cu.home) {
    const ph = ((TT - cu.payoff) / BEAT + 0.5) % 1;   // começa no topo do pulo: o quadro do corte já está pronto
    pose = hopPose(ph);
    hx = lerp(HOME.x, 800, EZ.io(seg(TT, cu.payoff, cu.home - 0.25)));
    hy = HOME.y - 200 * pose.up;
    mood = pose.up > 0.4 ? 'wow' : 'happy';
  } else if (TT < cu.home + 1.0) {
    const ph = (TT - cu.home) / 1.0;
    pose = hopPose(ph); look = [-0.8, -0.3];
    hx = lerp(800, HOME.x, EZ.io(ph)); hy = HOME.y - 240 * pose.up; mood = 'happy';
  } else {
    pose = { up: 0, sx: 1, sy: 1, arms: [-0.6, 1.1 + 0.4 * ((B % 4) < 2 ? 1 : -1)] }; hx = HOME.x; hy = HOME.y; look = [0.5, -0.6]; mood = 'happy';
  }
  if (pose.up > 0.3) for (let i = 0; i < 3; i++) { const d = TT < cu.home ? 1 : -1; gpencil([[hx - d * (150 + i * 10), hy - 40 + i * 34], [hx - d * (240 + i * 24), hy - 40 + i * 34]], { key: 'spd' + i, w: 3, a: 0.65 * pose.up, passes: 1 }); }
  if (pose.up < 0.1 && TT > cu.payoff + 0.2 && TT < cu.home + 1.2) for (let i = 0; i < 2; i++) gline([[hx - 80 + i * 160, 1196], [hx - 96 + i * 192, 1206]], { w: 3, key: 'dust' + i, second: false });
  const rr = HOME.r * lerp(1.25, 1, EZ.io(ev(cu.home, 1.0)));
  doodleHero(hx, hy + (HOME.r - rr) * 1.42, rr, { key: 'heroBig', legs: true, mood, look, sx: pose.sx, sy: pose.sy, arms: pose.arms });
  pageTag('vira vídeo');
  pageCaption(['e vira vídeo,', 'escrito em código'], [[1, 'código']]);
}
