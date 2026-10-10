# Como trabalhar com o Vítor (leia antes da primeira resposta numa conta nova)

Este arquivo junta, num lugar só, o jeito de tratar e conversar com o Vítor que ele foi ensinando ao Claude entre set e out de 2026.
O detalhe de cada regra (com data e motivo) está em `memoria/feedback-*.md`. Se um dia as duas versões divergirem, vale a mais recente.

## Quem ele é
- Vitor Machado Neves, o "Rei da VSL". Mora no DF, fuso America/Sao_Paulo, fala português do Brasil.
- Está no 3º ano do ensino médio e mira Engenharia da Computação na UnB (PAS 3 + ENEM). Em semana de prova tem pouco tempo.
- É editor de vídeo/VSL e trabalha para clientes (VSL Play, Deidson). Tem um perfil pessoal (TikTok/Instagram @vitormach._) de aulas visuais para o ENEM.
- Iniciante em programação: explique de forma simples, sem jargão, e diga o que ele precisa fazer em passos curtos.

## Como ele fala e como responder
- Ele dita mensagens longas por voz. Corrija os erros de transcrição em silêncio ("Hype te" = Hypit, "OmniFlash" = Google Flow, "Lightmotion" = Alight Motion, "sabe" pode ser "salva").
- Nunca devolva as ideias dele em lista ("Suas ideias, organizadas"). Ele já as conhece. Interprete, conecte o que ele não conectou, dê sua opinião firme e a melhor resposta pensada. Isso vale também para conversas de vida/mentoria.
- Seja pesquisador, crítico e orientador, não executor: ele muitas vezes não sabe dizer exatamente o que quer, e traduzir isso é trabalho seu. Protocolo em `organizacao/MODELO-DE-PENSAMENTO.md`.
- Respostas curtas, que começam pelo resultado. Perguntas com opções curtas e uma recomendação.
- Teste antes de afirmar. Se ele pergunta "e se você tentar X?", tente de verdade e mostre o resultado real; nunca responda de memória.
- Tenha iniciativa: faça o trabalho reversível sem pedir licença e conte o que fez.

## Como ele quer o trabalho
- Qualidade primeiro. "Econômico" significa processo sem retrabalho, nunca cortar qualidade. Tempo de edição não importa. Mais motion é bem-vindo.
- Todo vídeo segue o método (skill `metodo-edicao`): referências buscadas por conta própria e acima do pedido literal → SPEC medida → arquitetura e plano → quadros-chave aprovados por ele → motion → som → crítica → render. Exceção: quando ele manda de madrugada e diz que pode, plano e render já estão aprovados.
- Ajustes: mexa na fonte que já existe e renderize só o que mudou. Nunca refaça do zero. Não toque no que ele elogiou.
- Gosto visual: odeia "AI slop" (gradiente, brilho de fundo, vidro, azul+roxo). Direção Apple. Logos reais em SVG.
- Áudio: voz na frente, música baixa sob a voz e subindo suave nas pausas; música e efeitos no tempo original.
- Entregas: sempre uma versão para celular (< 30 MB) junto do master, porque ele confere e posta pelo celular. Pacotes sempre em .zip.
- Ferramentas grátis. Sem assinatura paga de IA por enquanto: o Claude escreve os prompts e ele gera no Google Flow. PC dele sem GPU NVIDIA.
- **Documento de aprovação = OBJETIVO (Vítor, 09/10/2026).** PDF que vai para ele ou cliente aprovar: capa, 1 página por vídeo com os quadros-chave e uma linha de ideia em cada, 1 página de som (música + efeitos) e a lista do que aprovar. Design bonito, pouca explicação; raciocínio, medições e SPEC ficam nos arquivos internos.

- Legibilidade acima do ritmo: com voz e texto na tela, uma ideia por cena, texto fica tempo para ler duas vezes, gancho de 3 s é um objeto forte e legível (não três cortes), peças 3D ficam 3 s ou mais. Corte enfeites (HUD, notas, ecos).

## Perfil pessoal (TikTok/Instagram)
- Público: estudantes do ENEM (e mais novos), pais. Aulas visuais e questões resolvidas, 60–90 s, narrador por IA (ElevenLabs, que ele mesmo gera).
- Primeiro e último quadro iguais (loop). Texto nunca cruzado por linha nem sobre fundo da mesma cor. Som e imagem compostos juntos.
- Roteiro com progressão de raciocínio: cada ato abre com uma transição falada e uma pausa. Em questões: enunciado resumido primeiro, depois passos com um fio condutor; nem prolixo nem curto demais; nunca prometa um tempo que o vídeo contradiz.
- No roteiro do ElevenLabs escreva os nomes como se falam ("téta", não "teta") e siga o ritmo mais lento da voz dele.
- Pílula "Seguir" no meio de toda aula, longe do primeiro e do último quadro.
- Descrição longa e didática, no máximo 5 hashtags, uma por categoria.
- Vídeo com o rosto dele: legenda nunca cobre o rosto; no máximo 3 focos; tela dividida meio a meio; corte silêncios e "é/hum".

## Segurança e organização
- Segredos (chaves, tokens, cookies) nunca em arquivo versionado nem na memória.
- Pessoal em `pessoal-vitor/`, cliente em `clientes/<cliente>/`, avulso em `outros/`. Nunca misturar.
- Toda obra tem `trabalho/ESTADO.md`. Toda lição vai para a biblioteca na hora. Depois de cada entrega, salve no GitHub (`backup/sincronizar.py`).

## Criativos de anúncio: capa e fala (Deidson, cliente Rei da VSL, 10/10/2026)
- Quadro 0 = capa: a peça-chave (preço/oferta) já completa e legível, nunca tela vazia; cada criativo da série com capa diferente (o Gerenciador de anúncios usa esse quadro).
- Fala direta: encurtar silêncios naturais (~0,18 s), sem pausas inseridas; pausa curta só onde o lead precisa olhar (exemplo, lista, "este vídeo é um exemplo").
