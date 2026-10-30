---
name: pesquisa-proativa
description: Faz o Claude pesquisar referências por conta própria antes de editar (vídeos parecidos que deram certo, ritmo, legenda, material real com licença), no nível que o usuário tiver - só grátis, com chaves grátis, ou com orçamento e MCPs pagos. Use no começo de todo vídeo novo, quando o usuário pedir "pesquisa referências" ou quando ele disser quanto pode gastar.
---

# Pesquisa proativa

O usuário não precisa pedir: antes de planejar um vídeo novo, o Claude pesquisa sozinho, mede o que achou e traz
a régua mais alta que o pedido literal. As referências do usuário entram por cima, não no lugar.
Dinheiro é o único motivo para parar e perguntar.

## 1. Descobrir o nível (sem perguntar o que dá para ver)
Olhe o que está disponível nesta conversa: ferramentas de busca na web, conectores/MCPs ligados, chaves no `.env`
(só os NOMES das variáveis, nunca o valor). Depois leia o orçamento no briefing (`orcamento_pesquisa`). Sem
orçamento escrito = nível 0 ou 1.

| Nível | Precisa de | Serve para |
|---|---|---|
| 0 · grátis | busca e leitura da web do próprio Claude | achar vídeos e posts de referência, artigos, páginas públicas de anúncios |
| 1 · grátis com chave | chaves grátis (Pexels, Pixabay, Freesound, Jamendo) ou crédito grátis mensal (Apify) | material real com licença (vídeo, foto, som), lista de anúncios que estão rodando |
| 2 · com orçamento | MCPs e APIs pagos que o usuário ligou (raspagem de redes, bibliotecas de anúncios, geração de imagem/voz/vídeo) | volume: dezenas de anúncios medidos, material gerado sob medida |

Detalhe de cada fonte e como ligar: `references/fontes.md`. Onde configurar em cada versão do Claude:
`references/configurar.md`.

## 2. Pesquisar (o que buscar por estilo)
- Sempre: 3 a 5 vídeos do mesmo formato e nicho que performaram (visualizações, salvamentos, dias rodando).
- Meça, não descreva: cortes por segundo, duração, tempo até o gancho, tamanho e posição da legenda, quantas
  inserções por minuto, música (sim/não, volume), como abre e como fecha.
- Por estilo: corte limpo e reels forte → ganchos e legendas; tela dividida e painel → como a explicação se monta;
  moldura → ritmo de troca entre rosto e quadro; anúncio → oferta e CTA dos que rodam há mais tempo.
- Material real (logo, print, foto, B-roll): busque primeiro em fonte com licença; anote a licença.

## 3. Entregar em uma página
Escreva `projeto/referencias.md`: cada referência com link, o número que importa e **o que vamos pegar dela**
(uma linha). Termine com os parâmetros escolhidos para este vídeo. Isso entra no briefing e na direção.
Não copie fala, oferta, logo ou asset de ninguém: referência ensina ritmo e estrutura.

## Regras de dinheiro (não mudam)
- Nunca gaste sem OK. Antes de qualquer chamada paga, diga em uma linha: o que, quantas vezes, custo estimado.
- Respeite o teto do briefing; ao chegar a 80% dele, pare e avise.
- Anote cada gasto em `modelos/ficha-custos.csv` (data, serviço, quantidade, custo).
- Chave de API nunca em arquivo do projeto nem na conversa: fica no `.env` ou no conector.
- Crédito grátis acabou: volte ao nível de baixo e diga o que mudou.

## Proatividade sem exagero
- Pesquisa curta (10–15 min de trabalho) por vídeo; vídeo da mesma série reaproveita a pesquisa anterior.
- Achou algo que muda o plano (um formato que está explodindo, um erro comum)? Traga como proposta, com o número.
- Guarde o que valeu para os próximos (padrões do nicho, fontes boas) no arquivo de memória do projeto.
