"""Peças comuns do editor: pastas do projeto, ffmpeg e leitura/escrita de JSON.

Um projeto é uma pasta com quatro subpastas (originais, assets, projeto, entregas)
e um ESTADO.md. Todos os scripts recebem essa pasta como primeiro argumento.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
EDITOR = AQUI.parent
MODELOS = AQUI / "modelos"
VIDEO_EXT = {".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi"}


class Projeto:
    def __init__(self, raiz: str | Path):
        self.raiz = Path(raiz).expanduser().resolve()
        self.originais = self.raiz / "originais"
        self.assets = self.raiz / "assets"
        self.projeto = self.raiz / "projeto"
        self.entregas = self.raiz / "entregas"

    def arq(self, nome: str) -> Path:
        return self.projeto / nome

    def original(self, nome: str | None = None) -> Path:
        """O vídeo bruto. Sem nome: o único vídeo em originais/ (ou o definido em projeto.json)."""
        if nome:
            p = Path(nome)
            return p if p.is_absolute() else self.originais / p
        cfg = self.config()
        if cfg.get("original"):
            return self.originais / cfg["original"]
        vids = sorted(p for p in self.originais.iterdir() if p.suffix.lower() in VIDEO_EXT)
        if not vids:
            sair(f"nenhum vídeo em {self.originais}")
        if len(vids) > 1:
            sair("há mais de um vídeo em originais/; diga qual com --original NOME")
        return vids[0]

    def config(self) -> dict:
        p = self.arq("projeto.json")
        return ler(p) if p.exists() else {}

    def salvar_config(self, **kv) -> None:
        cfg = self.config()
        cfg.update(kv)
        escrever(self.arq("projeto.json"), cfg)


def ler(p: str | Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def escrever(p: str | Path, dado) -> None:
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(dado, ensure_ascii=False, indent=1), encoding="utf-8")


def sair(msg: str, cod: int = 1):
    print(f"erro: {msg}", file=sys.stderr)
    sys.exit(cod)


def precisa(*progs: str) -> None:
    falta = [p for p in progs if not shutil.which(p)]
    if falta:
        sair("instale antes: " + ", ".join(falta) + " (ver estudio/editor/README.md, seção Instalação)")


def ff(*args: str) -> None:
    precisa("ffmpeg")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def sonda(video: Path) -> dict:
    """Largura, altura, fps e duração do primeiro fluxo de vídeo."""
    precisa("ffprobe")
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate:stream_side_data=rotation:format=duration", "-of", "json", str(video)],
        check=True, capture_output=True, text=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    w, h = s["width"], s["height"]
    rot = 0
    for sd in s.get("side_data_list", []) or []:
        rot = int(sd.get("rotation", 0) or 0)
    if abs(rot) in (90, 270):  # celular gravando em pé com metadado de rotação
        w, h = h, w
    return {"w": w, "h": h, "fps": float(n) / float(d), "dur": float(j["format"]["duration"])}


def audio_16k(video: Path, destino: Path):
    """Extrai o áudio mono 16 kHz que a transcrição e a detecção de pausas usam."""
    import numpy as np
    from scipy.io import wavfile
    ff("-i", str(video), "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(destino))
    sr, a = wavfile.read(destino)
    return sr, a.astype(np.float32) / 32768.0


def tempo(s: float) -> str:
    m, r = divmod(max(0.0, s), 60)
    return f"{int(m):02d}:{r:05.2f}"
