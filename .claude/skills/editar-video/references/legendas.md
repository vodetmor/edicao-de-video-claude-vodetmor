# Legendas

Montadas sozinhas das palavras da base: quebra na pontuação, em pausa > 0,35 s ou a cada ~3,6 s; até 2 linhas em
pirâmide, sem deixar artigo/preposição pendurado no fim da linha; ≤ 17 caracteres/s na média.

| estilo | aparência | quando |
|---|---|---|
| `limpa` (padrão) | Inter 500, branca com sombra curta sobre vídeo, escura sobre papel; entra subindo 6 px | quase sempre |
| `caixa` | mesma, dentro de uma placa clara | fundo muito claro ou poluído |
| `destaque` | `limpa` + palavra falada colorida | pedido do usuário |
| `forte` | 1 a 3 palavras, Archivo 800 maiúsculas, palavra falada em `destaqueLegenda` | reels de alto ritmo, pedido do usuário |
| `nenhuma` | sem legenda | vídeo já legendado ou pedido |

Ajustes no roteiro: `"legenda": {"estilo": "limpa", "tamanho": 60}` (px no quadro de 1080). A posição vem do layout
(livre da área de botões das redes, perto do rosto). Palavra transcrita errada: corrija em `base-palavras.json` (e
em `transcricao.json`, para o próximo montar) e acrescente o termo em `--termos` na próxima vez.
No projeto do Vítor, `destaque` e `forte` são proibidos pelo DESIGN-SYSTEM (P10) salvo pedido explícito dele.
