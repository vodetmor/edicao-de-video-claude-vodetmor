"""Escolhe as melhores faixas por clima a partir de trabalho/analise.json e monta o banco.

Uso: python3 seleciona.py [--n 10] [--seco]  -> faixas/<clima>/*.mp3, catalogo.json, CATALOGO.md, previas/*.mp3
Regra de nota (explicada no README): parecença com o texto do clima (CLAP) + parecença com as trilhas
que o Vítor já aprovou ("Inspired" para aula, "Deliberate Thought" para fala) - parecença com a que ele
achou "de piada" para aula ("Wallpaper"). Fora: voz cantada, ruído, faixa curta.
"""
import json, re, shutil, subprocess, sys, numpy as np
from collections import Counter, defaultdict
from pathlib import Path

AQUI = Path(__file__).resolve().parent.parent; TRAB = AQUI / "trabalho"
N = int(sys.argv[sys.argv.index("--n") + 1]) if "--n" in sys.argv else 10
CLIMAS = {
    "aula":   "Aula didática: explicação, raciocínio, conta passo a passo",
    "fala":   "Bastidores e fala: vlog, conversa, rosto falando",
    "gancho": "Tensão e gancho: abertura, pergunta, suspense, virada",
    "final":  "Final e loop: conclusão, conquista, encerramento que sobe",
    "leve":   "Leve e animada: vídeos divertidos, trends, dicas rápidas (nunca em aula)",
}
FONTE_NOME = {"scottbuckley": "scottbuckley.com.au", "ccmixter": "ccMixter", "jamendo": "Jamendo", "freesound": "Freesound"}


def z(v):
    v = np.array(v, float)
    return (v - v.mean()) / (v.std() + 1e-9)


EXTRA = {"pro": "professional high quality polished studio music production, film soundtrack",
         "amador": "amateur low quality demo recording, cheap midi, simple loop",
         "horror": "horror scary creepy disturbing music",
         "gancho2": "curious ticking clock suspense building tension for a quiz question, modern and clean"}
RUIM_TITULO = re.compile(r"loop|horror|dread|nightmar|creep|melanchol|sad|test|demo|unkown|unknown|bpm", re.I)


def extras(fx):
    import torch
    from transformers import ClapModel, ClapProcessor
    M = ClapModel.from_pretrained("laion/larger_clap_music_and_speech").eval()
    PR = ClapProcessor.from_pretrained("laion/larger_clap_music_and_speech")
    with torch.no_grad():
        t = M.get_text_features(**PR(text=list(EXTRA.values()), return_tensors="pt", padding=True))
    t = torch.nn.functional.normalize(t, dim=-1).numpy()
    E = np.array([f["emb"] for f in fx])
    return {k: E @ t[i] for i, k in enumerate(EXTRA)}


def nota(fx):
    x = extras(fx)
    q = z(x["pro"] - x["amador"]); hz = z(x["horror"])
    fonte = np.array([-0.6 if f["fonte"] == "freesound" else 0.3 if f["fonte"] == "scottbuckley" else 0.0 for f in fx])
    titulo = np.array([-1.5 if RUIM_TITULO.search(f["titulo"]) else 0.0 for f in fx])
    base = 0.6 * q + fonte + titulo
    s = {k: z([f["sim"][k] for f in fx]) for k in CLIMAS}
    s["gancho"] = 0.5 * s["gancho"] + 0.5 * z(x["gancho2"])
    a = {k: z([f["anc"][k] for f in fx]) for k in ("inspired", "deliberate", "wallpaper")}
    g = {k: z([f["neg"][k] for f in fx]) for k in ("vocal", "piada", "triste", "barulho")}
    out = {}
    out["aula"] = s["aula"] + 1.0 * a["inspired"] + 0.4 * a["deliberate"] - 0.6 * a["wallpaper"] - 0.5 * g["piada"] - 0.3 * g["triste"]
    out["fala"] = s["fala"] + 0.8 * a["deliberate"] - 0.5 * g["piada"] - 0.4 * g["triste"]
    out["gancho"] = s["gancho"] - 0.3 * g["piada"]
    out["final"] = s["final"] + 0.3 * a["inspired"] - 0.4 * g["triste"] - 0.3 * g["piada"]
    out["leve"] = s["leve"] + 0.4 * a["wallpaper"] - 0.4 * g["triste"]
    out["gancho"] = out["gancho"] - 0.8 * hz
    # etiquetas de clima que o próprio artista pôs (Scott Buckley, Jamendo, ccMixter)
    TAG = {"aula": ("thoughtful", "reflective", "inspirational", "peaceful", "calm", "dreamy", "piano"),
           "fala": ("calm", "relaxed", "peaceful", "lofi", "lo-fi", "chill", "acoustic", "downtempo", "folk"),
           "gancho": ("mysterious", "driving", "suspense", "tense", "brooding", "intense", "adventurous"),
           "final": ("uplifting", "inspirational", "epic", "heroic", "triumphant", "emotional", "grandiose"),
           "leve": ("happy", "playful", "fun", "energetic", "excited", "funk", "upbeat")}
    RUIM = ("halloween", "christmas", "sinister", "militaristic", "sad", "melancholy", "comedic", "sombre", "lonely")
    for k in out:
        b = np.array([0.35 * min(3, sum(any(w in t.lower() for t in f["tags"]) for w in TAG[k]))
                      - 0.8 * any(any(w in t.lower() for w in RUIM) for t in f["tags"]) for f in fx])
        out[k] = out[k] + b + base
    return out, g


def credito(f):
    pag = f.get("pagina") or ""
    if f["licenca"] == "CC0":
        return f'Música: "{f["titulo"]}" de {f["artista"]} ({FONTE_NOME[f["fonte"]]}), domínio público CC0.'
    return (f'Música: "{f["titulo"]}" de {f["artista"]} ({pag}). Licença {f["licenca"]} '
            f'({f["licenca_url"].replace("http://", "https://").rstrip("/")}).')


def nome_arq(f):
    s = lambda x: re.sub(r"[^a-z0-9]+", "-", x.lower()).strip("-")[:40]
    return f"{s(f['artista'])}--{s(f['titulo'])}.mp3"


def melhor_trecho(f, dur=30):
    """Começo da prévia: depois da introdução, perto de 35% da faixa."""
    return max(f.get("intro_s", 0), min(f["duracao"] * 0.35, f["duracao"] - dur - 1))


if __name__ == "__main__":
    fx = json.loads((TRAB / "analise.json").read_text())
    fx = [f for f in fx if f.get("lufs") is not None and f["duracao"] >= 75]
    sc, g = nota(fx)
    ok = [i for i in range(len(fx)) if g["vocal"][i] < 1.3 and g["barulho"][i] < 1.5]
    # escolha em rodadas (como um "draft"): cada clima pega a melhor faixa que sobrou, o gancho primeiro
    # porque tem menos candidatas; tira repetidas (mesmo título e artista), limita artista e fonte
    vistos, usados, esc = set(), set(), {k: [] for k in CLIMAS}
    art = {k: Counter() for k in CLIMAS}; fon = {k: Counter() for k in CLIMAS}; tot = Counter()
    chave = lambda f: (f["artista"].lower(), re.sub(r"\W+", "", f["titulo"].lower())[:20])
    ordem = {k: sorted(ok, key=lambda i: -sc[k][i]) for k in CLIMAS}
    for rodada in range(N):
        for k in ("gancho", "final", "aula", "fala", "leve"):
            for i in ordem[k]:
                f = fx[i]
                if i in usados or chave(f) in vistos: continue
                lim = 3 if f["fonte"] == "scottbuckley" else 2
                if art[k][f["artista"]] >= lim or fon[k][f["fonte"]] >= N // 2 or tot[f["artista"]] >= 8: continue
                usados.add(i); vistos.add(chave(f)); art[k][f["artista"]] += 1; fon[k][f["fonte"]] += 1; tot[f["artista"]] += 1
                esc[k].append((float(sc[k][i]), i)); break
    por = {k: ordem[k] for k in CLIMAS}
    if "--seco" in sys.argv:
        for k, l in esc.items():
            print("\n==", k, len(por[k]))
            for s, i in l:
                f = fx[i]
                print(f"{s:5.2f} {f['fonte']:12} {f['artista'][:22]:22} {f['titulo'][:40]:40} {f['duracao']:5.0f}s {f['bpm']:4}bpm {f['licenca']}")
        sys.exit()
    FA = AQUI / "faixas"; PV = AQUI / "previas"
    for d in (FA, PV):
        shutil.rmtree(d, ignore_errors=True); d.mkdir()
    cat = []
    for k, l in esc.items():
        (FA / k).mkdir(exist_ok=True)
        for pos, (s, i) in enumerate(l, 1):
            f = fx[i]; arq = FA / k / nome_arq(f)
            br = int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=bit_rate", "-of", "csv=p=0", f["arquivo"]],
                                    capture_output=True, text=True).stdout.strip() or 0)
            if br > 200000:  # 320 kbps vira 192 kbps (sobra qualidade sob a voz e cabe no GitHub)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f["arquivo"], "-map", "0:a", "-b:a", "192k", str(arq)], check=True)
            else:
                shutil.copyfile(f["arquivo"], arq)
            pv = PV / f"{k}-{pos:02d}.mp3"; ini = melhor_trecho(f)
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{ini:.1f}", "-t", "30", "-i", str(arq), "-af",
                            "afade=t=in:d=1.5,afade=t=out:st=27:d=3,loudnorm=I=-16:TP=-1.5", "-ac", "2", "-ar", "44100", "-b:a", "96k", str(pv)], check=True)
            cat.append(dict(clima=k, posicao=pos, nota=round(s, 2), arquivo=str(arq.relative_to(AQUI)), previa=str(pv.relative_to(AQUI)),
                            previa_inicio_s=round(ini, 1),
                            **{x: f.get(x) for x in ("titulo", "artista", "fonte", "licenca", "licenca_url", "pagina",
                                                     "duracao", "bpm", "lufs", "dinamica_db", "intro_s", "tags")},
                            anuncio="livre" if f["licenca"] == "CC0" else "só com crédito visível no anúncio",
                            credito=credito(f)))
    (AQUI / "catalogo.json").write_text(json.dumps(cat, ensure_ascii=False, indent=1))
    md = ["# Catálogo do banco de músicas", "",
          "Gerado por `fonte/seleciona.py`. Todas as faixas são livres para TikTok/Instagram com o crédito abaixo na descrição.",
          "Coluna **anúncio**: CC0 é livre; CC BY só serve em anúncio se o crédito aparecer no próprio anúncio.", ""]
    for k, desc in CLIMAS.items():
        md += [f"## {k}: {desc}", "", "| # | Faixa | Artista | Fonte | Duração | BPM | Licença | Anúncio |", "|---|---|---|---|---|---|---|---|"]
        for c in [c for c in cat if c["clima"] == k]:
            md.append(f"| {c['posicao']} | [{c['titulo']}]({c['arquivo']}) | {c['artista']} | {FONTE_NOME[c['fonte']]} | "
                      f"{int(c['duracao'] // 60)}:{int(c['duracao'] % 60):02d} | {c['bpm']} | {c['licenca']} | {c['anuncio']} |")
        md += ["", "Créditos prontos (copiar para a descrição):", ""]
        md += [f"- {c['posicao']}. {c['credito']}" for c in cat if c["clima"] == k] + [""]
    (AQUI / "CATALOGO.md").write_text("\n".join(md))
    print("banco:", len(cat), "faixas")
