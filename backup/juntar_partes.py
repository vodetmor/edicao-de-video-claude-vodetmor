"""Junta os vídeos grandes que foram salvos em partes no GitHub (arquivo.parte-001, -002...).
Uso: python3 backup/juntar_partes.py   (rode na raiz do repositório)"""
import hashlib, json
from pathlib import Path
for m in Path(".").rglob("*.partes.json"):
    info = json.loads(m.read_text()); alvo = Path(str(m)[: -len(".partes.json")])
    h = hashlib.md5()
    with open(alvo, "wb") as out:
        for i in range(1, info["partes"] + 1):
            b = Path(f"{alvo}.parte-{i:03d}").read_bytes(); out.write(b); h.update(b)
    print(alvo, "ok" if h.hexdigest() == info["md5"] else "ERRO: conferência falhou")
