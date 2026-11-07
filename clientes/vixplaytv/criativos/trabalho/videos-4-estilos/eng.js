// Motor de animação por tempo de palavra (seek(t) determinístico, para captura quadro a quadro)
// Cena: <div class="sc" data-t0 data-t1>. Elemento animado: data-a="blur|pop|write|draw|hl|fade|slide|stamp" data-t (início) data-d (duração)
// Extras: data-kb (ken burns na cena), .spin (gira), .pen (a mão segue este elemento enquanto escreve/desenha)
const clamp = (x) => Math.max(0, Math.min(1, x));
const eo = (x) => 1 - Math.pow(1 - x, 3);
const back = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
let CACHE = null;
function prep() {
  CACHE = [...document.querySelectorAll('.sc')].map((sc) => ({
    sc, t0: +sc.dataset.t0, t1: +sc.dataset.t1,
    els: [...sc.querySelectorAll('[data-a]')].map((el) => ({ el, a: el.dataset.a, t: +el.dataset.t, d: +(el.dataset.d || 0.35), paths: el.dataset.a === 'draw' ? [...el.querySelectorAll('path,circle,rect,line,ellipse')] : null })),
    kb: [...sc.querySelectorAll('[data-kb]')],
    spin: [...sc.querySelectorAll('.spin')],
    hand: sc.querySelector('.hand'),
  }));
  // medir posição real dos elementos "write" (sem transformações) para a mão
  for (const s of CACHE) { s.sc.style.display = 'block'; for (const e of s.els) { if (e.a === 'write') { const r = e.el.getBoundingClientRect(); e.r = { x: r.left, y: r.top, w: r.width, h: r.height }; } } s.sc.style.display = 'none'; }
}
window.seek = function (t) {
  if (!CACHE) prep();
  for (const s of CACHE) {
    const on = t >= s.t0 && t < s.t1;
    s.sc.style.display = on ? 'block' : 'none';
    if (!on) continue;
    const st = t - s.t0, sd = s.t1 - s.t0;
    for (const k of s.kb) { const z = +k.dataset.kb || 0.08; k.style.transform = `scale(${1 + z * clamp(st / sd)})`; }
    for (const k of s.spin) k.style.transform = `rotate(${st * 30}deg)`;
    let pen = null;
    for (const e of s.els) {
      const p = clamp((t - e.t) / e.d), el = e.el, q = eo(p);
      const vis = t >= e.t;
      switch (e.a) {
        case 'blur': el.style.opacity = q; el.style.filter = `blur(${(1 - q) * 26}px)`; el.style.transform = `translateY(${(1 - q) * 46}px) scale(${1 + 0.18 * (1 - q)})`; break;
        case 'fade': el.style.opacity = q; break;
        case 'pop': el.style.opacity = clamp(p * 4); el.style.transform = `${el.dataset.base || ''} scale(${vis ? 0.35 + 0.65 * back(p) : 0})`; break;
        case 'stamp': el.style.opacity = clamp(p * 4); el.style.transform = `${el.dataset.base || ''} scale(${vis ? 1 + 0.9 * (1 - eo(p)) : 0})`; break;
        case 'slide': el.style.opacity = clamp(p * 3); el.style.transform = `${el.dataset.base || ''} translateY(${(1 - back(p)) * 160}px)`; break;
        case 'hl': el.style.transform = `${el.dataset.base || ''} scaleX(${p})`; break;
        case 'write': el.style.clipPath = `inset(-20% ${(1 - p) * 100}% -20% -5%)`; if (p > 0 && p < 1 && el.classList.contains('pen')) pen = { x: e.r.x + e.r.w * p, y: e.r.y + e.r.h * 0.62 }; break;
        case 'draw':
          for (const pa of e.paths) { pa.setAttribute('pathLength', 1); pa.style.strokeDasharray = 1; pa.style.strokeDashoffset = 1 - p; pa.style.fillOpacity = p >= 1 ? 1 : 0; }
          if (p > 0 && p < 1 && el.classList.contains('pen')) { const pa = e.paths[Math.min(e.paths.length - 1, Math.floor(p * e.paths.length))]; try { const L = pa.getTotalLength(); const k = (p * e.paths.length) % 1; const pt = pa.getPointAtLength(L * k); pen = { x: pt.x, y: pt.y }; } catch (_) {} }
          break;
      }
    }
    if (s.hand) {
      // mão: segue a ponta do que está sendo escrito; parada = repousa perto do último ponto; sai de cena no fim
      if (pen) { s.lastPen = pen; s.lastPenT = t; }
      const FORA = { x: 1250, y: 2150 };
      let hp = pen || s.lastPen || FORA;
      if (!pen && s.lastPen) {
        // parada: espera 0,3 s levantada e depois sai de cena até a próxima palavra
        const r = eo(clamp((t - s.lastPenT - 0.3) / 0.45));
        hp = { x: s.lastPen.x + 30 + (FORA.x - s.lastPen.x) * r, y: s.lastPen.y + 40 + (FORA.y - s.lastPen.y) * r };
      }
      const SC = 640 / 979, TIPX = 24 * SC, TIPY = 58 * SC;
      s.hand.style.transform = `translate(${hp.x - TIPX}px, ${hp.y - TIPY}px)`;
    }
  }
};
window.addEventListener('load', () => document.fonts.ready.then(() => setTimeout(() => { prep(); window.seek(0); window.PRONTO = 1; }, 600)));
