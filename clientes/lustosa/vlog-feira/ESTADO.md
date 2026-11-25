# Vlog do Lustosa (feira) · estado

Pedido (24/11/2026, via Ruan no WhatsApp -> Vítor): vlog estilo TikTok, narração em off no tom do narrador de "Todo Mundo Odeia o Chris", sobre o Lustosa (19 anos, de Sobradinho, vendia brigadeiro, hoje faz feira pelo Brasil). Perfil com muitos seguidores; se ficar bom, o Ruan indica a agência. **Dono do perfil e prazo: não informados.**

## O que existe
- `ROTEIRO-NARRACAO.txt`: roteiro (rascunho; só é fato o que o Ruan falou: 19 anos, Sobradinho, brigadeiro, faz feira pelo Brasil, "sem saber o dia de amanhã"; o resto é humor a partir do que aparece nas imagens). **Confirmar com o Lustosa antes de publicar.**
- `trabalho/brutos/` (fora do git, 398 MB): 5 fotos (HEIC/JPG) e 19 vídeos (MOV) do Ruan. Falta o IMG_2184 (download do WhatsApp falhou por timeout; pedir reenvio se precisar).
- `trabalho/voz/narracao-juliano-v1.mp3` e `v2.mp3` (ElevenLabs, voz "Juliano Magalhães", da conta do Vítor; 620 créditos; ~49,7 s) + `.palavras.json` (Groq, tempo por palavra). Voz **original da conta, sem clonagem** (não clonar a voz do narrador da série: voz de ator real).
- `trabalho/voz/musica-tema-chris.mp3`: abertura da série (YouTube mZEKZgb1b_U, 30 s), pedido do Vítor. **Tem direito autoral**: usar na prévia; ao postar no TikTok, trocar pelo som oficial da biblioteca do TikTok (ou por faixa CC do banco `motion-base/musica`, ex.: "Cheerful and Upbeat Tune for Happy Moments", Gustavo Aliver, CC BY 4.0, crédito na descrição).
- `trabalho/fonte/montar.py`: montagem 9:16 em ffmpeg (cortes presos às palavras, fotos com zoom lento, legenda ASS amarela palavra por palavra, letreiro "SEGUNDA-FEIRA 4:45", voz na frente, música em loop com ducking, master -14 LUFS).

## Refazer
```
cd trabalho/fonte && python -I -X utf8 montar.py        # -> trabalho/render/vlog-previa.mp4 (shots em render/tmp ficam em cache; RECACHE=1 refaz)
ffmpeg -i ../render/vlog-previa.mp4 -c:v libx264 -b:v 3200k -c:a copy -movflags +faststart ../render/vlog-previa-celular.mp4   # ~21 MB
```
Voz: ElevenLabs pelo site (BrowserABI, perfil do Vítor). O editor só aceita o texto em **um parágrafo** (colar com `execCommand('insertText')`, sem quebras de linha); o contador "N / 100.000" confirma.

## Pendente
- Aprovação do Vítor/Ruan da prévia (v1). Sem crítica independente ainda.
- Decidir o tom (leve ou debochado), a versão da voz (v1 ou v2) e se há prazo.
- Música final (licença) e o texto da legenda do TikTok.
