# Máquina de Editar · como restaurar em qualquer conta

Esta pasta é o núcleo do projeto "Edição de Vídeo com IA": método, regras de gosto, motor de vídeo, biblioteca de lições, ferramentas e a memória do Claude. Não tem senhas nem vídeos pesados.

## Jeito 1 (recomendado): Claude Code no seu PC
1. Descompacte a pasta onde quiser (ex.: `Documentos\maquina-de-editar`).
2. Abra o Claude Code dentro dela (`cd` até a pasta e rode `claude`, ou abra a pasta no app).
3. Pronto. O Claude lê o `CLAUDE.md` sozinho e as skills de `.claude\skills` já aparecem. Diga: "leia a memoria/MEMORY.md e continue de onde paramos".
4. Para renderizar: instale Node e Python, depois `cd estudio\motor` e `npm i`.

## Jeito 2: novo Projeto no claude.ai (nuvem, igual a este)
1. Suba esta pasta para um repositório privado no SEU GitHub pessoal (o Claude faz isso por você se você conectar o GitHub).
2. No novo Projeto, adicione esse repositório em Configurações > Recursos. O Claude da nuvem lê o `CLAUDE.md` do repositório.
3. Na primeira mensagem peça: "importe a memória de memoria/ para a memória do projeto".

## Chaves que você precisa recriar (nunca ficam no backup)
Pexels, Freesound, Jamendo, Pixabay (grátis), Apify (grátis), ElevenLabs, cookies do X (`setx TWITTER_AUTH_TOKEN` e `TWITTER_CT0` no PC). Coloque em `ferramentas/busca/chaves.env` ou `.env`; o `.gitignore` impede que subam para o GitHub.

## Manter o backup em dia
O projeto continua crescendo. No projeto original, o script `backup/gerar-backup.sh` refaz este pacote com tudo o que é novo; rode de vez em quando (ou peça ao Claude "atualize o backup").
