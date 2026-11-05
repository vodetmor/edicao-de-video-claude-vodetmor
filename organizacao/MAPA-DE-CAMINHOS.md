# Mapa de caminhos (reorganização de 05/11/2026)

Se um documento antigo citar o caminho da esquerda, use o da direita. `historico/` não foi alterado de propósito: é registro do que aconteceu.
Mídia que ainda vai chegar (`FICOU-DE-FORA.md`) deve entrar no caminho novo.

| Antes | Agora | Motivo |
|---|---|---|
| `estudio/aula-lancamento-obliquo/` | `pessoal-vitor/aula-lancamento-obliquo/` | É obra pessoal, não motor |
| `estudio/makingof-aula/` | `pessoal-vitor/makingof-aula/` | É obra pessoal |
| `estudio/teste-blender/`, `estudio/teste-gancho/`, `estudio/craft/`, `estudio/escalados/` | `laboratorio/<mesmo nome>/` | Testes e avaliações |
| `pesquisa/` | `organizacao/pesquisa-inicial/` | Só 2 arquivos, do começo do projeto |
| `pc/` | `ferramentas/pc-automacao/` | É guia de ferramenta |
| `outros/maquina-edicaoia/` | `clientes/jeronimo/maquina-edicaoia/` | Produto com o Jerônimo |
| `outros/oferta-edicao-ia-jeronimo/` | `clientes/jeronimo/oferta-edicao-ia/` | Idem; só do PC |
| `pesquisa-x/` | `motion-base/fontes/x/buscas-cruas/` | Buscas do X; só do PC |
| `Backup-Maquina-de-Editar/`, `iphone-3d-para-subir/`, `atualizar-backup-github.ps1` e `.log` | `backup/pc/` | Só do PC |
| `LEIA-ME.md` | `README.md` | Eram dois arquivos com a mesma função |
| `ola-do-claude.txt` | `backup/pc/arquivos/ola-do-claude.txt` | Arquivo de demonstração; a cópia da raiz foi removida |

## Regra de cada pasta
| Pasta | Entra aqui |
|---|---|
| `motion-base/` | Conhecimento: regras, lições, `fontes/` (material lido), `referencias/` (moodboards), `estudos/` (referências medidas), logos, música, componentes |
| `estudio/` | Só motor e ferramentas de vídeo que rodam: `motor`, `editor`, `glsl`, `animacao-js` |
| `ferramentas/` | Scripts de apoio: busca, voz, modelos, paleta, automação do PC |
| `pessoal-vitor/`, `clientes/<cliente>/`, `outros/` | Obras. Toda obra com `trabalho/ESTADO.md` |
| `laboratorio/` | Testes e ferramentas avaliadas |
| `memoria/`, `historico/` | Fatos e decisões; registro das conversas |
| `organizacao/` | Protocolos, guias, tutoriais, acessos, planos |
| `backup/` | Scripts de salvamento; `backup/pc/` é só do PC |

## Nuvem
`backup/sincronizar.py` traduz os caminhos antigos pela lista `MOVIDOS`. A nuvem precisa adotar esta versão do script, senão a próxima sincronização recria as pastas antigas.
