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
