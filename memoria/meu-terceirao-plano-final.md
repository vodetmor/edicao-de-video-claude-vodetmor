---
name: meu-terceirao-plano-final
description: Plano (ETM) do vídeo final de 5 min do Meu Terceirão, com orçamento de tempo, atos, mecanismos de densidade, 3D, áudio e cronograma até 22/11/2026
metadata:
  type: project
---

# Meu Terceirão · plano da FINAL (13/11/2026, antes de executar)

Acervo em 13/11: 103 fotos (36 criança em `triagem/crianca/`, 67 jovem em `triagem/jovem/`) + 30 vídeos (todos jovem). Pode crescer (Luiz/231, mais envios). Música: Tempo Perdido inteira, 302 s ≈ 465 batidas (92,3 BPM, 0,65 s). Relacionado: [[meu-terceirao]].

## Ideia-mãe
"Voltar ao passado": o vídeo começa no presente (TV DF), mergulha na infância e volta crescendo até a turma inteira (231 + 232 misturadas). Fecha com a infância e o presente juntos. Título da música vira tese: "nem foi tempo perdido".

## Orçamento (302 s)
| Ato | Tempo | Duração | Conteúdo | Mídia |
|---|---|---|---|---|
| 0 TV DF | 0:00-0:10 | 10 s | intro aprovada, câmera entra na tela | 5 fotos jovem |
| 1 Antes | 0:10-1:20 | 70 s | infância, bloom, ano na tela (2014...), portal pelo mural de polaroids de criança (c43/c63) | 36 fotos criança |
| 2 Crescemos | 1:20-2:00 | 40 s | cor volta, uniforme, sala, "temos todo o tempo do mundo" | 18 fotos + 6 vídeos |
| 3 A bagunça boa | 2:00-3:10 | 70 s | fantasias, risada, vídeos com som, mural 3D x3 | 25 fotos + 14 vídeos |
| 4 Nós | 3:10-4:20 | 70 s | abraços, professores, grupo grande em tela cheia, "somos tão jovens" | 24 fotos + 10 vídeos |
| 5 Fecho | 4:20-5:02 | 42 s | mural final (infância + presente), texto aprovado, escadaria, "231 e 232" | reuso de todas |
Tempos fixos só depois da transcrição da música inteira. Vídeos: ~3 s cada = ~90 s (30% do tempo); fotos ≈ 1,1 a 1,7 s cada com os mecanismos abaixo.

## Mecanismos de densidade (cobertura 100%)
1 foto por batida (50 fotos) · dupla/trio de verticais (20) · tira de filme 6-8 por 5 s (16) · mural 3D com a câmera voando e entrando numa foto (40, nos 3 "temos nosso próprio tempo") · grade que enche na meia-batida (16) · vídeo que congela e vira polaroid e voa para o mural (11). Script de montagem distribui e FALHA o build se qualquer arquivo ficar sem aparecer.

## Regras fixas
Horizontais ≥ 85% da largura (nunca cartão pequeno). Efeito "lembrança" = bloom (brilho sobe + desfoque leve), sem véu branco. Textos: "DF", "Escola La Salle Sobradinho", ano quando a época muda, fecho aprovado ("231 e 232" por último). Sem nomes, sem legenda inventada. Margens seguras de telão.

## 3D
Fotos como planos num espaço único, câmera em curva. Tentar CSS 3D (perspective + translateZ) primeiro; three/GLSL só no mural voador. PC sem GPU: medir antes (spike de 5 s). Render por ato (concatena), 1080p30 = 9060 quadros, rodar em segundo plano.

## Áudio
Música -14 LUFS no master. Vídeo entra com som na frente, música -12 dB com rampa de 0,25 s, volta suave em 0,5 s. Risco: ~90 s de música abaixada; decisão do Vítor abaixo.

## Ordem
Infância: do mais novo ao mais velho, por aparência, em blocos de folhas de contato (sem modelo de idade). Jovem: por cena/energia, não por data (arquivos sem data real).

## Cronograma (final com folga em 22/11, exibição 25/11)
14/11 transcrever música inteira, ordem da infância, spike 3D e bloom · 15-16 atos 0-2 + stills para aprovação · 17 prazo do material do Luiz · 17-18 atos 3-5 · 19 corte completo + crítica por sessão nova (alvo ≥ 8/10) · 20 ajustes · 21 render 1080p · 22 master e conferência.

## Decisões em aberto (do Vítor)
1. Todos os 30 vídeos com som original, ou só os que têm risada/fala e os demais mudos? (recomendação: som em ~20, mudo nos restantes)
2. Pares "antes e depois" (criança → a mesma pessoa jovem): só se ele disser quem é quem; opcional.
3. Prazo final do material do Luiz (proposta: 17/11).

**Why:** pedido do Vítor (13/11): incluir todas as fotos e mídias em 5 min, bem emocionante, plano antes de executar; ele troca para modelo maior na execução.
**How to apply:** executar nesta ordem; qualquer mídia nova entra pela triagem (criança/jovem) e pelo script de cobertura.
