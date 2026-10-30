# Estudo · vídeo-demonstração "8 Claude effects" (enviado pelo Vítor em 30/10/2026: "a ideia é EXATAMENTE isso")

Vertical, 480x852, 30 fps, 33,7 s, −13,5 LUFS. Quadros em `folha-2fps.png` e `detalhe.png` (o vídeo não fica no repositório).

## Estrutura (o que o Vítor quer copiar como MÉTODO)
- **O app do Claude é o fio condutor.** Tela escura do app (barra Chat | Code), a pessoa digita `/effects <nome>` no teclado,
  envia, aparece "✱ Editing with <nome>…" em laranja e a edição nasce numa miniatura com **dissolução em pixels** (laranja + escuro).
- **Zoom da miniatura para a tela cheia**, o efeito toca ~1,5 a 2 s, corte seco de volta para o app no próximo comando.
- Ciclo app → efeito a cada ~3,3 s (cortes em 1,9 / 3,3 / 5,3 / 6,7 / 8,6 / 10 / 11,9 / 13,3 …), 8 efeitos em 30 s.
- Fim: "Comment "claude"" + grade com os 8 efeitos rotulados (/tools-card, /before-after, /magazine …).
- **Som:** a música manda (pulso lento, ~1,2 s), apenas ~12 transientes no vídeo inteiro. Nada de som por palavra.
- Paleta: grafite do app #262624 + laranja Claude #D97757; os efeitos usam a imagem real da pessoa.

## Como aplicamos
`estudio/editor/remotion/src/AppClaude.tsx` (TelaClaude + Dissolve) e camera `modo: 'app'` na Vitrine
(`comando`, `envio` = palavra em que envia, `nota`). Cada "Tem a versão…" do roteiro vira: app digitando a skill real
→ miniatura → zoom no nome da versão.
