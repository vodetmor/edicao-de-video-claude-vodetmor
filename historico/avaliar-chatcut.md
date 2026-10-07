# avaliar-chatcut

## 2026-09-28T23:37:54Z · Claude

Vou avaliar o plugin ChatCut e ver se ele encaixa no nosso fluxo de edição com SPEC.md, sem excesso.

## 2026-09-28T23:38:02Z · Claude

Começo lendo a página do ChatCut para ver como o plugin instala e funciona.

## 2026-09-28T23:40:04Z · Claude

Veredito: **por enquanto, pula**. Pro motion do nosso vídeo ele atrapalha mais do que ajuda.

**Não deu pra rodar aqui.** A rede da nuvem bloqueia o chatcut.io e o servidor deles (api.chatcut.io). E o plugin só funciona no app desktop do Claude, com login na sua conta ChatCut. O código do plugin eu consegui ler pelo GitHub.

**Por que não encaixa no nosso modelo:**
- O motion dele puxa estilos prontos do catálogo deles (presets). É o oposto do nosso fluxo de referência → SPEC.md → Remotion, e é exatamente aí que nasce o visual genérico e o excesso de informação que você não quer.
- Ele é pago por créditos. O plano grátis dá 5 créditos e 60 min de exportação no total, e o pago começa em uns US$ 42 por mês.

**Onde ele até serviria:** no corte bruto de vídeo com gente falando pra câmera (transcrever, tirar os silêncios, legendar), e ele exporta XML pro Premiere/DaVinci ou rascunho pro CapCut. Só que isso nosso pipeline com ffmpeg já faz de graça.

Se quiser testar mesmo assim no seu PC, são dois comandos no terminal. Depois é só fazer o login e abrir uma sessão nova:
`claude plugin marketplace add https://github.com/ChatCut-Inc/agent-plugin.git#main`
`claude plugin install chatcut@chatcut-inc`

Fontes: [página do plugin](https://chatcut.io/claude-code-plugin), [docs](https://chatcut.io/docs/agent-plugin), [preços](https://chatcut.io/pricing), [GitHub](https://github.com/ChatCut-Inc/agent-plugin)
