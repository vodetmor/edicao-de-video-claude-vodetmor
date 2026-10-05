#!/usr/bin/env python3
"""Lê posts do X sem login (via api.fxtwitter.com) e salva texto, números e vídeos.
Uso: python3 xler.py URL_OU_ID [...] [--baixar] [--saida pasta]
Encontrar posts: busca web com "site:x.com <tema>" (WebSearch) e passar as URLs aqui.
Limite: não lê respostas/threads nem faz busca; para isso use twitter-cli com cookies (ver LEIA-ME.md)."""
import json, re, sys, os, time, urllib.request

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "motion-base-research/1.0"})
    return urllib.request.urlopen(req, timeout=30).read()

def ler(ref):
    m = re.search(r"(\d{8,})", ref)
    if not m: return None
    d = json.loads(get(f"https://api.fxtwitter.com/status/{m.group(1)}"))
    t = d.get("tweet") or {}
    media = t.get("media") or {}
    vids = [max(v.get("variants") or [v], key=lambda x: x.get("bitrate", 0)).get("url", v["url"]) if v.get("variants") else v["url"] for v in media.get("videos", [])]
    return {"id": t.get("id"), "url": t.get("url"), "autor": "@" + t.get("author", {}).get("screen_name", "?"),
            "data": t.get("created_at"), "likes": t.get("likes"), "views": t.get("views"),
            "reposts": t.get("retweets"), "texto": t.get("text", ""), "videos": vids,
            "fotos": [p["url"] for p in media.get("photos", [])]}

if __name__ == "__main__":
    args = sys.argv[1:]; baixar = "--baixar" in args
    out = os.path.dirname(os.path.abspath(__file__))
    if "--saida" in args: out = args[args.index("--saida") + 1]
    refs = [a for a in args if not a.startswith("--") and a != out]
    res = []
    for r in refs:
        try:
            p = ler(r)
        except Exception as e:
            print("falhou", r, e, file=sys.stderr); continue
        if not p: continue
        res.append(p)
        if baixar:
            for i, v in enumerate(p["videos"]):
                dest = os.path.join(out, "videos", f"{p['autor'][1:]}-{p['id']}-{i}.mp4")
                if not os.path.exists(dest):
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    import subprocess
                    if subprocess.run(["curl", "-sSL", "--retry", "3", "-C", "-", "-o", dest, v]).returncode:
                        print("falhou download", v, file=sys.stderr); continue
                p.setdefault("arquivos", []).append(os.path.relpath(dest, out))
        time.sleep(1)
    print(json.dumps(res, ensure_ascii=False, indent=1))
