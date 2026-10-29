# Formatos, variações e lote

## Formatos
`"formato"` no roteiro: `9:16` (1080×1920, Reels/TikTok/Shorts), `4:5` (1080×1350, feed), `1:1`, `16:9` (1920×1080,
YouTube e aula). O rosto é recortado pelo `rosto.json`, então a mesma base serve a todos: copie o roteiro, troque o
formato e confira os quadros (no 16:9 o `split` vira lado a lado e a moldura vai para a direita).
Vertical: nada importante encosta na direita (botões) nem abaixo de ~85% (descrição do post).

## Variações (uma mudança por versão)
| Versão | Muda | Fica |
|---|---|---|
| A | base aprovada | oferta, corpo, CTA |
| B | só o título de abertura (texto na tela) | voz e corpo |
| C | só a fala de abertura (outro take) | corpo, oferta, CTA |
- B: copie o roteiro, troque o texto do `titulo` da 1ª cena, `renderizar.mjs --roteiro B.json --nome B-titulo`.
- C: monte o novo take como outro projeto (ou corte e junte a abertura), refaça transcrição e legenda desse trecho.
- Registre em `estudio/editor/modelos/matriz-variacoes.md`: arquivo, variável, destino, hipótese. Sem métrica inventada:
  a prévia não diz qual anúncio vai ganhar.

## Lote
Padrão aprovado → até 3 vídeos por vez, cada um com pasta própria, nova transcrição, novo roteiro (mesmas regras,
outro conteúdo) e quadros conferidos. Aprove o primeiro antes dos outros dois. Nunca reaproveite dados de outro vídeo.
