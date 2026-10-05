"""Converte exports JSON de conversas do projeto (historico-bruto/*.txt) em Markdown legível,
apagando segredos (tokens, chaves). Uso: python3 exportar_historico.py <pasta_bruta> <saida>"""
import json, re, sys, pathlib

SEGREDO = [
    re.compile(r"apify_api_[A-Za-z0-9]+"),
    re.compile(r"\b(sk|xi|pk)[-_][A-Za-z0-9_\-]{16,}"),
    # qualquer sequência longa tipo chave, exceto ids do projeto
    re.compile(r"(?<![A-Za-z0-9_/\-.])(?!cmsg_|cse_|chan_|session_|user_|env_)[A-Za-z0-9_\-]{20,}(?![A-Za-z0-9_/\-.])"),
    re.compile(r"(?i)\b[0-9a-f]{8}\b(?=\s*\n\s*\n\s*Client Secret)"),
]

CREDENCIAL = re.compile(r'(?is)("domain"\s*:.*"value"\s*:)|auth_token|\bct0\b|client secret|api ?key\W{0,3}[A-Za-z0-9]{16,}')

def limpa(t):
    if CREDENCIAL.search(t) and len(re.findall(r"[A-Za-z0-9%_\-]{16,}", t)) >= 1:
        return "[mensagem com cookies ou chaves removida do backup]"
    for p in SEGREDO:
        t = p.sub("[CHAVE APAGADA]", t)
    return t

def carrega(arq):
    txt = arq.read_text(encoding="utf-8")
    i = txt.index('{"'); j = txt.rindex("}")
    return json.loads(txt[i:j + 1])

def corpo(m):
    b = m.get("body") or ""
    if b.startswith("{"):
        try:
            d = json.loads(b)
        except Exception:
            return b
        if d.get("kind") in ("status", "activity", "thread_session", "remote_control_session", "error"):
            return None  # ruído operacional
        return d.get("text", b)
    return b

def main():
    src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    for arq in sorted(src.glob("*.txt")):
        d = carrega(arq)
        linhas = [f"# {arq.stem}\n"]
        for m in d.get("messages", []):
            b = corpo(m)
            if not b:
                continue
            quem = m.get("author_name") or ("Claude" if m.get("author") == "agent" else m.get("author"))
            anexos = ", ".join(a.get("filename", "") for a in m.get("attached_outputs", []) or [])
            linhas.append(f"## {m.get('created_at','')} · {quem}\n\n{limpa(b)}\n" + (f"\n_Anexos: {anexos}_\n" if anexos else ""))
        (out / f"{arq.stem}.md").write_text("\n".join(linhas), encoding="utf-8")
        print(arq.stem, len(linhas) - 1, "mensagens")

main()
