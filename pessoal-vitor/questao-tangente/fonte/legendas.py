# Legendas ASS (1920x1080) a partir de audio/palavras.json, com correções do Whisper. Saída: audio/legendas.ass
import json, re, pathlib
D = pathlib.Path("/mnt/project-files/pessoal-vitor/questao-tangente")
P = json.load(open(D / "audio/palavras.json"))
W = [dict(x) for x in P]
def n(s): return re.sub(r"[^0-9a-zà-ú]", "", s.lower())
# (trecho como o Whisper escreveu, texto certo). Tempo do trecho é dividido entre as palavras novas.
FIX = [
    ("do Elendium 2 .25,", "do ENEM 2025,"),
    ("vasão", "vazão"), ("de joca por", "de água por"),
    ("quanto vale K, P e M?", "quanto vale k, p e m?"),
    ("é a cítata,", "é a assíntota."),
    ("embaixo do ângulo, em cima da tangente,", "embaixo o ângulo, em cima a tangente,"),
    ("é o formato do copo", "e o formato do copo"),
    ("primeiro somar um", "primeiro, somar um número de fora: k mais tangente. Isso soma k em todos os pontos,"),
    ("somasse 30 sobre 30", "somasse 30, sobe 30."),
    ("quando está dentro da 0 em tangente de t menos 2,", "quando o de dentro dá 0. Em tangente de T menos 2,"),
    ("t igual a 2,", "T igual a 2,"),
    ("para a direita menos", "para a direita. Menos"),
    ("menos dentro, direita, mais dentro, esquerda", "Menos dentro, direita; mais dentro, esquerda."),
    ("se esticou d é igual a 1 meio,", "se esticou: p é igual a 1/2."),
    ("d é igual a 30 mais tangente de 1 meio vezes t", "D é igual a 30 mais tangente de 1/2 vezes T"),
    ("menos 5 meios,", "menos 5/2."),
    ("a alternativa é,", "a alternativa é E."),
    ("eliminar a, b e c,", "eliminar A, B e C,"), ("elimina d,", "elimina D."),
    ("o k é o elevador", "o k é o elevador:"),
]
TOK = [n(x["w"]) for x in W]
for errado, certo in FIX:
    alvo = [n(t) for t in errado.split() if n(t)]
    for i in range(len(TOK) - len(alvo) + 1):
        if TOK[i:i + len(alvo)] == alvo:
            j = i + len(alvo); s, e = W[i]["s"], W[j - 1]["e"]
            novas = certo.split()
            if len(novas) > len(alvo) + 2:   # palavras que o Whisper perdeu: ocupam o buraco até a próxima palavra
                e = max(e, W[j]["s"] - 0.05) if j < len(W) else e
            dt = (e - s) / len(novas)
            if len(novas) == len(alvo):   # mesma quantidade: mantém o tempo de cada palavra
                W[i:j] = [{"w": t, "s": W[i + k]["s"], "e": W[i + k]["e"]} for k, t in enumerate(novas)]
            else:
                W[i:j] = [{"w": t, "s": round(s + k * dt, 3), "e": round(s + (k + 1) * dt, 3)} for k, t in enumerate(novas)]
            TOK = [n(x["w"]) for x in W]
            break
    else:
        print("não achei:", errado)
# junta "2 ,5" -> "2,5", troca pi por π, 1/2 por ½
out = []
for x in W:
    t = x["w"].strip()
    if out and re.fullmatch(r"[.,]\d+[,.]?", t) and re.fullmatch(r"\d+", out[-1]["w"]):
        out[-1]["w"] += "," + t.strip(".,")[0:] + ("," if t.endswith(",") else ""); out[-1]["e"] = x["e"]; continue
    t = re.sub(r"^pi([,.]?)$", r"π\1", t); t = t.replace("1/2", "½").replace("5/2", "5/2")
    out.append({"w": t, "s": x["s"], "e": x["e"]})
# blocos: até 6 palavras / 34 caracteres; ao estourar, quebra na última pontuação do bloco; quebra em silêncios
for x in out:
    if x["e"] - x["s"] > 1.0: x["s"] = round(x["e"] - 0.25, 3)   # palavra esticada sobre uma pausa
blocos, cur = [], []
pont = lambda w: re.search(r"[.,?!:;]$", w)
for x in out:
    if cur and x["s"] - cur[-1]["e"] > 0.55:
        blocos.append(cur); cur = []
    if cur and (len(cur) >= 6 or len(" ".join(c["w"] for c in cur + [x])) > 34):
        cortes = [i for i, c in enumerate(cur[:-1]) if pont(c["w"]) and i >= 1]
        if cortes: k = cortes[-1] + 1; blocos.append(cur[:k]); cur = cur[k:]
        else: blocos.append(cur); cur = []
    cur.append(x)
    if re.search(r"[.?!:;]$", x["w"]): blocos.append(cur); cur = []
if cur: blocos.append(cur)
def ts(t):
    h, r = divmod(max(t, 0), 3600); m, s = divmod(r, 60); return f"{int(h)}:{int(m):02d}:{s:05.2f}"
L = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "WrapStyle: 0", "",
     "[V4+ Styles]",
     "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
     "Style: L,Inter SemiBold,54,&H001F1D1D,&H00888888,&H00F7F5F5,&H00000000,0,0,0,0,100,100,0,0,1,6,0,2,80,80,42,1", "",
     "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for i, b in enumerate(blocos):
    s = b[0]["s"]; e = b[-1]["e"] + 0.25
    if i + 1 < len(blocos): e = min(e, blocos[i + 1][0]["s"])
    txt = " ".join(c["w"] for c in b).rstrip(",")
    L.append(f"Dialogue: 0,{ts(s)},{ts(e)},L,,0,0,0,,{txt}")
(D / "audio/legendas.ass").write_text("\n".join(L) + "\n", encoding="utf-8")
json.dump(out, open(D / "audio/palavras_legenda.json", "w"), ensure_ascii=False, indent=0)
print(len(blocos), "legendas")
