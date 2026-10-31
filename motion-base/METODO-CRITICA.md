# Método: crítica vaga → regra salva

Cliente quase nunca diz o que não gostou ("ficou amador", "não gostei", "parece IA"). O trabalho é traduzir.
Toda crítica entra numa tabela (um arquivo `CRITICAS.md` por obra, em `<obra>/trabalho/`) antes de mexer no vídeo:

| # | Quem / quando | Frase exata | Hipótese do que incomodou (o que ele VIU) | Regra mensurável | Onde aplicar | Status |
|---|---|---|---|---|---|---|

Passos:
1. **Frase exata, sem resumir.** A palavra escolhida é a pista ("literal", "iniciante", "muito IA").
2. **Comparar com a referência dele** quadro a quadro (mesmo instante, mesmo tipo de cena). A diferença visível vira hipótese.
3. **Hipótese → regra com número** (posição em % da altura, segundos, tamanho em px, cortes/s). Regra sem número não serve.
4. **Uma mudança por hipótese**, para saber qual resolveu. Mostrar quadros-chave antes do render completo.
5. **Perguntar com alternativa, nunca aberto**: "o 3D ficou ruim pela forma (enfeite) ou pelo movimento?" ou mandar A/B.
6. **Pedir o instante**: na página de prévias o cliente marca o segundo exato (comentário no artefato) em vez de opinar no geral.
7. **Fechou → regra vai para LICOES-MOTION** (e para a skill do estilo, se for de estilo). Nada fica só no chat.

Checagem obrigatória do bruto antes de montar: repetição de frase (a transcrição esconde: palavra com duração > 0,7 s
ou voz sem palavra transcrita = suspeita; ouvir a junção transcrevendo de novo), gaguejo, frase refeita, respiração alta.
Ferramenta: `estudio/editor/pipeline/cortar_base.py` corta um trecho da base em todas as camadas.
