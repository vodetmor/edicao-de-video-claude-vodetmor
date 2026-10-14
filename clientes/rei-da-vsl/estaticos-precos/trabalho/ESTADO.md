# Estado · Estáticos de anúncio Rei da VSL (Dhay, via Vítor, 13/10/2026)

Pedido: 6 imagens estáticas (3 por criativo) dos 2 criativos de preço. Esta é a versão POR CÓDIGO (HTML + Playwright),
para o Vítor comparar com a versão GPT (C:\image-automation). Reaproveita os artefatos de `../criativos-precos/`.

## Feito
- `1080x1350/` (feed 4:5) e `1080x1080/` (quadrado): 6 PNG cada + `estaticos-rei-da-vsl.zip` na raiz da obra.
  - 01a-preco: R$ 39,90 3D ouro no preto, "por criativo", trio Copy+Locução+Edição, pacote R$ 399, botão.
  - 01b-pacote: fundo ouro, "10 criativos prontos pra anunciar", caixa 3D (Blender), R$ 399 = 39,90 cada.
  - 01c-teste-10: "teste 10 abordagens", cupom com 10 linhas x 39,90, tudo incluso, TOTAL R$ 399.
  - 02a-preco: POR R$ 49,90 3D preto no branco, "criativo completo", trio, botão preto/ouro.
  - 02b-3-pessoas: "contratar 3 pessoas?", copywriter/locutor/editor riscados -> "a gente faz tudo R$ 49,90".
  - 02c-pronto: celular com post patrocinado (quadro real do portfólio), selo PRONTO, "seu vídeo pronto pra anunciar", R$ 49,90.
- Preço 3D re-renderizado em 2160 (`img/precoA-2160-bruto.png`, `precoB-...`) com `criativos-precos/trabalho/caixa3d/preco3d.py A 88` / `B 74`.
- `prepara.py` recorta e limpa o véu do shadow catcher (alfa de fundo medido na borda + esfumado elíptico).

## Refazer
```
cd trabalho
python3 -m pip install bpy   # só se for re-renderizar o 3D
python3 ../../criativos-precos/trabalho/caixa3d/preco3d.py A 88 img/precoA-2160-bruto.png 2160   # idem B 74
python3 prepara.py img/precoA-2160-bruto.png img/precoB-2160-bruto.png
python3 gera.py && python3 gera.py 1080 1080          # -> estaticos-WxH.html
# playwright: mkdir pw && cd pw && npm i playwright@1 && cp ../render.mjs .
DIR=<esta pasta trabalho> CHROME=/opt/pw-browsers/chromium node render.mjs 1080 1350   # e 1080 1080
```
## Próximo
Retorno do Vítor/Dhay comparando com a versão GPT. Ajuste: mexer só no bloco da peça em gera.py e re-renderizar.
