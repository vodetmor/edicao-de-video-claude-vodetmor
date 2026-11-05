#!/usr/bin/env bash
# Instala os apps "Craft" (storytold, Rust, código aberto) a partir dos binários oficiais do GitHub,
# conferindo o SHA256 de cada arquivo. Não compila nada (compilar leva ~13 min por app).
# Uso: bash instalar.sh [effectcraft filmcraft photocraft vectorcraft lightcraft printcraft designcraft]
#      (sem argumentos: effectcraft e filmcraft). Saída: ~/craft/bin/<app>-cli
set -euo pipefail
APPS=("$@"); [ ${#APPS[@]} -eq 0 ] && APPS=(effectcraft filmcraft)
DEST="${CRAFT_DIR:-$HOME/craft}"; mkdir -p "$DEST/bin"
for app in "${APPS[@]}"; do
  base="https://github.com/storytold/$app/releases/latest/download"
  tmp=$(mktemp -d)
  curl -fsSL -m 60 -o "$tmp/sums.txt" "$base/SHA256SUMS.txt"
  arq=$(grep -oE "[a-z]+-[0-9.]+-linux-x86_64\.tar\.gz" "$tmp/sums.txt" | grep -v -- "-cli-" | head -1)
  [ -z "$arq" ] && { echo "$app: sem tarball linux-x86_64 na última versão"; continue; }
  echo "$app: baixando $arq"
  curl -fsSL -m 600 -o "$tmp/app.tgz" "$base/$arq"
  (cd "$tmp" && grep " $arq\$" sums.txt | awk '{print $1"  app.tgz"}' | sha256sum -c - >/dev/null) \
    || { echo "$app: SHA256 NÃO confere, abortado"; rm -rf "$tmp"; exit 1; }
  rm -rf "$DEST/$app" && mkdir -p "$DEST/$app" && tar xzf "$tmp/app.tgz" -C "$DEST/$app" --strip-components=1
  for b in "$DEST/$app"/bin/*-cli; do ln -sf "$b" "$DEST/bin/$(basename "$b")"; done
  rm -rf "$tmp"
  echo "$app: ok -> $(ls "$DEST/bin" | grep "$app\|pdfcraft" | tr '\n' ' ')"
done
