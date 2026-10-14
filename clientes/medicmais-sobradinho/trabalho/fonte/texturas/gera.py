"""Texturas da cena 3D da plaquinha (K18): face da plaquinha NFC, tela travada e tela de avaliação (0 a 5 estrelas).
HTML -> PNG com Playwright (node ../../../../.. scratch shot.mjs). Uso: python3 gera.py && node render.mjs"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public')
IC = dict(re.findall(r"  (\w+): '([^']+)'", open(os.path.join(HERE, '..', 'src', 'icons.ts')).read()))
FONT = ''.join(f"@font-face{{font-family:P;font-weight:{w};src:url(../public/fontes/{f})}}" for w, f in [
    (400, 'pxiEyp8kv8JHgFVrFJA.ttf'), (500, 'pxiByp8kv8JHgFVrLGT9V1s.ttf'), (600, 'pxiByp8kv8JHgFVrLEj6V1s.ttf'),
    (700, 'pxiByp8kv8JHgFVrLCz7V1s.ttf'), (800, 'pxiByp8kv8JHgFVrLDD4V1s.ttf')])
BASE = f"<style>{FONT}*{{margin:0;box-sizing:border-box}}html,body{{background:transparent}}body{{font-family:P;color:#121216}}</style>"
STAR = "M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"
def ic(k, size, color, extra=''):
    return f'<svg viewBox="0 0 256 256" width="{size}" height="{size}" style="flex:none;{extra}"><path d="{IC[k]}" fill="{color}"/></svg>'
def star(size, on):
    if on:
        return f'<svg viewBox="0 0 256 256" width="{size}" height="{size}"><path d="{STAR}" fill="#FBBC04"/></svg>'
    return f'<svg viewBox="0 0 256 256" width="{size}" height="{size}"><path d="{STAR}" fill="none" stroke="#9AA0A6" stroke-width="14"/></svg>'
G = '<img src="../public/logos/google-g.svg" style="width:{0}px;height:{0}px">'
PLUS = lambda s, inv=False: f'<span style="display:inline-grid;place-items:center;width:{s}px;height:{s}px;border-radius:{s*.28}px;background:{"#fff" if inv else "#EB2026"};color:{"#EB2026" if inv else "#fff"};font-weight:700;font-size:{s*.68}px;line-height:1">+</span>'

pages = {}
# face da plaquinha 1000 x 1250 (proporção da peça 3D)
pages['placa'] = (1000, 1250, BASE + f"""
<div style="width:1000px;height:1250px;border-radius:70px;overflow:hidden;background:#fff;position:relative">
 <div style="position:absolute;left:0;top:0;width:1000px;height:560px;background:#EB2026;color:#fff;text-align:center;padding-top:70px">
  <div style="display:flex;justify-content:center;gap:14px">{''.join(star(70, True) for _ in range(5))}</div>
  <div style="font-weight:800;font-size:76px;line-height:1.02;letter-spacing:-.02em;text-transform:uppercase;margin-top:34px">Avalie a gente<br>no Google!</div>
 </div>
 <div style="position:absolute;left:390px;top:470px;width:220px;height:220px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 0 0 10px #fff">{G.format(140)}</div>
 <div style="position:absolute;left:0;right:0;top:730px;display:flex;justify-content:center">{ic('nfc', 230, '#121216')}</div>
 <div style="position:absolute;left:0;right:0;top:975px;text-align:center;font-weight:700;font-size:62px;letter-spacing:-.01em">Aproxime seu celular</div>
 <div style="position:absolute;left:0;right:0;top:1100px;display:flex;justify-content:center;align-items:center;gap:18px;font-weight:600;font-size:40px;color:#55565e">{PLUS(56)}MedicMais Sobradinho</div>
</div>""")
# telas do celular 600 x 1300 (cantos transparentes)
SB = '<div style="height:90px;display:flex;justify-content:space-between;align-items:center;padding:20px 54px 0;font-weight:600;font-size:30px;color:{c}"><span>18:30</span><span style="width:110px;height:30px;border-radius:15px;background:{c};opacity:.0"></span><span>●●●</span></div>'
pages['tela-travada'] = (600, 1300, BASE + f"""
<div style="width:600px;height:1300px;border-radius:70px;overflow:hidden;background:#121216;color:#fff;position:relative">
 {SB.format(c='#fff')}
 <div style="text-align:center;margin-top:120px;font-size:34px;font-weight:500;opacity:.8">quarta-feira, 14 de outubro</div>
 <div style="text-align:center;font-size:190px;font-weight:600;line-height:1.05;letter-spacing:-.03em">18:30</div>
 <div style="position:absolute;left:0;right:0;bottom:120px;display:flex;justify-content:center">{ic('nfc', 120, 'rgba(255,255,255,.55)')}</div>
</div>""")
for n in range(6):
    pages[f'tela-avaliacao-{n}'] = (600, 1300, BASE + f"""
<div style="width:600px;height:1300px;border-radius:70px;overflow:hidden;background:#fff;position:relative">
 {SB.format(c='#121216')}
 <div style="display:flex;align-items:center;gap:20px;padding:40px 44px 0">{G.format(64)}<div style="font-size:30px;font-weight:600;color:#55565e">Avaliar no Google</div></div>
 <div style="padding:46px 44px 0;font-size:50px;font-weight:800;letter-spacing:-.02em;line-height:1.1">MedicMais<br>Sobradinho</div>
 <div style="display:flex;align-items:center;gap:22px;padding:44px 44px 0">
  <div style="width:84px;height:84px;border-radius:50%;background:#E6E8EC;display:grid;place-items:center">{ic('user', 52, '#A1A1A9')}</div>
  <div><div style="font-size:32px;font-weight:600">Paciente</div><div style="font-size:26px;color:#55565e">Publicando publicamente</div></div>
 </div>
 <div style="display:flex;justify-content:space-between;padding:70px 40px 0">{''.join(star(96, i < n) for i in range(5))}</div>
 <div style="margin:70px 44px 0;height:300px;border:3px solid #E6E8EC;border-radius:28px;padding:30px;font-size:30px;color:#A1A1A9;line-height:1.35">Conte como foi o seu atendimento</div>
 <div style="position:absolute;right:44px;bottom:90px;background:{'#1A73E8' if n == 5 else '#E6E8EC'};color:{'#fff' if n == 5 else '#A1A1A9'};font-weight:600;font-size:32px;padding:22px 52px;border-radius:999px">Publicar</div>
</div>""")
os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
for k, (w, h, html) in pages.items():
    open(os.path.join(HERE, 'html', f'{k}.html'), 'w').write(f'<!doctype html><meta charset=utf-8>{html}'.replace('../public', '../../public'))
json.dump({k: [w, h] for k, (w, h, _) in pages.items()}, open(os.path.join(HERE, 'html', 'tamanhos.json'), 'w'))
print(list(pages))
