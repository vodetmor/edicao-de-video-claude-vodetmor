"""Render da FINAL em pedaços, com pouca memória e retomada automática.

Por quê: o render inteiro com 12 processos encheu a RAM do PC (15,5 GB) e foi morto.
Aqui cada pedaço abre e fecha o navegador (libera a memória), roda com poucos processos,
e se um pedaço falhar ele é refeito sozinho com menos processos. Pedaço pronto é pulado.

Uso: python render_pedacos.py [--escala 1] [--tam 600] [--conc 2] [--so 3,7]
Saída: trabalho/previa/pedacos/p000.mp4 ... + audio.wav -> trabalho/previa/final-v1-bruto.mp4
"""
import argparse
import ctypes
import json
import os
import subprocess
import sys
import time

BASE = "C:/dev/maquina-de-editar"
MOTOR = f"{BASE}/estudio/motor"
PREVIA = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/previa"
FPS = 30

ap = argparse.ArgumentParser()
ap.add_argument("--escala", type=float, default=1.0)
ap.add_argument("--tam", type=int, default=600)
ap.add_argument("--conc", type=int, default=2)
ap.add_argument("--so", default="")
ap.add_argument("--saida", default="final-v1-bruto.mp4")
ap.add_argument("--pasta", default="pedacos", help="pasta dos pedaços dentro de previa/ (cada versão tem a sua)")
ap.add_argument("--orcamento", type=int, default=0, help="segundos: depois disso não começa pedaço novo e sai com código 3 (rodar de novo continua)")
a = ap.parse_args()

PED = f"{PREVIA}/{a.pasta}" + ("" if a.escala == 1 else f"-{a.escala}")
os.makedirs(PED, exist_ok=True)
LOG = open(f"{PED}/render.log", "a", encoding="utf8")


def log(*x):
    s = time.strftime("%H:%M:%S ") + " ".join(str(i) for i in x)
    print(s, flush=True)
    LOG.write(s + "\n")
    LOG.flush()


class MEM(ctypes.Structure):
    _fields_ = [("l", ctypes.c_ulong), ("load", ctypes.c_ulong), ("tot", ctypes.c_ulonglong), ("livre", ctypes.c_ulonglong),
                ("a", ctypes.c_ulonglong), ("b", ctypes.c_ulonglong), ("c", ctypes.c_ulonglong), ("d", ctypes.c_ulonglong), ("e", ctypes.c_ulonglong)]


def livre_mb():
    m = MEM()
    m.l = ctypes.sizeof(MEM)
    ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
    return m.livre // 2**20


def limpar():
    """Mata sobras do render (navegador sem cabeça e compositor) para devolver memória."""
    for nome in ("chrome-headless-shell.exe", "remotion.exe"):
        subprocess.run(["taskkill", "/F", "/IM", nome], capture_output=True)
    time.sleep(3)


def esperar_memoria(minimo=900, limite=180):
    t = time.time()
    while livre_mb() < minimo and time.time() - t < limite:
        time.sleep(10)
    return livre_mb()


def quadros(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", p], capture_output=True, text=True)
    try:
        return int(r.stdout.strip().split(",")[0])
    except Exception:
        return -1


def npx(args):
    return subprocess.run("npx remotion render src/index.ts Final " + args, cwd=MOTOR, shell=True, capture_output=True, text=True, encoding="utf8", errors="replace")


plano = json.load(open(f"{MOTOR}/src/obras/terceirao/plano.json", encoding="utf8"))
TOTAL = round(plano["duracao"] * FPS)
partes = [(i, ini, min(ini + a.tam, TOTAL) - 1) for i, ini in enumerate(range(0, TOTAL, a.tam))]
so = {int(x) for x in a.so.split(",") if x.strip()}
log(f"total {TOTAL} quadros, {len(partes)} pedaços de {a.tam}, escala {a.escala}, conc {a.conc}, livre {livre_mb()} MB")

falhou = []
INICIO = time.time()
for i, ini, fim in partes:
    dst = f"{PED}/p{i:03d}.mp4"
    n = fim - ini + 1
    if so and i in so and os.path.exists(dst):
        os.remove(dst)
    if os.path.exists(dst) and quadros(dst) == n:
        continue
    if a.orcamento and time.time() - INICIO > a.orcamento:
        feitos = sum(1 for j, _, _ in partes if os.path.exists(f"{PED}/p{j:03d}.mp4"))
        log(f"CONTINUAR: {feitos}/{len(partes)} pedaços prontos")
        sys.exit(3)
    ok = False
    for tentativa, conc in enumerate([a.conc, max(1, a.conc - 1), 1, 1]):
        limpar()
        mem = esperar_memoria()
        t0 = time.time()
        tmp = f"{PED}/p{i:03d}.tmp.mp4"
        r = npx(f'"{tmp}" --frames={ini}-{fim} --muted --scale={a.escala} --concurrency={conc} '
                f"--gl=angle --offthreadvideo-cache-size-in-bytes=268435456 --crf=17 --timeout=180000 --log=error")
        q = quadros(tmp) if os.path.exists(tmp) else -1
        if r.returncode == 0 and q == n:
            os.replace(tmp, dst)
            log(f"pedaço {i:02d} ok ({ini}-{fim}) conc {conc} em {time.time() - t0:.0f}s, livre antes {mem} MB")
            ok = True
            break
        log(f"pedaço {i:02d} FALHOU tentativa {tentativa + 1} (rc {r.returncode}, quadros {q}/{n}): {(r.stderr or r.stdout)[-400:]}")
    if not ok:
        falhou.append(i)

limpar()
if falhou:
    log("PEDAÇOS COM FALHA:", falhou)
    sys.exit(1)

# áudio da composição inteira (um só arquivo: sem emenda audível entre os pedaços)
wav = f"{PED}/audio.wav"
if not os.path.exists(wav) or so:
    for conc in (a.conc, 1, 1):
        limpar()
        esperar_memoria()
        r = npx(f'"{wav}" --concurrency={conc} --gl=angle --timeout=180000 --log=error')
        if r.returncode == 0 and os.path.exists(wav):
            log("áudio ok")
            break
        log("áudio FALHOU:", (r.stderr or r.stdout)[-400:])
    else:
        sys.exit(1)

lista = f"{PED}/lista.txt"
open(lista, "w", encoding="utf8").write("".join(f"file 'p{i:03d}.mp4'\n" for i, _, _ in partes))
saida = f"{PREVIA}/{a.saida}"
r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-i", wav, "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", saida], capture_output=True, text=True)
if r.returncode:
    log("JUNÇÃO FALHOU:", r.stderr[-400:])
    sys.exit(1)
log(f"PRONTO {saida} quadros {quadros(saida)}/{TOTAL}")
