# Plano: skill de edição de vídeo para vender (Vítor + Jerônimo)

Data: 29/10/2026. Base: conversa e áudios/vídeos do Jerônimo (transcritos em `contexto-jeronimo/`), curso "Máquina de Edição IA" (Tiago Lemos), 7 skills "cp-*" do Cofre/Caixa Preta, README do REA.
Cobertura da leitura e aprendizados completos: ver `APRENDIZADOS.md` (atualizado depois do plano; inclui as references das skills e a skill carrossel-animado, que não estavam na primeira versão).

## 1. A oferta, como entendi

- Produto: pacote de skills para o cliente jogar no próprio Claude e editar sozinho. Preço-alvo R$ 97 (os dois concorrentes que o Jerônimo mostrou vendem nessa faixa).
- Promessa: "grave uma vez, jogue na IA, saia 100% editado: cortes, sem respiros, legendado, em vários formatos/estilos. 10 vídeos gravados viram dezenas de posts."
- Fluxo do cliente: vídeo bruto → remove respiros, pausas e repetições → escolhe legenda (arsenal de estilos) → escolhe formato (tela dividida, recorte com fundo, Canvas Funnel, Funnel Miro, 3D explicativo...) → sai a versão. O cliente vê os templates antes de escolher.
- Divisão: Jerônimo é a cara, vende e monta a LP; Vítor edita e constrói/melhora as skills. Jerônimo já tem uma skill pela metade (ads + conteúdo), drives de músicas/efeitos e dois estilos preferidos (Canvas Funnel e Funnel Miro).
- Ordem: primeiro o núcleo (X skills funcionando), depois aulas e bônus. Dá para prometer as aulas e gravar depois. Mini comunidade no WhatsApp para feedback.
- Biblioteca estilo Git: uma skill mestre (índice/roteador) + skills por estilo ("vitor-split", "vitor-documentario"...). Uso: "edite esse vídeo no modelo X".

## 2. O que o curso ensina que vale absorver (ideias, não o texto)

1. Fluxo barato: amostra de 8 s com fala + legenda + 1 inserção, aprovar, só então o vídeo todo. Corrigir por trecho ("entre 10 e 15 s aumente a legenda"). Preservar decisões aprovadas entre vídeos.
2. Pasta por projeto com 4 subpastas (originais, assets, projeto, entregas) e retomada pela pasta.
3. Remotion como motor, animação sempre derivada de frame (nada de CSS animations), exportar só no fim.
4. Ficha de direção, mapa de cenas, matriz de variações (1 variável por versão), checklist da amostra.
5. Skill bem escrita: descrição clara de quando usar, critérios de aceite observáveis, "observado / inferido / não verificável", referências em arquivos separados.
6. Cofre = skill por estilo, com vídeo de exemplo por nicho; o cliente só baixa a skill, arrasta com o vídeo e pede "edite no modelo pulso".
7. Carrossel: um slide, uma ideia; um verbo de movimento por slide; loop sem pulo.
8. Honestidade de custo: a qualidade depende do modelo (Opus 5.5 em esforço alto) e o cliente precisa de plano pago.

## 3. Onde nós já somos mais fortes (e onde não)

- Já temos: método de 10/10 (SPEC → plano → quadros-chave → crítica), DESIGN-SYSTEM, motor Remotion com eventos presos às palavras e variações em lote (`estudio/motor`), legenda contínua definida, mix de áudio com ducking, busca de material real.
- Diferencial possível: cortes, legendas e formatos feitos por scripts determinísticos (ffmpeg + transcrição), usando o Claude só para dirigir. Isso gasta muito menos token do cliente, que foi justamente a dor do Jerônimo (esgotou o Claude em 4 dias).
- Ponto fraco a resolver: recorte de fundo de qualidade (green screen sem fundo verde) e 3D. Depende de segmentação; hoje não validamos em ambiente de cliente. Prometer só o que provarmos.

## 4. Riscos e cuidados (importante)

1. **Não revender o conteúdo do Tiago.** O ebook diz que o leitor pode adaptar comandos/skills para uso nos próprios projetos, mas não autoriza redistribuir o material. As skills "cp-*" são um produto pago (Caixa Preta). O ebook ainda tem marca d'água de licença com dados pessoais de outra pessoa. Uso certo: aprender o método e escrever as nossas skills do zero, com nossa linguagem e nossos estilos.
2. **Modelar não é copiar.** Para os dois concorrentes: observar páginas e vídeos públicos, listar estilos e estrutura da oferta, criar os nossos. Não extrair nem copiar arquivos pagos deles.
3. **Transparência sobre o Claude pago.** O Jerônimo disse que não precisa revelar a necessidade de assinatura. Minha recomendação: dizer na página, de forma simples ("funciona no Claude, plano Pro ou maior"). Esconder gera reembolso, reclamação e problema com anúncio. Concorrentes que escondem perdem confiança.
4. **Promessas de resultado.** Só mostrar exemplos que realmente rodamos com o pacote vendido (o próprio Jerônimo já pensou em não prometer demais na LP).
5. **Consumo do cliente.** Skills precisam ser enxutas, carregar referências só quando precisa e ter modo "econômico".
6. **Música/efeitos dos drives dele.** Conferir licença antes de empacotar para revenda.

## 5. REA (engenharia reversa)

Li o README: é um MCP local (`npx rea-agents setup`) que analisa binários, apps Electron/JS, .NET e sites, com evidências. Utilidade aqui:
- Útil: entender como a plataforma/painel dos concorrentes (LP, painel web) está estruturado, e conferir que o nosso pacote instala limpo.
- Não é para: abrir e copiar as skills ou o conteúdo pago deles.
- Instala no PC do Vítor e mexe na configuração do agente, então só instalo com seu OK explícito. Não é necessário para o MVP.

## 6. Produto proposto (MVP enxuto)

Nome provisório do pacote: **"Vítor Edita"** (a decidir). Estrutura:

- `ve-mestre`: roteador. Pergunta pasta/vídeo, mostra o catálogo de estilos, escolhe o fluxo e aplica o modo econômico.
- `ve-limpeza`: cortes (respiros, pausas, repetições, erros) por transcrição + silêncio. Scripts, não LLM.
- `ve-legendas`: 5 a 6 estilos de legenda.
- `ve-formatos`: saída em 9:16, 1:1, 16:9 a partir da mesma edição.
- Estilos (um por skill, com vídeo de exemplo): `split` (tela dividida), `funnel-canvas`, `funnel-miro`, `explicativo-3d` (opcional se provarmos qualidade), `documentario`, `recorte` (só se validado), `passos`.
- `ve-variacoes`: 1 variável por versão, matriz e nomes de arquivo (resolve "10 vídeos viram dezenas").
- `ve-anuncios` e `ve-conteudo`: as duas trilhas que o Jerônimo começou.
- Instalador de um clique e guia "Projeto do Claude" (preferência do Vítor) vs "Claude Code".

Entregáveis de venda: LP (Jerônimo), 4 a 6 mini-aulas (instalar, projeto vs Claude Code, primeiro vídeo, escolher estilo, economizar token), PDF de início rápido, grupo no WhatsApp.

## 7. Cronograma proposto (ajustável)

- **Fase 0, até 31/10:** Jerônimo manda a skill em andamento, drives (só lista/licença), links dos dois concorrentes e dos 2 estilos que quer. Vítor fecha nome, preço (R$ 97?) e divisão financeira.
- **Fase 1, até 05/11:** esqueleto + `ve-limpeza` + `ve-legendas` + 2 estilos (Canvas Funnel e Funnel Miro) testados de ponta a ponta com 1 vídeo do Jerônimo. Eu monto a SPEC dos estilos e os quadros-chave para aprovação antes de renderizar.
- **Fase 2, até 12/11:** mais 3 a 4 estilos, `ve-formatos`, `ve-variacoes`, instalador. Teste com 3 beta (grupo de WhatsApp) e coleta de gargalos/consumo.
- **Fase 3, até 18/11:** LP, mini-aulas, vídeo de demonstração (feito com o próprio pacote), checkout.
- **Lançamento:** fim de novembro / ofertas de novembro, conforme o Jerônimo.

## 8. O que eu preciso de vocês

1. Skill parcial do Jerônimo + a lista de estilos que ele já definiu (e referências dos "Canvas Funnel" e "Funnel Miro").
2. Decisão sobre transparência do Claude pago (recomendo declarar).
3. OK para eu escrever as skills do zero (sem usar o conteúdo do Tiago) e para pesquisar os concorrentes só por conteúdo público.
4. OK para usar o REA? (opcional; se sim, instalamos no PC do Vítor com aprovação.)

Próximo passo que eu faço assim que houver OK: transformar a Fase 1 em SPEC + plano com quadros-chave, no nosso padrão.

## Anexo: skill do Jerônimo (quimera.club/editorvideo-estilos, visto em 29/10)

Página de comparação do "editorvideo" dele: o mesmo vídeo cru (IMG_4309, 20 s) vira 16,5 s com corte de respiros, legenda e 7 estilos (9:16):
1. Corte limpo: corte seco, zoom nos pontos fortes, legenda palavra por palavra.
2. Painel explicativo: painel em cima com cartão, contador e lista; apresentador embaixo.
3. Split diagrama: tela dividida, diagrama embaixo, legenda karaokê.
4. Canvas funil: mapa que se desenha com a fala e recua no fim.
5. Funil Miro: mesmo mapa em quadro quadriculado, linhas em cotovelo.
6. Recorte em grade: apresentador recortado no meio de 4 imagens que trocam juntas.
7. Interface atrás: telas de app atrás da cabeça, notificação no peito.

Leitura crítica (olhando quadros de cada estilo): a base já é boa e tem a lógica certa (um verbo de movimento por cena). Pontos a evoluir: legendas pequenas e com pouco contraste em alguns estilos, painéis com texto miúdo no celular, fundo cinza liso nos funis (pouca profundidade), e o 6 e o 7 parecem os mais frágeis na leitura. Contra o nosso DESIGN-SYSTEM: sem gradiente/brilho, um azul, Inter + Phosphor, molas. É aqui que a nossa versão pode ganhar.

Referências citadas por ele: "o gringo" (10 estilos, vídeos longos, plataforma própria, pré-lançamento com lista) e "o BR" (70 mil seguidores, R$ 97, skills por estilo com vídeo de exemplo, PDF, bônus). Decisão dele: misturar os dois, começar só com vídeos curtos. Links da conversa ainda não abertos: reel do Instagram (exige login) e a LP edicaomia.com.br (do curso do Tiago).
