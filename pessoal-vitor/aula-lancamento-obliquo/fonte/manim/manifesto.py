# Lista as cenas do Manim (quadro inicial no vídeo + nº de quadros) para o Remotion: /root/aula/src/data/manim.json
import json, os, importlib.util, sys
sys.argv = ["x"]
spec = importlib.util.spec_from_file_location("aula", os.path.join(os.path.dirname(__file__), "aula.py")); a = importlib.util.module_from_spec(spec); spec.loader.exec_module(a)
out = {}
for nome in ["Comp", "Mru", "Muv", "Trajetoria", "Tempo", "Altura", "Alcance", "Max45", "Compl", "Resumo"]:
    d = f"/root/aula/public/manim/{nome}"
    if os.path.exists(d + "/done"): out[nome] = {"ini": getattr(a, nome).INI, "n": len([x for x in os.listdir(d) if x.endswith(".png")])}
json.dump(out, open("/root/aula/src/data/manim.json", "w"), indent=1)
print(out)
