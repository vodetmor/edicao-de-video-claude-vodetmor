---
name: maquina-de-editar
description: Índice da Máquina de Editar (C:\dev\maquina-de-editar), a base de conhecimento e o motor de vídeo do Vítor. Use em QUALQUER pasta ou sessão (monorepo, sites, ofertas, clientes) quando o pedido envolver editar ou criar vídeo, criativo/anúncio em vídeo, motion, legenda, música, locução, variações em lote, ou PDF de aprovação de vídeo. Diz o que ler primeiro, onde estão método, motor, ferramentas, lições e como entregar, para não recriar do zero.
---

# Máquina de Editar: como usar a partir de outra sessão

A Máquina é um repositório (`C:\dev\maquina-de-editar`, GitHub `vodetmor/edicao-de-video-claude-vodetmor`) com método, gosto, motor, ferramentas e lições de vídeo acumulados vídeo a vídeo. **Não recrie nada disso na sessão atual**: leia, use e devolva o que aprender.

## 0. Antes de tudo (nesta ordem)
1. `git -C C:\dev\maquina-de-editar pull --rebase --autostash`
2. Ler `C:\dev\maquina-de-editar\CLAUDE.md` inteiro (fora da pasta ele não carrega sozinho). Ele manda mais que as seções 4 e 6 do CLAUDE global nesses assuntos.
3. Se for retomar uma obra: só o `ESTADO.md` dela (`clientes\<cliente>\<obra>\trabalho\ESTADO.md`).
4. Procurar fato ou decisão antiga em `memoria\MEMORY.md` (índice de uma linha por fato) com Grep, sem abrir tudo.

## 1. Onde está cada coisa (caminhos completos)
| Preciso de | Está em |
|---|---|
| Método (referências, SPEC, plano, aprovação, motion, som, crítica) | skill `metodo-edicao` (`.claude\skills\`) |
| Gosto e regras visuais, lições de motion | `motion-base\DESIGN-SYSTEM.md`, `motion-base\LICOES-MOTION.md` (ler as seções do assunto) |
| Motor Remotion (blocos, specs em lote, GLSL) | `estudio\motor\` (README + skill `motor-estudio`); composição de criativo de revenda: `src\vix\` |
| Editar vídeo falado bruto (cortes, rosto, legenda, estilos) | `estudio\editor\` + skill `editar-video` |
| Material real grátis (Pexels, Wikimedia, Archive, SFX) | `ferramentas\busca\busca.py` (registra licença) |
| Música | Freesound, Jamendo (CC BY, avisar crédito), Epidemic Sound (API `/v0`, Bearer; hoje só prévia, ver lições), `motion-base\musica\` |
| Voz | edge-tts para rascunho (`organizacao\amostras-voz\`); ElevenLabs final (PT-BR só pelo site) |
| Tempo de cada palavra da voz | `python -I ferramentas\transcrever_palavras.py voz.mp3 --out pasta` |
| Pesquisa de referências (X, Pinterest, anúncios) | skills `pesquisa-referencias` e `pesquisa-proativa`; Apify para Ad Library |
| PDF de aprovação (quadros-chave, som, checklist) | skill global `pdf-aprovacao` |
| Mixagem voz + música (ducking, -14 LUFS) | `estudio\motor\mix_vix.sh` |
| Ofertas em massa, avatar, API | `memoria\uso-ofertas-e-massa.md` |
| Chaves | `C:\dev\maquina-de-editar\.env` e `ferramentas\busca\chaves.env`. Ler por variável, **nunca copiar valor** para arquivo, commit, memória ou chat |
| Mapa de pastas antigas e novas | `organizacao\MAPA-DE-CAMINHOS.md` |

## 2. Fluxo para um vídeo de cliente (a partir de qualquer sessão)
1. **Criar a obra na Máquina**, não na pasta da sessão: `clientes\<cliente>\<obra>\` com `trabalho\ESTADO.md` (feito, próximo passo, comandos exatos), `entrada\`, `identidade\`, `saida\`. Pessoal em `pessoal-vitor\`, avulso em `outros\`. Nunca misturar clientes.
2. **Discovery curto**: objetivo, público, onde roda, o que NÃO pode aparecer (promessa, marca de terceiro), identidade visual do cliente (manda sobre o DESIGN-SYSTEM da Máquina), referências.
3. **Referências e SPEC**: medir (cortes por segundo, cores, loudness) antes de planejar.
4. **Portão de aprovação OBRIGATÓRIO** antes do render completo: história por criativo, quadros-chave e PDF pela skill `pdf-aprovacao`. "Já está aprovado" do Vítor não substitui o OK de quem decide (sócio, cliente). Caso VixPlay: duas rodadas de render perdidas por pular isso.
5. **Cada criativo da mesma entrega tem história, ritmo e takes próprios.** Mesma estrutura em 4 vídeos = "tudo igual". Vídeo modelado de referência de terceiro: cobrir marcas, trocar copy e voz, nunca dublar boca nem inventar depoimento.
6. **Motion**: app ou produto visível o tempo todo; overlay compacto (≤ ~1/3 do quadro); legenda base a 87%; voz na frente, música 18 a 22 LU abaixo com ducking; master -14 LUFS / -1 dBTP.
7. **Render e conferência**: render longo (~5 min por vídeo de 30 a 50 s) em segundo plano; olhar quadros do resultado e comparar com o original antes de mandar.
8. **Entrega**: arquivos em `saida\`; para o celular, teto de 30 MiB (gerar `-leve`, CRF 22 a 24). Música de prévia (Epidemic) só como rascunho: avisar.
9. **Fechar**: lição nova em `motion-base\LICOES-MOTION.md` na hora, fato ou feedback em `memoria\` (+ linha no `MEMORY.md`), `ESTADO.md` atualizado, commit com caminho explícito (nunca `git add -A`), `git push origin main` e avisar o Vítor para a nuvem copiar a mudança.

## 3. Cuidados que já custaram caro
- Produção de terceiro e promessas: ler o "o que não pode aparecer" do cliente (VixPlay: sem nome de canal ou streaming, sem "melhor", sem "na hora", sem legalidade).
- Logo real do cliente, nunca redesenhado; conferir se o arquivo traz slogan proibido (usar a versão sem).
- Windows: caminho `C:/...` em Python (não `/c/...`), JSON com `encoding='utf8'`, heredoc com JSX trava (usar Write), vídeos de terceiros e música licenciada ficam fora do Git.
- Gasto: não usar serviço pago (ElevenLabs música, Higgsfield, fal) sem pedir.
- Sessão paralela mexe no mesmo repo: `pull --rebase --autostash` antes, commit só dos seus arquivos.

## 4. Quando NÃO usar
Assuntos sem vídeo (sites, ofertas sem vídeo, código do app). A Máquina não é carregada fora do tema.
