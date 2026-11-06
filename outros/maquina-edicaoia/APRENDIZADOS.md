# Aprendizados do curso "Máquina de Edição IA" (em palavras nossas)

Material estudado em 29/10/2026 (comprado pelo Vítor e pelo Jerônimo). Isto é um resumo de ideias para MODELAR, não cópia: nenhum texto, skill ou arquivo do Tiago vai para o nosso pacote.

## Cobertura real da leitura
- Lido por inteiro: 7 skills cp-* com suas references (zip completo), modelos e fichas, skill `carrossel-animado` completa (SKILL, 8 references, molde Remotion, scripts), conversa e 28 mídias do Jerônimo, página `quimera.club/editorvideo-estilos` com os 7 estilos, transcrições de Fundamentos (2, 3, 3.1, 4, 5.1, transição, apresentação), Claude 5, 5.1, 6, 7, 8, 9, 10, 11, Extra, Premium, Carrossel, ChatGPT 09, ebook (sumário, apresentação, caps. 15 e 16, apêndices C e D), títulos e prompts do painel.
- Só estrutura/títulos: ChatGPT 05, 06, 07, 8.1, 8.2 e 10 (repetem a trilha Claude), demais capítulos do ebook (espelham as aulas), corpo dos 10 "modelos" e 16 "comandos" do painel e as 28 videoaulas em si (usei as transcrições).

## O método (o que realmente gera resultado)
1. **Uma pasta por projeto** com originais (intocados), assets, projeto, entregas. Retomar = abrir a mesma pasta e dizer que está retomando.
2. **Briefing em 7 partes**: material, objetivo (o que a pessoa faz depois), formato, estilo com critérios verificáveis (não "moderno"), sequência visual, o que preservar, entrega (amostra ou final).
3. **Amostra antes do todo**: 8 s com fala + legenda + 1 inserção; 10 a 15 s quando há transição de enquadramento; 5 s para testar técnica arriscada (3D, recorte). Aprovar pequeno, aplicar no resto.
4. **Correção localizada**: trecho, problema, mudança, "não mexa no resto". Reaproveitar cálculos caros já feitos (ex.: recorte salvo).
5. **Padrão reutilizável**: depois de aprovado, documentar regras visuais separadas dos dados da oferta; próximo vídeo = cópia do projeto + nova transcrição + nova amostra. Lote pequeno (até 3), um de cada vez.
6. **Conferência final** em passagem sem efeitos novos; assistir no tamanho do celular.
7. **Sincronia pela fala real** (transcrever a gravação; roteiro só confere grafia). Nome de produto/marca é avisado antes porque a transcrição erra.
8. **Entregar o vídeo como prompt**: quando o apresentador fala o comando na gravação ("coloque algo 3D do meu lado"), o vídeo vira o prompt. Útil para um estilo do nosso pacote ("grave e dirija falando").

## Regras de edição que sustentam a qualidade
- Todo elemento tem função; um foco por cena; ícone com ação ligada ao sentido (calendário marca dias, checklist se preenche).
- Enquadramento muda quando a explicação precisa de espaço e volta quando ela acaba. Moldura mantém rosto centralizado e cabeça inteira, sem esticar a pessoa.
- Legenda até 2 linhas, longe das bordas (interface do Instagram), perto do queixo, sem cobrir rosto.
- 3D só quando resolve uma pergunta de volume; testar em vídeo, não em imagem parada. Recorte: testar 5 s com cabelo e mãos sobre fundo claro e escuro; salvar a camada transparente separada do MP4.
- Referência: dizer o que aproveitar (ritmo, posição, hierarquia) e o que não copiar (oferta, textos). Copiar o estilo de um criador do mesmo nicho tira autoridade.
- Remotion: movimento sempre derivado do frame; nada de CSS animations. Exportar só no fim; prévia custa só o computador.
- Honestidade: nada de preço, resultado ou depoimento inventado; gráfico ilustrativo é identificado como ilustrativo; nicho financeiro sem promessa.

## Economia de token (a dor do Jerônimo)
Separar assinatura, créditos extras e serviços externos. Modelo barato para tarefas simples, forte para composição difícil. Pedir previsão de consumo ao agente em tarefas pesadas. Preservar decisões aprovadas. Reaproveitar assets em vez de gerar. Esse é o ponto onde nosso pacote pode ser melhor: cortes e legendas por script, não por LLM.

## Como as skills deles são escritas (arquitetura a modelar)
- `SKILL.md` curto, com descrição que diz quando usar e quando NÃO usar; detalhes em `references/` carregados só quando necessário.
- Seções fixas: Decida a partir do material → Escolha/Construa → Valide → Critérios de aceite observáveis → Entregue com nota curta.
- Vocabulário honesto: observado / inferido / não verificável; "não prometa técnica que o ambiente não executa"; declarar limite em vez de fingir.
- Paradas de aprovação explícitas (ficha, amostra da capa, resto), perguntas com opções clicáveis, linguagem simples para leigo.
- `carrossel-animado` (a melhor peça): molde de projeto com peças prontas por verbo de movimento, `marca.ts` como único lugar da identidade, script `novo-carrossel`, script `conferir` que mede loop/margem e gera tiras de celular, efeitos sonoros próprios, regras que nunca quebram (título legível no quadro 0, loop sem pulo, 1 verbo por slide). Padrão a copiar como ENGENHARIA, escrevendo o nosso.
- Pacote com instalador (`instalar-skills.mjs`): prévia sem `--apply`, não sobrescreve skill diferente, destino por editor. Mais painel web com vídeo demo por skill e 10 "modelos" (presets de nicho) prontos para colar.

## Produto do Tiago (para posicionar o nosso)
Máquina de Edição IA (curso 10 aulas + ebook), Cofre/Caixa Preta (skills e presets por nicho: saúde, advogado, home office, corrida, vet, idiomas, golpe etc. com apresentador clonado em IA), Mestres da IA (upsell). Ele vende método + vitrine de resultados; o "Cofre" vende o atalho por estilo. Nosso risco/oportunidade: o Cofre é o concorrente direto de "skills por estilo".

## Alinhamento: o que já temos x o método do Tiago (conferido no repositório em 29/10)

| Tema do curso | Nós hoje | Situação |
|---|---|---|
| Pasta por projeto, retomar pelo estado | `<obra>/trabalho/` + `ESTADO.md` com comandos para refazer | Alinhado (e mais completo) |
| Amostra antes do todo | Portão de quadros-chave aprovados antes do render completo | Alinhado; a deles é amostra em vídeo (8 s), a nossa é storyboard em stills. Vale ter os dois |
| Correção localizada | Regra "mexa na fonte, renderize só o que mudou" | Alinhado |
| Remotion por frame, sem CSS animation | skill `remotion-best-practices` instalada | Alinhado |
| Sincronia pela fala real | Motor com eventos presos a palavras (spec JSON) | À frente (é do motor, não do prompt) |
| Referência: dizer o que aproveitar | `pesquisa-referencias` + SPEC medida (cortes/s, curvas, cores, loudness) | À frente (medimos; a extratora deles descreve) |
| Crítica independente e design system numérico | `DESIGN-SYSTEM.md`, portões G1-G6, crítica por sessão nova ≥ 8/10 | À frente (eles não têm) |
| Variações em lote | `fabrica.mjs` renderiza variantes + loudnorm | Alinhado; falta matriz/manifesto escrito (1 variável por versão) |
| Preço/ofertas sem inventar | Regras de cliente e checklist | Alinhado em prática, falta virar regra escrita nas skills |
| **Editar vídeo bruto de uma pessoa** (cortar respiros/erros/repetições, vertical com rosto centralizado, legenda pela transcrição real) | Não temos uma pipeline pronta. Nosso trabalho foi animação/anúncio narrado e conteúdos gerados | **Lacuna principal** e é exatamente o que o Jerônimo vende |
| Moldura do apresentador / tracking de rosto | Não temos | Lacuna |
| Recorte de fundo com alfa verificado | Não temos validado (há Blender/GLSL, mas sem matting) | Lacuna (testar antes de prometer) |
| Maquete 3D que explica | Blender por código e GLSL testados; Three.js não usado | Parcial |
| Carrossel animado em loop | Não temos | Lacuna (oportunidade de bônus) |
| Economia de token do cliente / previsão de consumo | Não formalizada (nosso foco foi qualidade) | Lacuna para o produto |
| Pacote instalável para terceiros (instalador, painel, presets por nicho) | Skills internas do Vítor, escritas para este projeto | Lacuna (é o que vira produto) |

### Ordem sugerida para colocar a lacuna principal em uso nosso e no produto
1. `ve-limpeza`: transcrever, achar respiros/erros/repetições, lista de cortes explicada, aplicar com ffmpeg. Comece pelo vídeo do próprio Vítor (pessoal) para validar.
2. `ve-vertical`: reenquadrar 16:9 para 9:16 com rosto centralizado e folga de cabeça, trajetória suavizada.
3. `ve-legendas`: nossa legenda do DESIGN-SYSTEM como estilo padrão + 4 variações.
4. Só então os estilos (funis, split, painel), reaproveitando o motor.
Cada passo entra na pasta `.claude/skills/` do projeto, para o Vítor usar já, e depois é empacotado para venda.

## Atualização 29/10, tarde: ebook lido por inteiro (cap. 6 a 16 + apêndices A e B) e o que virou código

Lido agora: primeira edição simples (amostra de 8 s, revisão no tamanho do celular), comparação de modelos (comparar a edição, não o nome do modelo; mesma entrada e mesmo pedido), imagens com função (uma inserção principal por vez, sincronizar pela fala real), moldura para motion explicativo (moldura ~42% × 34%, rosto centralizado, volta à tela cheia no convite), variações A/B/C (uma variável por versão), maquete 3D (teste de 5 s renderizado, `useCurrentFrame`, nunca `useFrame`, `--gl=angle`), recorte com alfa (teste de 5 s sobre fundo claro e escuro, guardar o alfa separado em WebM/ProRes, `@remotion/video-matting` exige WebGPU), aula horizontal (cortes que preservam respiros úteis, quadro branco à esquerda e moldura à direita, padrão documentado e reaplicado a novas aulas), edição no Claude Code (pedido 1 só cortes, aprovar, pedido 2 visual), revisão por trechos (trecho, problema, mudança, preservar; diagnóstico quando o erro repete), exportação e rotina (MP4 conferido fora da prévia, lote de até 3), glossário e fichas (briefing, referência, correção localizada, ficha de revisão, controle de custos, matriz de variações).

Virou código e skill nossos (escritos do zero) em `estudio/editor/` e `.claude/skills/editar-video/`:
- cortes antes do visual (limpar.py gera a proposta, o usuário/Claude aprova), amostra e quadros-chave antes do vídeo inteiro;
- moldura, tela cheia e "só explicação" como layouts com transição; rosto acompanhado;
- correção por trecho virou o painel de revisão (notas no quadro exato, prévia ao vivo, sem render);
- custos: fórmula por peça aprovada, ficha CSV, /usage, /model, /effort e teto de gasto, na referência `custos-e-tokens.md`;
- variações A/B/C e lote de 3 na referência `formatos-e-variacoes.md`; recorte e 3D com o portão do teste de 5 s em `avancado.md`.
Onde fomos além: pausas pela energia do áudio, tomadas repetidas e "corta" detectados sozinhos, safe zone das redes no layout, painel ao vivo.
