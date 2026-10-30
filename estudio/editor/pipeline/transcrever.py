"""Transcreve a fala com o tempo de cada palavra (base de cortes, legendas e animações).

Uso: python3 transcrever.py <projeto> [--entrada base|original] [--modelo large-v3-turbo] [--termos "Remotion,Claude"]
     [--roteiro roteiro.txt] [--motor local|groq]

- local (padrão, grátis): faster-whisper no próprio computador. 'large-v3-turbo' é o melhor custo/qualidade;
  em PC fraco use --modelo small. Primeira vez baixa o modelo (~1,6 GB o turbo, ~0,5 GB o small).
- groq (opcional): API gratuita com limite; precisa de GROQ_API_KEY no ambiente ou em estudio/editor/.env.
O roteiro e os termos só ajudam na GRAFIA (nomes, marcas). A fala real manda: nunca se copia texto do roteiro.

Saída: projeto/transcricao[-base].json  {modelo, idioma, duracao, palavras:[{w,s,e,p}]}  e um .txt legível.
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.request
from pathlib import Path

from comum import EDITOR, Projeto, audio_16k, escrever, sair, tempo


def termos_de(a) -> str:
    t = [x.strip() for x in (a.termos or "").split(",") if x.strip()]
    if a.roteiro:
        txt = Path(a.roteiro).read_text(encoding="utf-8")
        # só palavras com maiúscula/sigla: são os nomes que o Whisper costuma errar
        t += sorted({w.strip(".,;:!?()\"'") for w in txt.split() if w[:1].isupper() and len(w) > 2})[:60]
    return ", ".join(dict.fromkeys(t))


def local(audio, modelo: str, idioma: str, termos: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sair("falta o faster-whisper: python3 -m pip install faster-whisper")
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segs, info = m.transcribe(audio, language=idioma, word_timestamps=True, beam_size=5,
                              initial_prompt=(f"Termos: {termos}." if termos else None),
                              condition_on_previous_text=False)
    pal = []
    for s in segs:
        for w in s.words or []:
            txt = w.word.strip()
            if txt:
                pal.append({"w": txt, "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
    return pal, info.language


def chave_groq() -> str:
    k = os.environ.get("GROQ_API_KEY")
    env = EDITOR / ".env"
    if not k and env.exists():
        for linha in env.read_text().splitlines():
            if linha.startswith("GROQ_API_KEY="):
                k = linha.split("=", 1)[1].strip()
    if not k:
        sair("defina GROQ_API_KEY (ambiente ou estudio/editor/.env) ou use --motor local")
    return k


def groq(wav: Path, idioma: str, termos: str):
    import uuid
    b = uuid.uuid4().hex
    campos = {"model": "whisper-large-v3", "language": idioma, "response_format": "verbose_json",
              "timestamp_granularities[]": "word"}
    if termos:
        campos["prompt"] = f"Termos: {termos}."
    corpo = b""
    for k, v in campos.items():
        corpo += f"--{b}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    corpo += (f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.wav\"\r\n"
              "Content-Type: audio/wav\r\n\r\n").encode() + wav.read_bytes() + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request("https://api.groq.com/openai/v1/audio/transcriptions", data=corpo, headers={
        "Authorization": f"Bearer {chave_groq()}", "Content-Type": f"multipart/form-data; boundary={b}"})
    j = json.loads(urllib.request.urlopen(req, timeout=300).read())
    pal = [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3), "p": 1.0}
           for w in j.get("words", []) if w["word"].strip()]
    return pal, idioma


def legivel(pal: list[dict]) -> str:
    linhas, cur, ini = [], [], None
    for w in pal:
        if ini is None:
            ini = w["s"]
        cur.append(w["w"])
        if w["w"][-1:] in ".?!" or len(cur) >= 14:
            linhas.append(f"[{tempo(ini)}–{tempo(w['e'])}] {' '.join(cur)}")
            cur, ini = [], None
    if cur:
        linhas.append(f"[{tempo(ini)}–{tempo(pal[-1]['e'])}] {' '.join(cur)}")
    return "\n".join(linhas) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--entrada", default="original", choices=["original", "base"])
    ap.add_argument("--original")
    ap.add_argument("--modelo", default="large-v3-turbo")
    ap.add_argument("--idioma", default="pt")
    ap.add_argument("--termos")
    ap.add_argument("--roteiro")
    ap.add_argument("--motor", default="local", choices=["local", "groq"])
    a = ap.parse_args()

    pj = Projeto(a.projeto)
    video = pj.arq("base.mp4") if a.entrada == "base" else pj.original(a.original)
    suf = "-base" if a.entrada == "base" else ""
    wav = pj.arq(f"audio16k{suf}.wav")
    sr, audio = audio_16k(video, wav)
    termos = termos_de(a)
    pal, idioma = local(audio, a.modelo, a.idioma, termos) if a.motor == "local" else groq(wav, a.idioma, termos)
    if not pal:
        sair("nenhuma fala encontrada")
    escrever(pj.arq(f"transcricao{suf}.json"), {"fonte": video.name, "motor": a.motor,
             "modelo": a.modelo if a.motor == "local" else "whisper-large-v3", "idioma": idioma,
             "duracao": round(len(audio) / sr, 3), "termos": termos, "palavras": pal})
    pj.arq(f"transcricao{suf}.txt").write_text(legivel(pal), encoding="utf-8")
    duvidas = [w for w in pal if w["p"] < 0.5]
    print(f"{len(pal)} palavras; {len(duvidas)} com baixa confiança"
          + (": " + ", ".join(f"{w['w']}@{w['s']:.1f}s" for w in duvidas[:12]) if duvidas else ""))


if __name__ == "__main__":
    main()
