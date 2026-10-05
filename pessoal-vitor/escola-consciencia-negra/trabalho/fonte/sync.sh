#!/bin/bash
# copia o código (sem node_modules/public pesado) para a pasta persistente
rsync -a --delete --exclude node_modules --exclude public --exclude out /tmp/claude-0/-home-user/06455727-8e48-56fd-bf51-52c2e89c9761/scratchpad/nm/ /mnt/project-files/escola-consciencia-negra/trabalho/fonte/ 2>/dev/null || (cd /tmp/claude-0/-home-user/06455727-8e48-56fd-bf51-52c2e89c9761/scratchpad/nm && tar cf - --exclude=node_modules --exclude=public --exclude=out . | (cd /mnt/project-files/escola-consciencia-negra/trabalho/fonte && tar xf -))
