# Coloca cenas reais (futebol, filmes, séries, novelas) nos vídeos 2, 3 e 4 e suporte a <video> no motor
import os
os.chdir('C:/tmp/vz')


def troca(f, pares):
    s = open(f, encoding='utf8').read()
    for a, b in pares:
        assert a in s, (f, a[:80])
        s = s.replace(a, b, 1)
    open(f, 'w', encoding='utf8').write(s)


# ---------- motor ----------
troca('eng.js', [
    ("window.seek = function (t) {", "function seekSync(t) {"),
    ("window.addEventListener('load', () => document.fonts.ready.then(() => setTimeout(() => { prep(); window.seek(0); window.PRONTO = 1; }, 600)));",
     """// vídeos dentro das cenas: tempo do vídeo = data-v0 + (t - data-t ou início da cena); espera o 'seeked' antes da captura
window.seek = function (t) {
  seekSync(t);
  const ps = [];
  for (const s of CACHE) {
    if (s.sc.style.display === 'none') continue;
    for (const v of s.sc.querySelectorAll('video')) {
      const st = v.dataset.t != null ? +v.dataset.t : s.t0;
      const tt = Math.max(0, Math.min((v.duration || 6) - 0.05, (+v.dataset.v0 || 0) + Math.max(0, t - st)));
      if (Math.abs(v.currentTime - tt) > 0.001) { ps.push(new Promise((r) => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 3000); })); v.currentTime = tt; }
    }
  }
  return Promise.all(ps);
};
window.addEventListener('load', () => document.fonts.ready.then(async () => {
  await Promise.all([...document.querySelectorAll('video')].map((v) => { v.muted = true; return v.readyState >= 2 ? 0 : new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); v.load(); setTimeout(r, 8000); }); }));
  setTimeout(async () => { prep(); await window.seek(0); window.PRONTO = 1; }, 600);
}));"""),
])
troca('cap.js', [("await p.evaluate((t) => window.seek(t), t);", "await p.evaluate(async (t) => { await window.seek(t); }, t);")])

V = lambda src, extra='', st='': f'<video src="cl/{src}.mp4" muted preload="auto" {extra} style="{st}"></video>'

# ---------- V2 ----------
s = open('v2.html', encoding='utf8').read()
s = s.replace('<div class="sc" data-t0="0" data-t1="1.4"><div class="ph" data-kb="0.1" style="background-image:url(f/p7.jpg)"></div>',
              '<div class="sc" data-t0="0" data-t1="1.4">' + V('fut1', 'data-v0="0.5"', 'left:0;top:0;width:100%;height:100%;object-fit:cover;opacity:.75'), 1)
a = s.index('<!-- 3 · Cada um quer'); b = s.index('<!-- 4 · E você?')
tile = lambda t, x, y, src: f' <div class="tile" data-a="slide" data-t="{t}" style="left:{x}px;top:{y}px;width:450px;height:620px;overflow:hidden">' + V(src, f'data-t="{t}"', 'left:0;top:0;width:100%;height:100%;object-fit:cover') + '</div>\n'
chip = lambda t, x, y, txt, w='': f' <div class="chip {w}" data-a="pop" data-t="{t}" style="left:{x}px;top:{y}px;font-size:44px;padding:12px 24px">{txt}</div>\n'
s = s[:a] + '<!-- 3 · Cada um quer um programa diferente: futebol, filmes, séries e novelas passando -->\n<div class="sc" data-t0="3.0" data-t1="5.5"><div class="glow"></div>\n' + \
    tile(3.0, 60, 300, 'fut2') + tile(3.3, 570, 400, 'filme1') + tile(3.6, 60, 980, 'serie1') + tile(3.9, 570, 1080, 'nov1') + \
    chip(3.15, 90, 330, 'FUTEBOL') + chip(3.45, 600, 430, 'FILMES', 'w') + chip(3.75, 90, 1010, 'SÉRIES') + chip(4.05, 600, 1110, 'NOVELAS', 'w') + \
    ' <div class="k c" style="top:820px;font-size:120px;text-shadow:0 0 30px #000,0 0 60px #000"><span data-a="blur" data-t="3.0"><em>CADA UM</em></span> <span data-a="blur" data-t="3.5">QUER UM</span><br><span data-a="blur" data-t="3.9">PROGRAMA</span><br><span data-a="blur" data-t="4.3"><em>DIFERENTE</em></span></div></div>\n' + s[b:]
open('v2.html', 'w', encoding='utf8').write(s)

# ---------- V3 ----------
vc = lambda t, x, y, rot, src, txt, v0='': f' <div class="vc" data-a="pop" data-base="rotate({rot}deg)" data-t="{t}" style="left:{x}px;top:{y}px">' + V(src, v0) + f'<b>{txt}</b></div>\n'
tvv = lambda t, src: ' ' + V(src, f'data-a="fade" data-t="{t}" data-d="0.1"', 'left:212px;top:392px;width:396px;height:246px;object-fit:cover') + '\n'
troca('v3.html', [
    ('.strike{', '.vc{width:250px;background:#fff;padding:10px 10px 0;box-shadow:6px 9px 18px rgba(0,0,0,.25)}\n.vc video{width:230px;height:150px;object-fit:cover;display:block}\n.vc b{display:block;font:700 46px Caveat;color:#1c2a22;text-align:center}\n.strike{'),
    (' <img class="hand" src="mao_m.png"></div>\n<!-- 2 ·', vc(0.2, 200, 270, -3, 'fut1', 'futebol', 'data-v0="0.5"') + vc(0.45, 470, 290, 2, 'filme1', 'filmes') + vc(0.7, 740, 270, -2, 'nov2', 'novelas') + ' <img class="hand" src="mao_m.png"></div>\n<!-- 2 ·'),
    (' <div class="hw pen" data-a="write" data-t="16.1" data-d="1.8"', tvv(16.6, 'fut2') + tvv(17.5, 'filme2') + tvv(18.5, 'nov1') + ' <div class="hw pen" data-a="write" data-t="16.1" data-d="1.8"'),
])

# ---------- V4 ----------
quad = lambda src, x, y, v0='': ' ' + V(src, v0, f'left:{x}px;top:{y}px;width:540px;height:960px;object-fit:cover') + '\n'
full = lambda t, src: ' ' + V(src, f'data-a="fade" data-t="{t}" data-d="0.08"', 'left:0;top:0;width:100%;height:100%;object-fit:cover') + '\n'
troca('v4.html', [
    ('<div class="sc" data-t0="1.3" data-t1="2.5"><div class="im" data-kb="0.08" style="background-image:url(f/p9.jpg)"></div>',
     '<div class="sc" data-t0="1.3" data-t1="2.5">\n' + quad('fut1', 0, 0, 'data-v0="1"') + quad('filme1', 540, 0) + quad('serie1', 0, 960) + quad('nov2', 540, 960) +
     ' <div style="left:534px;top:0;bottom:0;width:12px;background:#b8ff1f"></div><div style="left:0;right:0;top:954px;height:12px;background:#b8ff1f"></div>'),
    (' <div class="stk" data-a="pop" data-base="rotate(-4deg)" data-t="7.0" style="left:90px;top:1000px">FILMES</div>',
     full(7.0, 'filme1') + full(7.6, 'serie1') + full(8.2, 'nov1') + full(8.8, 'fut2') +
     ' <div class="cap" style="top:300px;font-size:116px"><span><b>UMA</b> SÓ</span><br><span>MENSALIDADE</span></div>\n <div class="stk" data-a="pop" data-base="rotate(-4deg)" data-t="7.0" style="left:90px;top:1000px">FILMES</div>'),
])
print('ok')
