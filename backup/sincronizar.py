"""Salvamento contínuo do projeto no GitHub do Vítor (vodetmor/edicao-de-video-claude-vodetmor).

Uso:  python3 /mnt/project-files/backup/sincronizar.py [--seco]
  --seco  só mostra o que entraria e o tamanho, sem commit nem push.

O que faz:
  1. Pega a versão mais nova do repositório (outras conversas também salvam nele).
  2. Copia o projeto organizado em núcleo / pessoal-vitor / clientes / outros (MAPA abaixo).
     Nunca apaga nada no repositório: arquivo removido aqui continua salvo lá.
  3. Código, textos e mídia leve entram direto. Vídeo entregue grande (> 90 MB) entra em partes
     de 90 MB (juntar com backup/juntar_partes.py). Mídia bruta pesada e caches ficam fora.
  4. Procura chaves e senhas; se achar, para sem enviar nada.
  5. Commit e push, em lotes por pasta.
Rode depois de cada entrega. Uma rotina diária também roda sozinha.
"""
import fnmatch, hashlib, json, os, re, shutil, subprocess, sys, tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

P = Path("/mnt/project-files"); B = P / "backup"; K = B / "kit"
REPO_URL = "https://github.com/vodetmor/edicao-de-video-claude-vodetmor"
R = Path(os.environ.get("REPO_DIR", "/home/user/edicao-de-video-claude-vodetmor"))
SECO = "--seco" in sys.argv
AGORA = datetime.now(ZoneInfo("America/Sao_Paulo"))

# origem no projeto -> destino no repositório
MAPA = [
    ("motion-base", "motion-base"), ("estudio", "estudio"), ("ferramentas", "ferramentas"),
    ("organizacao", "organizacao"), ("pesquisa", "pesquisa"), ("skills", ".claude/skills"),
    ("edicao/resumo-conversa-edicao.md", "pesquisa/resumo-conversa-edicao.md"),
    ("COMO-USAR.txt", "pc/COMO-USAR-flow.txt"),
    ("pessoal-vitor", "pessoal-vitor"),
    ("escola-consciencia-negra", "pessoal-vitor/escola-consciencia-negra"),
    ("anuncio-vslplay", "clientes/vslplay/anuncio-vslplay"),
    ("criativos-vslplay", "clientes/vslplay/criativos-vslplay"),
    ("vinheta-life", "outros/vinheta-life"),
    ("motion-demo", "laboratorio/motion-demo"),
    # o "cérebro" (mantido em backup/kit)
    ("backup/kit/CLAUDE.md", "CLAUDE.md"), ("backup/kit/LEIA-ME.md", "LEIA-ME.md"),
    ("backup/kit/gitignore", ".gitignore"), ("backup/kit/skills", ".claude/skills"),
    ("backup/kit/memoria", "memoria"), ("backup/kit/historico", "historico"),
    ("backup/sincronizar.py", "backup/sincronizar.py"), ("backup/juntar_partes.py", "backup/juntar_partes.py"),
    ("backup/exportar_historico.py", "backup/exportar_historico.py"),
]
# pastas e arquivos que nunca entram
FORA = ["node_modules", "__pycache__", ".cache", ".git", "out", "frames", "vchunks", "resultados",
        ".env", "*.env", "chaves.env", "*.key", "*.pem", "credentials*", "*.lock.json.bak"]
MIDIA = {".mp4", ".mov", ".mkv", ".webm", ".wav", ".mp3", ".ogg", ".m4a", ".flac", ".aac", ".zip",
         ".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".psd", ".blend"}
LEVE = 25e6          # mídia final até 25 MB entra sempre
BRUTO_LEVE = 2e6     # dentro de trabalho/acervo/renders só entra mídia pequena
PARTE = 90 * 2**20   # GitHub recusa arquivo > 100 MB
SEGREDO = re.compile(rb"apify_api_[A-Za-z0-9]{10,}|TWITTER_(AUTH_TOKEN|CT0)[ \t]*=[ \t]*[A-Za-z0-9]{10,}|"
                     rb"(API_KEY|CLIENT_ID|CLIENT_SECRET|SECRET|TOKEN)[A-Z_]*[ \t]*=[ \t]*['\"]?[A-Za-z0-9]{8,}|"
                     rb"-----BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{30,}|xox[bp]-[0-9]{6,}")

def git(*a, check=True, saida=False):
    r = subprocess.run(["git", "-C", str(R), *a], capture_output=True, text=True)
    if check and r.returncode:
        raise SystemExit(f"git {' '.join(a)} falhou:\n{r.stderr[-2000:]}")
    return r.stdout if saida else r

def fora(rel):
    partes = rel.split("/")
    return any(fnmatch.fnmatch(x, p) for x in partes for p in FORA)

# entregas redundantes (as partes já estão dentro do vídeo final)
REDUNDANTE = ["escola-consciencia-negra/parte*.mp4"]

def entra(src, rel):
    """Decide se um arquivo entra e como: 'copia', 'partes' ou None."""
    if fora(rel) or any(fnmatch.fnmatch(rel, p) for p in REDUNDANTE): return None
    tam = src.stat().st_size
    ext = src.suffix.lower()
    if ext not in MIDIA: return "copia" if tam < PARTE else "partes"
    bruto = any(x in rel.split("/") for x in ("trabalho", "acervo", "brutos", "renders", "stems", "uploads", "public", "v1",
                                                  "media", "audio", "musica", "assets", "referencia"))
    if bruto: return "copia" if tam <= BRUTO_LEVE else None   # bruto: só miniaturas, logos e sons curtos
    if tam <= LEVE: return "copia"
    if ext == ".zip": return None                       # pacotes grandes = cópias de outras pastas
    return "copia" if tam < PARTE else "partes"         # entrega final: sempre entra

def plano():
    itens = {}
    for o, d in MAPA:
        src = P / o
        if src.is_file():
            itens[d] = (src, "copia"); continue
        if not src.is_dir(): continue
        for raiz, dirs, arqs in os.walk(src):
            dirs[:] = [x for x in dirs if not fora(x)]
            for a in arqs:
                f = Path(raiz) / a
                rel = f.relative_to(src).as_posix()
                modo = entra(f, f"{o}/{rel}")
                if modo: itens[f"{d}/{rel}"] = (f, modo)
    return itens

def igual(src, dst):
    return dst.exists() and dst.stat().st_size == src.stat().st_size and \
        hashlib.md5(dst.read_bytes()).digest() == hashlib.md5(src.read_bytes()).digest()

def aplica(itens):
    mud = []
    idx_partes = {}
    for d, (src, modo) in sorted(itens.items()):
        dst = R / d
        if modo == "copia":
            if igual(src, dst): continue
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst); mud.append(d)
        else:
            h = hashlib.md5(); n = 0
            with open(src, "rb") as fh:
                while (bloco := fh.read(PARTE)):
                    h.update(bloco); n += 1
            idx_partes[d] = {"partes": n, "md5": h.hexdigest(), "bytes": src.stat().st_size}
            marca = R / (d + ".partes.json")
            if marca.exists() and json.loads(marca.read_text()).get("md5") == h.hexdigest(): continue
            dst.parent.mkdir(parents=True, exist_ok=True)
            with open(src, "rb") as fh:
                for i in range(1, n + 1):
                    (R / f"{d}.parte-{i:03d}").write_bytes(fh.read(PARTE)); mud.append(f"{d}.parte-{i:03d}")
            marca.write_text(json.dumps(idx_partes[d], indent=1)); mud.append(d + ".partes.json")
    return mud

def checa_segredos(mud):
    ruins = []
    for d in mud:
        f = R / d
        if f.suffix.lower() in MIDIA or ".parte-" in f.name: continue
        try:
            if SEGREDO.search(f.read_bytes()): ruins.append(d)
        except Exception: pass
    return ruins

def main():
    if not (R / ".git").exists():
        subprocess.run(["git", "clone", "--depth", "1", REPO_URL, str(R)], check=True)
    git("fetch", "--depth", "50", "origin", "main")
    git("reset", "--hard", "origin/main")   # o clone é só um espelho: o projeto é a fonte
    # memória do projeto sempre fresca no kit
    mem = Path(os.environ.get("MEMORIA_DIR", "/tmp/claude/memory/team/silo"))
    if list(mem.glob("*.md")):
        (K / "memoria").mkdir(parents=True, exist_ok=True)
        for f in mem.glob("*.md"): shutil.copy2(f, K / "memoria" / f.name)
    itens = plano()
    if SECO:
        tot = sum(s.stat().st_size for s, _ in itens.values())
        print(f"{len(itens)} arquivos, {tot/1e6:.0f} MB no total (antes do Git comprimir)")
        por = {}
        for d, (s, _) in itens.items():
            k = "/".join(d.split("/")[:2]); por[k] = por.get(k, 0) + s.stat().st_size
        for k, v in sorted(por.items(), key=lambda x: -x[1])[:25]: print(f"{v/1e6:8.1f} MB  {k}")
        return
    mud = aplica(itens)
    ruins = checa_segredos(mud)
    if ruins:
        git("reset", "--hard", "origin/main")
        raise SystemExit("PAREI: possível chave/senha em:\n  " + "\n  ".join(ruins))
    if not mud:
        print("Nada novo para salvar."); return
    # 1º: um commit por pasta de topo (lotes menores de envio)
    grupos = {}
    for d in mud: grupos.setdefault(d.split("/")[0], []).append(d)
    carimbo = AGORA.strftime("%Y-%m-%d %H:%M")
    feitos = 0
    for g, lista in grupos.items():
        for i in range(0, len(lista), 400):
            git("add", "--", *lista[i:i + 400])
        if not git("diff", "--cached", "--quiet", check=False).returncode: continue
        git("commit", "-q", "-m", f"Backup automático {carimbo}: {g} ({len(lista)} arquivos)"); feitos += 1
    # 2º: envia commit a commit; se outra conversa salvou no meio, junta (o projeto vence) e segue
    for _ in range(5):
        git("fetch", "--depth", "50", "origin", "main")
        if git("rebase", "-X", "theirs", "origin/main", check=False).returncode:
            git("rebase", "--abort", check=False); raise SystemExit("não consegui juntar com o GitHub")
        pend = git("rev-list", "--reverse", "origin/main..HEAD", saida=True).split()
        ok = True
        for c in pend:
            r = git("push", "-q", "origin", f"{c}:refs/heads/main", check=False)
            if r.returncode:
                ok = False; break
        if ok: break
    else:
        raise SystemExit(f"push falhou:\n{r.stderr[-1500:]}")
    print(f"salvo no GitHub: {feitos} lotes, {len(mud)} arquivos")
    (B / "ULTIMO-SALVAMENTO.txt").write_text(f"{carimbo} · {len(mud)} arquivos enviados ao GitHub\n")

main()
