---
name: backup-portatil
description: Continuous backup to Vítor's GitHub vodetmor/edicao-de-video-claude-vodetmor via /mnt/project-files/backup/sincronizar.py; run after every delivery; layout pessoal/clientes/outros
metadata:
  type: project
---
Vítor (2026-10-02, reaffirmed 2026-10-04) expects to lose this claude.ai account and wants EVERY artifact saved continuously to GitHub + his PC, "sem nenhuma perda".
- Repo: github.com/vodetmor/edicao-de-video-claude-vodetmor (private, his personal account, in Project settings). Other threads may also commit there directly.
- Sync: `python3 /mnt/project-files/backup/sincronizar.py` (`--seco` = dry run). Mirrors project files into the repo (never deletes), commits per folder, pushes commit by commit, rebases with project-wins. Aborts on anything that looks like a key. Big deliverables > 90 MB go in .parte-NNN chunks (rejoin: backup/juntar_partes.py). Raw heavy media (trabalho/acervo/renders/stems/media/audio/public > 2 MB, zips) stays out of Git.
- Repo layout: core at top (CLAUDE.md, .claude/skills, memoria, historico, motion-base, estudio, ferramentas, organizacao, pesquisa, pc, backup); `pessoal-vitor/` = his own content as Vitor Machado Neves (TikTok/Instagram, aulas, bastidores, escola); `clientes/<cliente>/` (VSL Play = clientes/vslplay); `outros/` (e.g. church vinheta-life); `laboratorio/`.
- New work: create it in project files under pessoal-vitor/<obra>, clientes/<cliente>/<obra> or outros/<obra> (old folders anuncio-vslplay, criativos-vslplay, escola-consciencia-negra, vinheta-life are remapped by the script).
- Brain source: backup/kit/ (CLAUDE.md lean index, LEIA-ME.md, skills metodo-edicao/motor-estudio/pesquisa-referencias, memoria copy auto-refreshed by the script, historico redacted via exportar_historico.py).
- PC: C:\Users\vitor\OneDrive\Desktop\Maquina de Editar\Backup-Maquina-de-Editar (personal OneDrive) holds flow/image automation code + claude-config-pc.zip (no credentials). His old PC project memories contain plaintext keys: never back them up; advised rotating.
**How to apply:** after any delivery or milestone, run sincronizar.py and mention nothing unless it fails. A daily routine also runs it. Related: [[estudio-motor]].

PC auto-update ACTIVE (2026-10-05): Windows scheduled task "Backup Maquina de Editar" (daily 23:55 + at logon, user-level, hidden) runs Maquina de Editar\atualizar-backup-github.ps1 (git pull --ff-only + juntar_partes, never pushes), log atualizar-backup-github.log. sincronizar.py now skips paths the repo .gitignore ignores (e.g. trabalho/renders).
