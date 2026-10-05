# Interface do Claude (tema escuro) para vídeos — componentes Remotion

Criados em 05/10/2026 para o vídeo "Bastidores" (pessoal-vitor/bastidores). Recriados a partir de prints do app Claude (desktop, escuro).
Cores amostradas dos prints: fundo #151515, barra lateral #111111, cards #1A1A19, campos #212121, linhas #2C2C2A, texto #ECEAE6, cinza #8E8C87, coral #D97757, azul #2F7CF6.

- ClaudeUI.tsx: `Janela` (janela 1440x1460), `Sidebar` (Novo, Projetos, Artifacts, Rotinas, Personalização, Fixados), `TelaProjetos` (título em serifa, busca, botão Novo projeto, cards), `ModalNovo` (Nome digitado, Meta, Contexto com chips que entram, Criar projeto), `Caret`, `LogoClaude`, ícones `I`.
- Cenas.tsx: `TelaChat` (texto digitado em sincronia com a fala + envio + "Claude está trabalhando"), `TelaCoordenador` (coordenador dividindo em subagentes, status animado), `Codigo` (editor com digitação e cores), `ClipeAula` (trecho de vídeo 16:9 que começa no quadro certo: SEMPRE passar `inicio`), `Chip`, `digitado()`.
- Legenda.tsx: legenda palavra por palavra (Archivo 900, coral nas palavras-chave), lê data/legenda.json.

Uso: copiar para src/ de um projeto Remotion com lib.ts (UI, F/FE de palavras) e Fonts.tsx (Archivo, Inter, JetBrains Mono, Source Serif 4). Exemplo completo: pessoal-vitor/bastidores/trabalho/fonte/remotion/src/Bastidores.tsx.
Lição: OffthreadVideo fora de <Sequence> toca em relação ao quadro 0 da composição; um trecho que entra no meio do vídeo precisa de <Sequence from=...>.
Não mostrar dados privados da barra lateral (nomes de repositórios e conversas) — usar só itens genéricos.
