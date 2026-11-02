# Onde ligar pesquisa e conectores em cada versão do Claude

Os nomes dos menus mudam com as atualizações: se algo não estiver onde está escrito, procure por "Conectores",
"Skills" ou "Busca na web" nas configurações.

## Claude Code (terminal, app ou extensão do editor)
- Skills: pasta `.claude/skills/<nome>/SKILL.md` dentro do projeto (vale só nele) ou `~/.claude/skills/` (vale em todos).
- Busca na web: já vem ligada.
- MCPs: `claude mcp add <nome> ...` ou um arquivo `.mcp.json` no projeto. Chaves no `.env`, nunca no arquivo.
- Roda os scripts de verdade (transcrição, cortes, render, painel em localhost:8080): é a versão completa.

## Cowork (app do Claude no computador)
- Trabalha numa pasta do computador que o usuário conecta; skills entram como skills/plugins nas configurações.
- Conectores (MCPs) nas configurações de conectores do app.
- Roda comandos num ambiente próprio dentro do PC: faça o teste rápido de `editar-video/references/instalacao.md`
  antes do primeiro vídeo para confirmar ffmpeg, Python e Node.

## Projetos do claude.ai (site e app de celular)
- Skills: envie a pasta da skill em .zip nas configurações de capacidades/skills da conta; as instruções do projeto
  dizem para usar `editar-video` e `pesquisa-proativa`.
- Busca na web e conectores: ligue no menu de ferramentas da conversa.
- A execução de código ali é um ambiente com limite de tempo e de instalação: use o Projeto para direção
  (pesquisa, briefing, roteiro visual, revisão de quadros e notas) e o Claude Code ou o Cowork para o render.

## Texto sugerido para as instruções (qualquer versão)
"Antes de editar qualquer vídeo novo, use a skill pesquisa-proativa no nível que estiver disponível. Meu orçamento
de pesquisa é R$ <valor> por vídeo (0 = só grátis). Nunca gaste sem me mostrar o custo antes."
