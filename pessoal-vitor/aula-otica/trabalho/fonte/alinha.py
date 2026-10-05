# Alinha palavras com tempo (Whisper ou edge-tts) às palavras do roteiro, por índice.
# Uso: python3 alinha.py <audio.mp3> [--edge palavras_edge.json]
# Saída: audio/palavras_ok.json = [{i, w, s, e}] com i = índice da palavra no roteiro (split por espaço).
import json, re, sys, unicodedata, difflib
D = "/mnt/project-files/pessoal-vitor/aula-otica/trabalho"
ROT = open(f"{D}/roteiro/ROTEIRO-ELEVENLABS.txt", encoding="utf-8").read().split()
def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)
audio = sys.argv[1]
if "--edge" in sys.argv:
    src = json.load(open(sys.argv[sys.argv.index("--edge") + 1]))
elif "--raw" in sys.argv:  # reaproveita a transcrição já feita
    src = json.load(open(f"{D}/audio/whisper_raw.json"))
else:
    # sem o roteiro no prompt: com ele o Whisper pulou o primeiro trecho inteiro (05/10)
    from faster_whisper import WhisperModel
    m = WhisperModel("medium", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, initial_prompt="Refração, lei de Snell, seno de téta, ene igual a cê sobre vê, ângulo limite, fibra óptica, dispersão.")
    src = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    json.dump(src, open(f"{D}/audio/whisper_raw.json", "w"), ensure_ascii=False)
# Whisper escreve números com dígitos ("0 ,8", "N1", "225"): expande por extenso para casar com o roteiro
UN = "zero um dois tres quatro cinco seis sete oito nove dez onze doze treze quatorze quinze dezesseis dezessete dezoito dezenove".split()
DZ = "_ _ vinte trinta quarenta cinquenta sessenta setenta oitenta noventa".split()
CT = "_ cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos".split()
def extenso(n):
    if n < 20: return UN[n]
    if n < 100: return DZ[n // 10] + ("" if n % 10 == 0 else " e " + UN[n % 10])
    if n == 100: return "cem"
    if n < 1000: return CT[n // 100] + ("" if n % 100 == 0 else " e " + extenso(n % 100))
    return ("" if n // 1000 == 1 else extenso(n // 1000) + " ") + "mil" + ("" if n % 1000 == 0 else " e " + extenso(n % 1000))
def expande(w):
    m = re.fullmatch(r"([nN])(\d+)([.,;:?!]*)", w)
    if m: return "ene " + extenso(int(m.group(2)))
    if w in ("n", "N"): return "ene"
    m = re.fullmatch(r",(\d+)([.,;:?!]*)", w)
    if m: return "vírgula " + extenso(int(m.group(1)))
    m = re.fullmatch(r"(\d+)([.,;:?!]*)", w)
    if m: return extenso(int(m.group(1)))
    return w
if src and "--edge" not in sys.argv:
    for k in range(len(src) - 1, 0, -1):  # "arco -íris" -> uma palavra
        if src[k]["w"].startswith("-"): src[k - 1] = {"w": src[k - 1]["w"] + src[k]["w"], "s": src[k - 1]["s"], "e": src[k]["e"]}; del src[k]
    src = [dict(x, w=expande(x["w"])) for x in src]
# palavras do Whisper podem juntar/separar; quebra em tokens normalizados
A = []
for x in src:
    parts = [p for p in re.split(r"\s+", x["w"]) if norm(p)]
    n = max(1, len(parts)); dur = (x["e"] - x["s"]) / n
    for k, p in enumerate(parts): A.append({"w": norm(p), "s": x["s"] + k * dur, "e": x["s"] + (k + 1) * dur})
rn = [norm(w) for w in ROT]
sm = difflib.SequenceMatcher(None, rn, [a["w"] for a in A], autojunk=False)
tm = [None] * len(ROT)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): tm[blk.a + k] = (A[blk.b + k]["s"], A[blk.b + k]["e"])
# trechos sem par: distribui entre os vizinhos conhecidos
i = 0
while i < len(ROT):
    if tm[i] is None:
        j = i
        while j < len(ROT) and tm[j] is None: j += 1
        a = tm[i - 1][1] if i > 0 else 0.0
        b = tm[j][0] if j < len(ROT) else a + 0.35 * (j - i)
        step = (b - a) / (j - i)
        for k in range(i, j): tm[k] = (a + (k - i) * step, a + (k - i + 1) * step)
        print("sem par:", " ".join(ROT[i:j]))
        i = j
    else: i += 1
out = [{"i": k, "w": ROT[k], "s": round(tm[k][0], 3), "e": round(tm[k][1], 3)} for k in range(len(ROT))]
json.dump(out, open(f"{D}/audio/palavras_ok.json", "w"), ensure_ascii=False, indent=0)
print(len(out), "palavras; fim em", out[-1]["e"])
