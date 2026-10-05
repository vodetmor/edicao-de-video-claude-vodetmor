# busca.py — material real de várias fontes de uma vez

Guia completo (o que cada fonte faz, licenças, dicas): `../../motion-base/BUSCA-MATERIAL-REAL.md`.

Preparar (uma vez por máquina/container novo): `python3 -m pip install pillow yt-dlp`

```
python3 busca.py --fontes                                   # quais fontes estão prontas
python3 busca.py "rain city night"                          # vídeos de estoque
python3 busca.py "favela aerial" -t foto --livre
python3 busca.py "enchente porto alegre" -t noticia
python3 busca.py --de resultados/<pasta> --baixar 2,6        # baixa os escolhidos da folha.jpg
python3 busca.py --pegar https://www.dailymotion.com/video/xxxx --saida pasta
```

Arquivos:
- `busca.py` — o programa.
- `chaves.env` — chaves extras (ex.: `PIXABAY_API_KEY=...`). Não compartilhar.
- `registro-licencas.csv` — tudo o que já foi baixado, com fonte, autor, licença e página.
- `resultados/` — uma pasta por busca (folha.jpg, resultados.json, LICENCAS.md e os arquivos baixados).
