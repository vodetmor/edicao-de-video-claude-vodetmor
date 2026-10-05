"""Gera a página de escuta do banco (index.html) a partir de catalogo.json.

Uso: python3 pagina.py <pasta_saida>  -> <pasta_saida>/index.html (as prévias ficam em ../previas, publicar junto como previas/*.mp3)
"""
import html, json, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
cat = json.loads((AQUI / "catalogo.json").read_text())
CLIMAS = [("aula", "Aula", "Explicação e conta passo a passo. Calma, curiosa, com pulso leve."),
          ("fala", "Fala", "Bastidores, vlog, rosto falando. Quente e discreta."),
          ("gancho", "Gancho", "Abertura, pergunta, suspense, virada."),
          ("final", "Final", "Conclusão e loop. Sobe e fecha."),
          ("leve", "Leve", "Vídeo divertido, trend, dica rápida. Nunca em aula.")]
FONTE = {"scottbuckley": "Scott Buckley", "ccmixter": "ccMixter", "jamendo": "Jamendo", "freesound": "Freesound"}
e = html.escape


def card(c):
    m, s = divmod(int(c["duracao"]), 60)
    pill = "cc0" if c["licenca"] == "CC0" else "ccby"
    return f'''<li class="faixa">
  <button class="play" type="button" data-src="{e(c['previa'])}" aria-label="Ouvir {e(c['titulo'])}"><span class="ico"></span></button>
  <div class="info">
    <div class="tit">{e(c['titulo'])}</div>
    <div class="meta">{e(c['artista'])} · {FONTE[c['fonte']]} · {m}:{s:02d}</div>
    <div class="barra"><span></span></div>
  </div>
  <div class="lado">
    <span class="lic {pill}">{e(c['licenca'])}</span>
    <button class="copia" type="button" data-cred="{e(c['credito'])}">Copiar crédito</button>
  </div>
</li>'''


secoes = []
for k, nome, desc in CLIMAS:
    itens = "\n".join(card(c) for c in cat if c["clima"] == k)
    secoes.append(f'<section id="{k}" class="clima"><header><h2>{nome}</h2><p>{desc}</p></header><ol>{itens}</ol></section>')
abas = "".join(f'<a href="#{k}" class="aba" data-k="{k}">{n}</a>' for k, n, _ in CLIMAS)

pagina = f'''<title>Banco de Músicas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
/* Layout: uma coluna de faixas por clima, abas fixas no topo; um azul só, fundo claro (DESIGN-SYSTEM do projeto) */
:root {{ --bg:#f6f7f9; --card:#ffffff; --fg:#14161a; --sub:#5d6470; --linha:#e3e6eb; --azul:#0a66ff; --azul-claro:#e8f0ff; --verde:#1f8a4c; --verde-claro:#e5f4ea;
  --f:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#0f1114; --card:#181b20; --fg:#eef0f3; --sub:#9aa2ae; --linha:#2a2f37; --azul:#4c8dff; --azul-claro:#17243d; --verde:#4cc27f; --verde-claro:#15291e; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#0f1114; --card:#181b20; --fg:#eef0f3; --sub:#9aa2ae; --linha:#2a2f37; --azul:#4c8dff; --azul-claro:#17243d; --verde:#4cc27f; --verde-claro:#15291e; color-scheme:dark }}
body {{ background:var(--bg); color:var(--fg); font-family:var(--f); font-size:15px; line-height:1.45; }}
.wrap {{ max-width:760px; margin:0 auto; padding-inline:16px; padding-block:28px 64px; }}
h1 {{ font-size:28px; font-weight:700; letter-spacing:-0.02em; margin:0 0 6px; text-wrap:balance; }}
.lead {{ color:var(--sub); margin:0 0 18px; max-width:62ch; }}
.ref {{ display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--linha); border-radius:16px; padding:12px 14px; margin-bottom:18px; }}
.ref .info {{ flex:1; min-width:0; }}
nav {{ position:sticky; top:env(safe-area-inset-top,0px); z-index:5; background:var(--bg); display:flex; gap:6px; padding-block:10px; overflow-x:auto; }}
.aba {{ flex:none; text-decoration:none; color:var(--fg); font-weight:500; padding:7px 14px; border-radius:999px; border:1px solid var(--linha); background:var(--card); }}
.aba.on {{ background:var(--azul); border-color:var(--azul); color:#fff; }}
.clima {{ margin-top:22px; scroll-margin-top:64px; }}
.clima header h2 {{ font-size:19px; font-weight:600; margin:0; }}
.clima header p {{ color:var(--sub); margin:2px 0 10px; }}
ol {{ list-style:none; margin:0; padding:0; display:grid; gap:8px; }}
.faixa {{ display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--linha); border-radius:16px; padding:10px 12px; }}
.info {{ flex:1; min-width:0; }}
.tit {{ font-weight:600; overflow-wrap:anywhere; }}
.meta {{ color:var(--sub); font-size:13px; font-variant-numeric:tabular-nums; }}
.barra {{ height:3px; background:var(--linha); border-radius:2px; margin-top:7px; overflow:hidden; }}
.barra span {{ display:block; height:100%; width:0; background:var(--azul); }}
.lado {{ display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex:none; }}
.lic {{ font-size:12px; font-weight:600; padding:2px 8px; border-radius:999px; letter-spacing:0.02em; }}
.lic.cc0 {{ background:var(--verde-claro); color:var(--verde); }}
.lic.ccby {{ background:var(--azul-claro); color:var(--azul); }}
.copia {{ font:500 12px var(--f); color:var(--azul); background:none; border:0; padding:2px 0; cursor:pointer; }}
.copia:focus-visible, .play:focus-visible, .aba:focus-visible {{ outline:2px solid var(--azul); outline-offset:2px; }}
.play {{ flex:none; width:42px; height:42px; border-radius:50%; border:0; background:var(--azul); cursor:pointer; display:grid; place-items:center; transition:transform .2s cubic-bezier(.3,1.4,.5,1); }}
.play:active {{ transform:scale(.92); }}
.ico {{ width:0; height:0; border-left:12px solid #fff; border-top:8px solid transparent; border-bottom:8px solid transparent; margin-left:3px; }}
.play.tocando .ico {{ width:4px; height:14px; border:0; margin:0 8px 0 0; background:#fff; box-shadow:8px 0 0 #fff; }}
.nota {{ color:var(--sub); font-size:13px; margin-top:28px; max-width:62ch; }}
@media (max-width:480px) {{ .copia {{ font-size:11px; }} h1 {{ font-size:24px; }} }}
@media (prefers-reduced-motion: reduce) {{ .play {{ transition:none; }} }}
</style>
<div class="wrap">
  <h1>Banco de músicas</h1>
  <p class="lead">50 trilhas novas de 4 bibliotecas grátis, 10 por clima, escolhidas por uma IA de áudio que compara cada faixa com a "Inspired" da aula de ótica. Cada botão toca 30 segundos de um trecho do meio, todas no mesmo volume.</p>
  <div class="ref"><button class="play" type="button" data-src="previas/referencia-inspired.mp3" aria-label="Ouvir a referência"><span class="ico"></span></button>
    <div class="info"><div class="tit">Referência: Inspired</div><div class="meta">Kevin MacLeod · a trilha que você chamou de perfeita</div><div class="barra"><span></span></div></div></div>
  <nav>{abas}</nav>
  {"".join(secoes)}
  <p class="nota">Verde (CC0) é livre até para anúncio. Azul (CC BY) é livre no TikTok e no Instagram com o crédito na descrição; o botão copia a linha pronta. Os arquivos inteiros estão em motion-base/musica/faixas/.</p>
</div>
<script>
const a = new Audio(); let atual = null;
function para() {{ if (atual) {{ atual.classList.remove('tocando'); atual.closest('.faixa,.ref').querySelector('.barra span').style.width = '0'; }} atual = null; }}
document.querySelectorAll('.play').forEach(b => b.addEventListener('click', () => {{
  if (atual === b) {{ a.pause(); para(); return; }}
  para(); a.src = b.dataset.src; a.play().catch(() => {{}}); atual = b; b.classList.add('tocando');
}}));
a.addEventListener('timeupdate', () => {{ if (atual && a.duration) atual.closest('.faixa,.ref').querySelector('.barra span').style.width = (100 * a.currentTime / a.duration) + '%'; }});
a.addEventListener('ended', para);
document.querySelectorAll('.copia').forEach(b => b.addEventListener('click', () => {{
  const t = b.dataset.cred, ok = () => {{ b.textContent = 'Copiado'; setTimeout(() => b.textContent = 'Copiar crédito', 1600); }};
  try {{ navigator.clipboard.writeText(t).then(ok, () => {{ window.getSelection().selectAllChildren(b.closest('.faixa')); }}); }} catch (e) {{}}
}}));
const abas = [...document.querySelectorAll('.aba')];
const obs = new IntersectionObserver(es => es.forEach(x => {{ if (x.isIntersecting) abas.forEach(t => t.classList.toggle('on', t.dataset.k === x.target.id)); }}), {{ rootMargin: '-40% 0px -55% 0px' }});
document.querySelectorAll('.clima').forEach(s => obs.observe(s));
abas[0].classList.add('on');
</script>
'''
(OUT / "index.html").write_text(pagina)
print(OUT / "index.html")
