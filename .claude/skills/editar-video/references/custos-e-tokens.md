# Custos e tokens

## O que custa (separe sempre)
1. **Assinatura do Claude** (Pro, Max...). Edição por agente precisa de plano pago; diga isso ao usuário com clareza.
2. **Uso extra**: créditos além do limite do plano, API, modelos cobrados à parte (o seletor de modelo avisa).
3. **Serviços externos**: voz, imagem, transcrição na nuvem. Este editor não precisa de nenhum.
4. **Tempo humano**: preparar, orientar, revisar. Tempo de render/espera é anotado à parte (não é trabalho).

Custo por peça (o número que importa):
- ferramentas por peça = (assinatura alocada + extras) ÷ vídeos APROVADOS
- total por peça = (assinatura alocada + extras + horas ativas × valor da hora) ÷ vídeos aprovados
Sem vídeo aprovado não divida: registre só o gasto. Ficha: `estudio/editor/modelos/ficha-custos.csv`.
Nunca converta "% do limite" em reais nem invente consumo: use o que o painel de uso da conta mostra.

## Onde o token vai (e como este editor economiza)
| Gasta muito | Aqui |
|---|---|
| Ler vídeo, áudio ou JSON grande | scripts fazem; o Claude lê só `cortes.md` e um resumo da fala |
| Refazer o vídeo inteiro a cada ajuste | correção por trecho + painel ao vivo (sem render para revisar) |
| Rodadas por pedido vago | notas no quadro exato com problema e mudança |
| Gerar código de animação do zero a cada vídeo | estilos e elementos prontos; o Claude só escreve o roteiro JSON |
| Contexto que só cresce | um vídeo por conversa; `/compact` entre etapas grandes; `/clear` ao trocar de vídeo |

## No Claude Code
- `/usage`: quanto do limite do plano já foi; confira antes de lote e vídeo longo.
- `/model`: Opus para dirigir estilo novo e revisar; Sonnet para etapas mecânicas (rodar limpeza, render, lote com padrão aprovado).
- `/effort`: alto para criar a direção; médio/baixo para repetir um padrão aprovado.
- Modo rápido e modelos marcados como cobrança extra custam mais: só com autorização do usuário.
- Teto de gasto: combine com o usuário um valor máximo de extras por mês antes de começar; ao chegar perto, pare e avise.

## Interromper retrabalho
Mesmo problema 2 vezes = pare, diagnostique a causa, proponha a menor correção. Pedido que muda a direção depois da
aprovação = nova rodada consciente (diga o custo em tempo), não remendo em cima de remendo.
