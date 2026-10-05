"""Trata e emenda as vozes das partes só-áudio (3 Cainã, 4 Luísa, 5 Anna Augusta, 7 Anna Júlia).
Pausas longas são encurtadas cortando só o MEIO do silêncio, com crossfade de potência igual de 60 ms
(nada de corte seco que "trava"). Gera public/pN/voz.wav e public/pN/words.json no relógio da parte.
Uso: python3 audio/voz_partes.py [3 4 5 7]"""
import json, subprocess, sys, os, numpy as np, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
T = "/mnt/project-files/escola-consciencia-negra/trabalho"
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.join(HERE, "..", "public")
SR = 48000
COMP = "deesser=i=0.35,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=2"

PARTES = {
    2: dict(nome="02-Maria-Eduarda", chain="highpass=f=80,afftdn=nf=-42:nr=10," + COMP + ",equalizer=f=3200:t=q:w=1:g=1.5",
            fim=78.3, gap_alvo={15.06: 1.2, 73.62: 1.5}, remover_palavras=(53.7, 54.43),
            fix={"Harry": "Warren", "Country": "County", "Chaves": "Chavis"}),
    3: dict(nome="03-Caina-Farias", chain="highpass=f=80," + COMP + ",equalizer=f=3200:t=q:w=1:g=1.5",
            fim=71.55, gap_alvo={2.50: 1.45, 61.02: 2.6},
            fix={"Cainan": "Cainã"}),
    4: dict(nome="04-Luisa-Brasil", chain="highpass=f=80,afftdn=nf=-45:nr=10," + COMP,
            fim=62.6, silenciar=[(11.33, 11.52), (55.08, 56.21)], remover_palavras=(55.3, 56.381), inserir=[dict(w='E', s=56.24, e=56.38)],
            fix={"Luisa": "Luísa"}),
    5: dict(nome="05-Anna-Augusta", chain="adeclip,highpass=f=80,afftdn=nf=-45:nr=10," + COMP,
            fim=54.98, remover_palavras=(54.9, 99),
            fix={"Ana": "Anna", "arte": "ar"}),
    6: dict(nome="06-Maria-Alice", chain="highpass=f=80," + COMP + ",equalizer=f=3200:t=q:w=1:g=1.5",
            fim=58.4, remover_palavras=(58.5, 99), fix={"porque": "por que"}),
    7: dict(nome="07-Anna-Julia-Dias", chain="highpass=f=90,afftdn=nf=-40:nr=14," + COMP + ",equalizer=f=3000:t=q:w=1:g=2",
            fim=51.4, gap_alvo={7.26: 1.95},
            fix={}),
}
LIMIAR = 0.95   # pausas maiores que isto são encurtadas
ALVO = 0.78     # para esta duração (a não ser que gap_alvo diga outra coisa)
XF = int(0.06 * SR)

def ff(x, chain):
    return np.frombuffer(subprocess.run([FF, "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", chain,
                                         "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout,
                         np.float32).copy()

def lufs(x):
    p = subprocess.run([FF, "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float([l for l in p.splitlines() if l.strip().startswith("I:")][-1].split()[1])

def rms_db(s):
    return 20 * np.log10(np.sqrt((s.astype(np.float64) ** 2).mean()) + 1e-9)

def parte(n):
    P = PARTES[n]
    raw = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", f"{T}/audio/{P['nome']}.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                       capture_output=True, check=True).stdout, np.float32).copy()
    for a, b in P.get("silenciar", []):           # estalo: troca por silêncio com rampas curtas
        i, j = int(a * SR), int(b * SR); r = int(0.005 * SR)
        raw[i:j] = 0; raw[i - r:i] *= np.linspace(1, 0, r); raw[j:j + r] *= np.linspace(0, 1, r)
    x = ff(raw, P["chain"])
    x *= 10 ** ((-16.0 - lufs(x)) / 20)

    ws = [dict(w=w["w"].strip(), s=w["s"], e=w["e"]) for s in json.load(open(f"{T}/transcricoes/{P['nome']}.json")) for w in s["words"]]
    if "remover_palavras" in P:
        a, b = P["remover_palavras"]; ws = [w for w in ws if not (a <= w["s"] and w["e"] <= b)]
    ws = sorted([w for w in ws if w["s"] < P["fim"]] + P.get("inserir", []), key=lambda w: w["s"])
    # junta "Trata" + "-se"
    out_ws = []
    for w in ws:
        if w["w"].startswith("-") and out_ws:
            out_ws[-1]["w"] += w["w"]; out_ws[-1]["e"] = w["e"]
        else:
            out_ws.append(w)
    ws = out_ws

    # pausas: a borda vem da ENERGIA (o Whisper marca o fim da palavra cedo demais), não do Whisper.
    # Dentro de cada pausa acha a maior corrida de janelas de 20 ms abaixo de -42 dB e mexe só nela.
    J = int(0.02 * SR)
    def silencio(a, b):
        ia, ib = int(a * SR), int(b * SR)
        e = [rms_db(x[i:i + J]) < -42 for i in range(ia, ib - J, J)]
        best, run, st = (0, 0), 0, 0
        for k, q in enumerate(e):
            if q:
                if run == 0: st = k
                run += 1
                if run > best[1] - best[0]: best = (st, k + 1)
            else:
                run = 0
        return a + best[0] * J / SR, a + best[1] * J / SR
    ini = max(0.0, ws[0]["s"] - 0.3)
    pecas = []; cur = ini
    for k in range(1, len(ws)):
        g0, g1 = ws[k - 1]["e"], ws[k]["s"]
        if g1 - g0 < 0.3:
            continue
        s0, s1 = silencio(g0 - 0.1, g1 + 0.05)
        L = s1 - s0
        alvo = P.get("gap_alvo", {}).get(round(g0, 2))
        if alvo is None:
            if L <= LIMIAR: continue
            alvo = ALVO
        if alvo >= L:        # estender com tom de sala no meio do silêncio
            m = (s0 + s1) / 2
            pecas.append((cur, m)); pecas.append(("sala", alvo - L)); cur = m
            continue
        h = alvo / 2
        pecas.append((cur, s0 + h)); cur = s1 - h
    pecas.append((cur, min(P["fim"], ws[-1]["e"] + 0.7)))

    # tom de sala: o trecho mais quieto de 1 s antes da primeira fala (ou zeros)
    sala = x[int(0.2 * SR):int(max(0.3, ws[0]["s"] - 0.2) * SR)]
    if len(sala) < SR // 2:
        sala = np.zeros(SR, np.float32)

    lead = 0.5  # respiro antes da primeira fala
    y = np.zeros(int(lead * SR), np.float32)
    mapa = []  # (fonte_a, fonte_b, destino_a)
    for p in pecas:
        if p[0] == "sala":
            need = int(p[1] * SR) + XF
            seg = np.resize(sala, need).astype(np.float32)
            src = None
        else:
            a, b = p; seg = x[int(a * SR):int(b * SR)].copy(); src = (a, b)
        if len(y) > XF:
            fade = np.linspace(0, np.pi / 2, XF)
            head = seg[:XF] * np.sin(fade); tail = y[-XF:] * np.cos(fade)
            dest = (len(y) - XF) / SR
            y = np.concatenate([y[:-XF], tail + head, seg[XF:]])
        else:
            dest = len(y) / SR
            seg[:XF] *= np.linspace(0, 1, XF); y = np.concatenate([y, seg])
        if src: mapa.append((src[0], src[1], dest))
    r = int(0.3 * SR); y[-r:] *= np.linspace(1, 0, r)

    def t_out(t):
        for a, b, d in mapa:
            if a - 0.001 <= t <= b + 0.001:
                return d + (t - a)
        best = min(mapa, key=lambda m: min(abs(t - m[0]), abs(t - m[1])))
        return best[2] + (min(max(t, best[0]), best[1]) - best[0])

    words = []
    for w in ws:
        txt = P["fix"].get(w["w"].rstrip(",.?"), None)
        wtxt = (txt + w["w"][len(w["w"].rstrip(",.?")):]) if txt else w["w"]
        words.append({"w": wtxt, "s": round(t_out(w["s"]), 3), "e": round(t_out(w["e"]), 3)})
    if n == 5:  # "ar de qualidade" (Whisper leu "arte e")
        for i, w in enumerate(words):
            if w["w"] == "ar" and words[i + 1]["w"] == "e": words[i + 1]["w"] = "de"

    d = os.path.join(PUB, f"p{n}"); os.makedirs(d, exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af",
                    "volume=-3dB,alimiter=limit=0.79:attack=4:release=60:level=disabled", "-c:a", "pcm_s24le", f"{d}/voz.wav"],
                   input=y.astype(np.float32).tobytes(), check=True)
    json.dump(words, open(f"{d}/words.json", "w"), ensure_ascii=False, indent=0)
    print(f"parte {n}: {len(y) / SR:.2f} s (fonte {P['fim']:.1f} s), {len(words)} palavras, pico {20 * np.log10(np.abs(y).max()):.1f} dB")

for n in [int(a) for a in sys.argv[1:]] or [3, 4, 5, 6, 7]:
    parte(n)
