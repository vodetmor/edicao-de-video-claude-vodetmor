# Migração para uma conta nova (passo a passo)

Objetivo: abrir a conta nova e continuar exatamente de onde parou, com o mesmo Claude: mesmo jeito de falar, mesmo método, mesma memória, mesmos arquivos.
Tudo o que precisa está neste repositório: `vodetmor/edicao-de-video-claude-vodetmor` (no SEU GitHub pessoal, não no da empresa).

## O que tem aqui
| Onde | O que guarda |
|---|---|
| `CLAUDE.md` | O "cérebro": quem você é, como falar com você, o método, o gosto, o mapa das pastas. O Claude lê sozinho. |
| `COMO-TRABALHAR-COM-O-VITOR.md` | Todas as suas regras de conversa e de trabalho juntas. |
| `memoria/` | A memória do projeto, um fato por arquivo (`MEMORY.md` é o índice). |
| `.claude/skills/` | As skills (método, motor, pesquisa, Remotion, design). |
| `historico/` | As conversas do projeto em texto (sem chaves), uma por thread. `INDICE.md` lista todas. |
| `motion-base/`, `estudio/`, `ferramentas/` | Biblioteca de lições, motor de vídeo e ferramentas. |
| `pessoal-vitor/`, `clientes/`, `outros/` | Todos os trabalhos e vídeos entregues. |

Fica fora do GitHub: chaves e senhas (recriar, ver abaixo) e mídia bruta pesada. A mídia bruta também está no seu OneDrive (`Desktop\Maquina de Editar\Backup-GitHub` recebe o repositório; o resto da pasta do projeto você pode baixar enquanto a conta antiga existir).

## Caminho A: novo Projeto no claude.ai (igual ao de hoje)
1. Na conta nova, conecte o GitHub: https://claude.ai/connect-github e instale o app do Claude no repositório `vodetmor/edicao-de-video-claude-vodetmor`.
2. Crie um Projeto novo chamado "Edição de Vídeo com IA".
3. Em Configurações do projeto > Recursos, adicione o repositório.
4. Em Configurações do projeto > Instruções, cole o bloco "Instruções do projeto" abaixo.
5. Na primeira mensagem do projeto, mande:
   > Leia CLAUDE.md, COMO-TRABALHAR-COM-O-VITOR.md e MIGRACAO.md do repositório. Depois importe todos os arquivos de memoria/ para a memória deste projeto (um fato por arquivo, sem mudar o conteúdo), copie o repositório para a pasta de arquivos do projeto e retome o salvamento diário no GitHub com backup/sincronizar.py.
6. Recrie as chaves (lista abaixo) mandando cada uma numa mensagem só para o Claude guardar num `.env`, nunca na memória.

## Caminho B: Claude Code no seu PC (funciona sem nenhuma conta de projeto)
1. Instale o Claude Code e entre com a conta nova.
2. A cópia já está no PC: `Desktop\Maquina de Editar\Backup-GitHub` (atualiza sozinha todo dia às 23:55). Ou clone de novo: `git clone https://github.com/vodetmor/edicao-de-video-claude-vodetmor`.
3. Rode `python backup/juntar_partes.py` na pasta (remonta vídeos grandes salvos em partes).
4. Abra o Claude Code dentro da pasta. Ele lê o `CLAUDE.md` e as skills sozinho. Diga: "leia COMO-TRABALHAR-COM-O-VITOR.md e memoria/MEMORY.md e continue de onde paramos".
5. Para renderizar: Node + Python + ffmpeg; `cd estudio/motor` e `npm i`.

## Instruções do projeto (colar no campo de instruções)
```
Este projeto é a Máquina de Editar do Vítor (Vitor Machado Neves, "Rei da VSL"). O repositório vodetmor/edicao-de-video-claude-vodetmor é o núcleo: antes de qualquer trabalho leia CLAUDE.md e COMO-TRABALHAR-COM-O-VITOR.md, e use memoria/ como memória do projeto. Fale em português do Brasil, simples, começando pelo resultado. Nunca devolva as ideias dele em lista: interprete e entregue a melhor resposta. Qualidade primeiro; todo vídeo segue a skill metodo-edicao com aprovação por quadros-chave. Toda lição nova vai na hora para motion-base/LICOES-MOTION.md ou para memoria/. Depois de cada entrega rode python3 backup/sincronizar.py para salvar tudo no GitHub. Nunca salve chaves em arquivo versionado nem na memória.
```

## Chaves para recriar (nunca ficam no backup)
Pexels, Freesound, Jamendo, Pixabay, Apify (todas grátis), ElevenLabs (se usar API), cookies do X no PC (`setx TWITTER_AUTH_TOKEN ...` e `setx TWITTER_CT0 ...`). No projeto vão em `ferramentas/busca/chaves.env` ou `.env`; o `.gitignore` impede que subam.

## Conferir que deu certo
Pergunte ao Claude novo: "como você deve falar comigo e qual é o nosso método?". Ele deve responder sem lista das suas ideias, citar o VSL Play v6 como padrão-ouro e o portão de quadros-chave. Se não souber, peça para ele ler `COMO-TRABALHAR-COM-O-VITOR.md`.

## Se a conta antiga ainda estiver aberta
Antes de sair: peça "salve tudo no GitHub agora" e "exporte o histórico das conversas" (script `backup/exportar_historico.py`). Baixe para o OneDrive o que for mídia bruta que você queira manter.
