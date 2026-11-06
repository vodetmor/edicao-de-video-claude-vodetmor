# Nosso Estúdio de Vídeo: plano (02/10/2026)

> **Decisão do Vítor (02/10, 16:28 UTC): nada de over-engineering.** Ferramenta única = Remotion (o teste A, que ele achou o melhor, é Remotion puro). HyperFrames = só livro de receitas (técnicas reescritas em React no estilo do A). Hypit = só a ideia (palavra-âncora + variações), já dentro da nossa spec/fábrica. A ponte HTML/GSAP (teste B) fica guardada como plano B, sem uso por padrão.

## 1. Suas ideias, organizadas
1. Você quer um sistema **nosso**, juntando o melhor do Remotion (React), do HyperFrames (HTML) e do Hypit, com acabamento de After Effects / Alight Motion.
2. Dois usos:
   - **A. Motion graphics caprichados e longos** (VSL, institucional, escola, conteúdo pessoal).
   - **B. Criativos em massa**: você manda brief, referências e anúncios escalados; eu produzo, testo variações e trago o que é interessante.
3. Ferramentas pagas (Higgsfield e outras) ficam para depois. Já deixei o lugar das chaves pronto (`estudio/motor/.env.exemplo`).
4. Enquanto isso, eu escrevo os prompts e você gera os clipes no **Google Flow** com suas várias contas.
5. Você fala por áudio transcrito. Toda mensagem grande eu devolvo assim, organizada, como seu bloco de notas.

## 2. Dá para juntar os três? Sim. O segredo é este:
Os três desenham do mesmo jeito por baixo: **uma página web fotografada quadro a quadro dentro de um navegador**.
- O Remotion escreve essa página em React (que vira HTML).
- O HyperFrames escreve direto em HTML + CSS + GSAP.
- O Hypit usa o HyperFrames por baixo.

Então não precisamos escolher um. Pegamos o **Remotion como motor** (foi ele que deu o 10/10, já tem áudio, 4 formatos e render rápido) e encaixamos o resto dentro dele:

| De onde | O que pegamos | Status |
|---|---|---|
| Remotion | Motor, áudio, render em lote, molas e desfoque de movimento | já era nossa base |
| HyperFrames | 22 blueprints + catálogo de transições, escritos em HTML/GSAP | **ponte pronta**: o HTML deles roda dentro do Remotion (teste B) |
| Hypit | A ideia de roteiro preso às PALAVRAS e de soltar dezenas de variações | **feito do nosso jeito**: spec + fábrica (testes A, B e C) |
| After Effects | Animações exportadas do AE (Lottie/Bodymovin) e as grátis do LottieFiles | pacote instalado, falta testar |
| Google Flow (agora) / Higgsfield (depois) | Clipes de IA para clima e B-roll | kit de prompts a montar |

## 3. Como o estúdio funciona (do pedido ao vídeo)
1. **Entrada:** brief, referências, anúncio escalado, voz (sua, do cliente ou ElevenLabs).
2. **Análise:** transcrição palavra por palavra; medição da referência (ritmo dos cortes, cores, tamanho do texto); SPEC.
3. **Roteiro em spec (JSON):** cada coisa na tela e cada som é presa a uma palavra falada (`"de": "antes"`, `"ate": "VSL-2"`). Mudou a fala, tudo acompanha.
4. **Catálogo de blocos:** React (Batida, Slam, Botão, Trilha, Legenda), cenas HTML/GSAP do HyperFrames, Lottie do After Effects, clipes do Flow, sons sintetizados.
5. **Motor (Remotion):** monta imagem e som.
6. **Fábrica:** renderiza N variações em N formatos (9:16, 4:5, 1:1, 16:9) e normaliza o áudio em -14 LUFS.
7. **Revisão com olhos novos:** folha de quadros, volume, legenda, nada parado. Só depois entrega.

- **Uso A (longo):** o mesmo motor, com o processo padrão ouro inteiro (referências → SPEC → arquitetura → plano → parâmetros → edição → crítica).
- **Uso B (massa):** uma spec com várias variantes. Trocar gancho, copy, cor, formato ou voz é mudar o JSON, sem mexer no código.

## 4. A prova (feita hoje)
Gancho do criativo 2 ("Seu botão de compra aparece antes da sua VSL apresentar a oferta"), voz do cliente, 3 variações saídas de **um arquivo só** (`estudio/motor/specs/gancho-c2.json`):
- **A, tipográfico (React, 9:16):** título que sobe palavra a palavra, botão que nasce em "aparece", "ANTES" batendo em "antes" e a linha do tempo da VSL mostrando o botão no 00:07 e a oferta no 12:40.
- **B, player escuro (HTML + GSAP do jeito HyperFrames, 9:16):** a cena foi escrita como o HyperFrames escreve e rodou dentro do Remotion, presa às mesmas palavras.
- **C, feed 4:5:** outra copy ("Seu CTA chega cedo") e outra cor, mudando só a spec.

Números: 5,3 s cada, de 7 a 9 s de render por variação, -14 LUFS. Arquivos em `estudio/teste-gancho/`.

**Limites do teste:** é uma prova da máquina, não um anúncio pronto. No B o apresentador é uma foto, não vídeo. A cama musical é um pulso simples sintetizado.

## 5. Google Flow agora, Higgsfield depois
- **Kit de prompts do Flow** (a montar): um cartão por plano, com assunto, câmera, luz, movimento, duração, formato e o que evitar; nome de arquivo padronizado; você gera e sobe na conversa, eu corto, ajusto a cor e encaixo.
- Regras que já valem: IA só para clima e B-roll, nunca para fingir arquivo real. **"Prompt não entrega cor; medição entrega"**: a cor certa vem da correção depois, medida na referência.
- Quando você assinar o Higgsfield (ou outro), é só colar a chave no `.env`. Aí o Hypit e o Higgsfield entram para gerar apresentador, produto e variações de gancho com IA.

## 6. Próximos passos (ordem sugerida)
1. **Você assiste aos 3 testes** e diz qual linguagem prefere (ou o que mudaria).
2. Portar os melhores blueprints do HyperFrames para o catálogo (kinetic-type-beats, camera-journey, dataviz-countup, logo-assemble-lockup, cursor-ui-demo, cta-morph-press) e as transições.
3. Testar uma animação Lottie (ponte com o After Effects).
4. **Módulo "anúncio escalado":** baixar o anúncio (Meta Ad Library / TikTok), transcrever, medir, escrever a spec "modelada" e soltar variações.
5. Kit de prompts do Flow + pasta de entrada dos clipes.
6. Passar os criativos 2 e 3 para spec (prova de um anúncio inteiro no motor novo).
7. Guardar o motor num repositório GitHub privado (já estava planejado).

## Onde está cada coisa
- Motor: `/mnt/project-files/estudio/motor/` (README com os comandos)
- Estado: `/mnt/project-files/estudio/ESTADO.md`
- Teste: `/mnt/project-files/estudio/teste-gancho/`
