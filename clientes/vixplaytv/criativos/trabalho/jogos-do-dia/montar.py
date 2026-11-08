# -*- coding: utf-8 -*-
"""Agenda "Jogos do dia" do CMD remontada na identidade VixPlay TV.
Recorta escudos, emissoras e ligas das artes do CMD (entrada/) e gera artes.html (1080x1440 cada).
Uso: python montar.py  -> depois node shot.js (Playwright) gera saida/*.png"""
import json
from pathlib import Path
from PIL import Image

AQUI = Path(__file__).parent
ENT = AQUI / "entrada"
REC = AQUI / "recortes"
REC.mkdir(exist_ok=True)

DATA = "DOMINGO | 08 DE NOVEMBRO"
# arquivo do CMD, horários na ordem das linhas (artes em ordem de horário)
FUT = [
    ("d1.jpg", ["08H30", "10H00", "11H00", "11H00", "11H00", "11H00"]),
    ("d2.jpg", ["11H00", "11H00", "11H00", "11H30", "12H15", "12H30"]),
    ("d3.jpg", ["12H30", "13H15", "13H15", "13H15", "13H30", "13H30"]),
    ("d4.jpg", ["14H00", "14H30", "14H30", "15H00", "15H30", "16H45"]),
    ("d5.jpg", ["16H45", "17H00", "17H00", "17H30", "17H30"]),
]
UFC_07_11 = ("a6.jpg", [(305, 485, "PESO-PESADO", True), (505, 645, "PESO-PALHA FEMININO", False), (665, 805, "PESO-GALO", False),
                  (825, 965, "PESO MEIO-PESADO", False), (985, 1125, "PESO-GALO FEMININO", False), (1145, 1285, "PESO-MOSCA", False)])


def corta(arq, box, nome):
    Image.open(ENT / arq).convert("RGB").crop(box).save(REC / nome)
    return f"recortes/{nome}"


artes = []
for n, (arq, horas) in enumerate(FUT, 1):
    linhas = []
    for i, h in enumerate(horas):
        y = 303 + 160 * i
        linhas.append({
            "times": corta(arq, (176, y + 5, 552, y + 140), f"f{n}_{i}_t.png"),
            "tv": corta(arq, (679, y + 14, 851, y + 131), f"f{n}_{i}_tv.png"),
            "liga": corta(arq, (858, y + 14, 931, y + 131), f"f{n}_{i}_l.png"),
            "hora": h,
        })
    artes.append({"tipo": "fut", "id": f"futebol-{n}", "linhas": linhas})

UFC = None  # sem UFC neste dia
if UFC:
    arq, rows = UFC
    linhas = []
    for i, (y0, y1, peso, principal) in enumerate(rows):
        linhas.append({
            "lutadores": corta(arq, (176, y0 + 3, 535, y1 - 3), f"u_{i}_t.png"),
            "tv": corta(arq, (703, y0 + (45 if principal else 25), 922, y1 - (45 if principal else 25)), f"u_{i}_tv.png"),
            "hora": "22H00", "peso": peso, "principal": principal,
        })
    artes.append({"tipo": "ufc", "id": "ufc", "linhas": linhas})

(AQUI / "artes.json").write_text(json.dumps({"data": DATA, "artes": artes}, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(artes), "artes")
