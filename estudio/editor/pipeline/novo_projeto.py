"""Cria a pasta de um projeto de edição, já no formato que os outros scripts esperam.

Uso: python3 novo_projeto.py <pasta> [--video BRUTO.mp4] [--formato 9:16|1:1|4:5|16:9]

<pasta>/
  originais/   o bruto, intocado (nunca é sobrescrito)
  assets/      logos reais, imagens, ícones, músicas licenciadas
  projeto/     tudo que os scripts geram (transcrição, cortes, base, rosto, roteiro visual, revisão)
  entregas/    só os MP4 aprovados
  briefing.md  as 7 respostas antes de editar
  ESTADO.md    feito / próximo passo / comandos para refazer
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from comum import EDITOR, Projeto

BRIEFING = EDITOR / "modelos" / "briefing.md"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pasta")
    ap.add_argument("--video", help="vídeo bruto para copiar para originais/")
    ap.add_argument("--formato", default="9:16")
    a = ap.parse_args()

    pj = Projeto(a.pasta)
    for p in (pj.originais, pj.assets, pj.projeto, pj.entregas):
        p.mkdir(parents=True, exist_ok=True)
    if a.video:
        src = Path(a.video).expanduser()
        dst = pj.originais / src.name
        if not dst.exists():
            shutil.copy2(src, dst)
        pj.salvar_config(original=src.name)
    pj.salvar_config(formato=a.formato)
    if not (pj.raiz / "briefing.md").exists():
        shutil.copy(BRIEFING, pj.raiz / "briefing.md")
    estado = pj.raiz / "ESTADO.md"
    if not estado.exists():
        estado.write_text(
            "# Estado do projeto\n\n## Feito\n- Pasta criada.\n\n## Próximo passo\n"
            "- Preencher briefing.md e rodar a limpeza:\n"
            f"  `python3 {EDITOR}/pipeline/limpar.py {pj.raiz}`\n",
            encoding="utf-8")
    print(f"projeto pronto em {pj.raiz}")


if __name__ == "__main__":
    main()
