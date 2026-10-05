---
name: backup-portatil
description: Portable backup of the project core (2026-10-02) in /mnt/project-files/backup: generator gerar_backup.py, kit with CLAUDE.md + 3 project skills, 3 zips; Vítor may lose this account
metadata:
  type: project
---
Vítor (2026-10-02) expects to lose this claude.ai account (possibly employer-linked, contract/firing) and wants the project core reusable in another account / Claude Code.
- /mnt/project-files/backup/: `python3 gerar_backup.py` regenerates everything (~1 min). Source of the "brain": kit/CLAUDE.md, kit/LEIA-ME.md (restore guide), kit/skills/{metodo-edicao,motor-estudio,pesquisa-referencias}, kit/memoria/ (copy of team memory: refresh with `cp /tmp/claude/memory/team/silo/*.md kit/memoria/` before running), kit/historico/ (redacted chat exports via exportar_historico.py; raw exports hold cookies/keys, never store them in project files).
- Outputs: maquina-de-editar-nucleo-DATE.zip (~56 MB: motion-base minus X videos, estudio, ferramentas, organizacao, skills in .claude/skills, memory, school project code), maquina-de-editar-referencias-x-DATE.zip (~214 MB X reference videos), trabalhos-vslplay-DATE.zip (client/employer VSL Play source + docs, kept separate on purpose; Vítor decides if it is his to keep).
- Generator aborts on anything that looks like a key; secrets (.env, chaves.env, Apify/X tokens) are never included.
- PC side (done 2026-10-02): code of C:\flow-automation and C:\image-automation zipped (no profiles, contas.json, node_modules, outputs) into C:\Users\vitor\OneDrive\Desktop\Maquina de Editar\Backup-Maquina-de-Editar. That OneDrive is PERSONAL (his own Microsoft account), so it is already an off-account copy. image-automation has no package.json (needs playwright-core). Weekly routine trig_01JAe8uB1ebp6hHqUGJizi8x (Sun 21:48 BRT) refreshes the backup.
- Durable home proposed: private GitHub repo on his PERSONAL account (heavy media in Drive). Pending his answer.
**How to apply:** when the core changes a lot (new lessons, engine blocks, skills), refresh kit/memoria and rerun the generator; if CLAUDE.md rules change, edit kit/CLAUDE.md. Related: [[pesquisa-pipeline-2026-09-28]], [[estudio-motor]].
