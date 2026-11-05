# Máquina de Editar · Edição de Vídeo com IA (Vítor / Rei da VSL)

Tudo o que foi construído no projeto do claude.ai, pronto para continuar no **Claude Code**.

## Como retomar no Claude Code (PC)
```bash
git clone https://github.com/vodetmor/edicao-de-video-claude-vodetmor.git "Maquina de Editar"
cd "Maquina de Editar"
python backup/juntar_partes.py      # remonta os vídeos grandes salvos em partes de 90 MB
claude                              # abre o Claude Code nesta pasta
```
O Claude Code lê o `CLAUDE.md` e as skills de `.claude/skills/` sozinho. Primeira mensagem sugerida:
> "Leia COMO-TRABALHAR-COM-O-VITOR.md e memoria/MEMORY.md e continue de onde paramos."

Para retomar uma obra específica, peça para ler o `ESTADO.md` dela (`<obra>/trabalho/ESTADO.md`).
Instalação típica: `npm i` em `estudio/motor`; `python -m pip install numpy scipy pillow yt-dlp edge-tts`; ffmpeg no sistema.
Chaves (Pexels, Freesound, Apify, X…) não estão aqui: recrie num `.env` local (lista em `MIGRACAO.md`).

## Onde está cada coisa
| Pasta / arquivo | O que é |
|---|---|
| `CLAUDE.md` | Índice e regras do projeto (lido automaticamente). |
| `COMO-TRABALHAR-COM-O-VITOR.md` | Todas as regras de conversa e de gosto do Vítor. |
| `memoria/` | Memória do projeto: `MEMORY.md` (índice, uma linha por fato) + um arquivo por assunto. |
| `.claude/skills/` | Skills: metodo-edicao, motor-estudio, modo-orientador, pesquisa-referencias, editar-video, estilos, remotion-best-practices, apple-design etc. |
| `motion-base/` | Biblioteca: `DESIGN-SYSTEM.md`, **`LICOES-MOTION.md` (as lições)**, estudos, fontes do X, logos reais, música. |
| `estudio/` | Só o que roda: motor (Remotion + spec JSON por palavra falada), GLSL, editor de vídeo falado, animação JS. |
| `ferramentas/` | `busca/busca.py` (material grátis com licença), voz, modelos, automação do PC. |
| `organizacao/` | Modelo de pensamento, guias, acessos, tutoriais e `MAPA-DE-CAMINHOS.md` (caminho antigo → novo e a regra de cada pasta). |
| `pessoal-vitor/` | Conteúdo do perfil pessoal (aulas ENEM/PAS, bastidores, estratégia, escola). |
| `clientes/<cliente>/` | Trabalhos de clientes (vslplay, rei-da-vsl, medicmais-sobradinho, jeronimo…). |
| `outros/`, `laboratorio/` | Pedidos avulsos; testes e ferramentas avaliadas. |
| `historico/` | Índice e texto das conversas do projeto original. |
| `backup/` | `sincronizar.py` (salva no GitHub depois de cada entrega e todo dia) e `juntar_partes.py`. |
| `MIGRACAO.md` | Passo a passo para trocar de conta. |
| `FICOU-DE-FORA.md` | O que não subiu (mídia bruta pesada) e por quê. |
