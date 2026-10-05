#!/usr/bin/env python3
"""Conserta o twitter-cli 0.8.5 (erro "Failed to init ClientTransaction" + HTTP 404 na busca).

Causa (issue public-clis/twitter-cli#88 e XClientTransaction#47): desde set/2026 a pagina
x.com deslogada nao traz mais o arquivo "ondemand.s" que gera o x-client-transaction-id.
Logado, a pagina x.com/home ainda traz. Este script faz o twitter-cli abrir /home COM o
seu login. Funciona em Windows e Linux. Guarda copia do original (client.py.orig).
Rodar de novo e seguro (nao aplica duas vezes).
Uso: python consertar_twitter_cli.py
Depois, se existir, apague a pasta de cache: %USERPROFILE%\\.twitter-cli\\transaction_cache.json
"""
import os, sys, importlib.util

spec = importlib.util.find_spec("twitter_cli")
if not spec:
    sys.exit("twitter-cli nao esta instalado. Rode: pip install twitter-cli")
path = os.path.join(os.path.dirname(spec.origin), "client.py")
src = open(path, encoding="utf-8").read()
MARK = "# CONSERTO-HOME-LOGADA"
if MARK in src:
    sys.exit("Ja estava consertado: " + path)

old = '''            home_page = cffi_session.get(
                "https://x.com", headers=ct_headers, timeout=10,
            )'''
new = '''            ''' + MARK + '''
            _ck = self._cookie_string or "auth_token=%s; ct0=%s" % (self._auth_token, self._ct0)
            home_page = cffi_session.get(
                "https://x.com/home", headers=dict(ct_headers, Cookie=_ck), timeout=15,
            )'''
if old not in src:
    sys.exit("Nao achei o trecho esperado; a versao do twitter-cli mudou. Rode: twitter --version")
open(path + ".orig", "w", encoding="utf-8").write(src)
open(path, "w", encoding="utf-8").write(src.replace(old, new))
print("Consertado:", path, "(original salvo em client.py.orig)")
