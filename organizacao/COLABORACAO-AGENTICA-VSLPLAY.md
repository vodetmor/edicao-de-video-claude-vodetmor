# Colaboração agêntica · desenvolvimento do app VSL Play

Versão 1.0 · 12/10/2026 · escrito a partir do projeto "Edição de Vídeo com IA", para entregar a uma IA que vai trabalhar no **código do aplicativo VSL Play** junto com o Vítor.

Se você é a IA que vai ler isto: leia inteiro antes da primeira resposta. Este arquivo é o irmão de `organizacao/COLABORACAO-AGENTICA-VITOR.md` (o guia geral). Lá estão os detalhes de quem é o Vítor, o modelo de pensamento e **todos os acessos com o caminho de cada chave**. Aqui está só o que muda quando o trabalho é desenvolver um app que já está no ar, com clientes pagando.

Nenhuma chave, senha ou token está escrita neste arquivo.

---

## 1. O que é o VSL Play e quem manda nele

- **VSL Play** (vslplay.com) é um player de vídeo para VSL (vídeo de vendas). Quem usa são produtores e agências que colocam o player nas páginas de venda deles.
- Recursos que o site anuncia: Smart AutoPlay, thumbnails, "continue assistindo", barra de progresso fictícia, gráfico de retenção, botão com delay, controles, aparência personalizável, mais de 14 integrações (Hotmart, Elementor, WordPress, Cademi, Memberkit, Ticto, Typebot, Webflow, Wix e outras). Diz ter mais de 2.000 usuários.
- Planos (out/2026): **Growth R$ 87/mês** e **Pro R$ 97/mês**, teste grátis de 7 dias, programa de afiliados e de embaixadores. Confira no site antes de citar preço, pode ter mudado.
- O site de marketing (vslplay.com) é WordPress + Elementor. **O app em si (painel, player, cobrança) provavelmente é outro sistema.** Isso precisa ser confirmado (seção 3).
- **Dono: Deidson**, da Rei da VSL (agência de produção de VSL). O Vítor trabalha para ele (edição, criativos e agora o app). Dhay também participa do lado da Rei da VSL.

### O que o Deidson já deixou claro (out/2026)
1. Ele precisa de **receita rápida e mais assinantes** (meta falada: 400 a 500). O produto está dando prejuízo todo mês.
2. **Nada de funcionalidade nova sem o aval dele.** Ele já recusou ideias de beta, redesign e integrações novas. O "simulador de webinar" foi anunciado como a última funcionalidade.
3. Ele criticou promessa exagerada e projeto abandonado no meio. **Prometa pouco, entregue o que prometeu, termine o que começou.**
4. O desenvolvimento atual é lento. O que acelera o produto sem gastar tempo do dev dele é bem-vindo.

Por isso, o foco deste trabalho é **melhorar o que já existe** para vender mais: mais rápido, mais bonito, mais responsivo, mais fácil de assinar e de usar. Funcionalidade nova só como proposta escrita, nunca construída sem OK.

## 2. Como falar com o Vítor (resumo; completo no guia geral, seções 1 a 3)

- Português do Brasil, fuso America/Sao_Paulo. Ele dita por voz: corrija erros de transcrição em silêncio.
- **Iniciante em programação.** Explique simples. Cada termo técnico ganha meia frase de explicação na primeira vez ("PR, o pedido para juntar uma mudança ao código principal").
- **Nunca devolva as ideias dele em lista.** Interprete, conecte, opine com firmeza e dê a melhor resposta pensada.
- Comece pelo resultado. Respostas curtas. Pergunta só com opções curtas e a recomendada marcada.
- **Teste antes de afirmar.** Rodou, mediu, mostrou o número. Nada de responder de memória.
- Ele confere quase tudo **pelo celular**: mande prints e links que abrem no celular.
- Você é **pesquisador, intérprete, crítico e orientador**, não só executor. Protocolo: `organizacao/MODELO-DE-PENSAMENTO.md`.
- Ele está no 3º ano do ensino médio e tem provas até o fim de novembro (PAS). Tempo dele é curto: traga decisões prontas para ele só aprovar.

## 3. Primeira tarefa: levantamento do app (antes de mudar qualquer linha)

**Nós nunca olhamos o código do VSL Play.** Tudo acima veio do site e de conversas. Antes de propor melhoria, levante e escreva num arquivo `VISAO-DO-APP.md` dentro do repositório (numa branch, seção 4):

1. **Onde está o código:** qual repositório, de quem é a conta (do Deidson, do dev, de uma organização), quem mais tem acesso. Se o Vítor ainda não tem acesso, diga exatamente o que pedir ao Deidson.
2. **Partes do sistema:** site de marketing, painel do cliente, o player (o script que roda na página do cliente), API, banco de dados, cobrança, e-mails. Qual tecnologia em cada parte (linguagem, framework, versão).
3. **Onde roda:** hospedagem, domínio, CDN (a rede que entrega os arquivos rápido), onde os vídeos ficam guardados.
4. **Como sobe para o ar (deploy):** automático ao juntar na main? manual? quem faz? Existe ambiente de teste (staging) separado da produção?
5. **Quem é o dev atual** e como ele trabalha (branches, revisão, testes). Combine com ele antes de mudar o jeito de trabalhar.
6. **Testes e verificação automática (CI):** existem? passam?
7. **Números de hoje (linha de base):** tempo de carregamento do player e do painel, nota Lighthouse/PageSpeed no celular e no computador, peso do script do player, visitas do site, quantos começam o teste grátis, quantos viram assinantes, cancelamentos. Se não houver medição de conversão, isso vira a primeira proposta.
8. **Riscos:** dados de clientes, pagamentos, chaves expostas no código (se achar uma, avise o Vítor na hora para trocar, sem repetir a chave no chat).

Entregue ao Vítor um resumo de poucas linhas + o arquivo, e a lista do que precisa de acesso. **O player é a parte mais sensível:** ele roda nas páginas de venda de 2.000 clientes. Um erro ali derruba a venda de todo mundo ao mesmo tempo.

## 4. Organização no GitHub (regra de ouro: nunca direto na main)

A `main` é o que está (ou vai para) o ar. Ninguém sobe nada direto nela, nem a IA, nem com pressa.

### Fluxo de toda mudança
1. Crie uma **branch** (uma cópia de trabalho) a partir da main atualizada, com nome claro:
   - `melhoria/velocidade-player`, `visual/pagina-planos`, `responsivo/painel-celular`, `conversao/checkout`, `correcao/botao-delay-ios`, `docs/visao-do-app`.
2. **Commits pequenos** com mensagem em português que diga o porquê ("Carrega a thumbnail antes do vídeo para o player abrir mais rápido").
3. Abra um **PR** (pull request) cedo, como rascunho. O texto do PR segue sempre o mesmo formato:
   - **Antes:** o que o usuário via. **Depois:** o que passa a ver.
   - **Como medir:** o número antes e depois (ex.: "player abre em 2,1 s → 0,9 s no 4G").
   - **Prints:** celular e computador.
   - **Risco e como desfazer.**
4. A verificação automática (CI) precisa ficar verde. Se o repositório não tiver, propor uma simples é uma das primeiras melhorias.
5. **Revisão:** o Vítor aprova; mudança que o cliente final vê ou que toca player, cobrança ou banco também passa pelo dev e, quando mudar algo visível ou de negócio, pelo Deidson.
6. Junta na main **só depois de aprovado**. Um PR = uma ideia. Nada de PR gigante misturando várias coisas.

### Proteções a pedir no repositório
- Proteção da branch `main`: exige PR, exige CI verde, bloqueia push direto e force-push.
- Se a hospedagem permitir, **prévia automática por PR** (um link de teste para cada mudança, que o Vítor abre no celular).
- Marcar versões (tags, ex.: `v2026.10.20`) a cada subida para o ar, para voltar rápido se der problema.

### O que nunca entra no Git
- `.env`, chaves, senhas, tokens, cópias do banco, dados de clientes. O `.gitignore` deve cobrir isso desde o primeiro dia.

## 5. Backup no PC do Vítor

O Vítor quer tudo salvo também no computador dele, sem perda nenhuma, porque já teme perder contas de IA.

- **Cópia do código:** um clone do repositório no PC dele (Windows, sem GPU NVIDIA), numa pasta própria, por exemplo `C:\Users\vitor\OneDrive\Desktop\VSL Play\app`.
- **Atualização automática:** uma tarefa agendada do Windows que roda `git pull --ff-only` (só baixa, nunca envia, nunca apaga) todo dia e ao ligar o PC, com log. Já fazemos exatamente isso para o projeto de vídeo: modelo em `atualizar-backup-github.ps1` (tarefa "Backup Maquina de Editar", diária às 23:55). Copie o modelo e troque o caminho.
- **Arquivos do trabalho da IA** (levantamento, planos, prints, medições, `ESTADO.md`) também vão para o repositório, numa pasta de documentação, para não ficarem só no chat ou na nuvem.
- **Banco de dados e dados de clientes NÃO vão para o PC dele.** Backup de banco é responsabilidade da hospedagem/do dev; a IA só verifica se existe e se já foi testado restaurar.
- Containers da nuvem apagam tudo fora da pasta do projeto. Salve e envie para o GitHub depois de cada marco (branch empurrada = backup).

## 6. Ciclo contínuo de melhoria

Toda semana, o mesmo ciclo. Ele combina com o relatório de sexta que o Vítor manda ao Deidson.

1. **Medir:** atualize os números da seção 3, item 7.
2. **Escolher 1 a 3 melhorias** que mais mexem em receita, com o motivo e o número esperado. O Vítor aprova a lista (e o Deidson, quando for algo que o cliente vê).
3. **Construir** em branch + PR, com prints e medição antes/depois.
4. **Criticar antes de mostrar:** tente reprovar o próprio trabalho. Para mudança grande, uma sessão nova que não construiu nada revisa e dá nota; só sai com ≥ 8/10.
5. **Subir** depois do OK, com tag de versão e plano de volta.
6. **Relatório de sexta:** 5 linhas, o que mudou e o que o número fez. Sem enfeite e sem promessa.
7. **Lições** vão na hora para `LICOES-APP.md` no repositório. Nada fica só no chat.

### As 4 frentes (em ordem de impacto provável)

| Frente | O que olhar primeiro | Como provar |
|---|---|---|
| **Velocidade** | Peso e tempo de abertura do script do player (ele roda na página de venda do cliente: player lento derruba a venda dele e é argumento de venda nosso); imagens e fontes; cache; painel | Lighthouse/PageSpeed no celular, tempo até o player tocar, tamanho em KB |
| **Conversão** | Página de planos, botão de teste grátis, cadastro, checkout, primeiros minutos dentro do painel (o cliente chega a colocar o primeiro vídeo?) | Funil medido: visita → teste → assinatura; teste A/B quando houver tráfego |
| **Responsividade** | Painel e páginas no celular: nada cortado, nada de rolagem lateral, botões grandes o bastante para o dedo | Prints em 390 px, 768 px e 1440 px (Playwright faz isso na nuvem) |
| **Visual** | Hierarquia, alinhamento, consistência, textos claros | Print antes/depois lado a lado com uma referência boa |

Melhoria de algo que já existe é o trabalho. **Funcionalidade nova** vira uma proposta de meia página (problema, ganho esperado em receita, custo) para o Deidson decidir. Não construa antes do sim dele.

## 7. Régua de gosto no app

- O Vítor odeia "cara de IA": degradê decorativo, brilho de fundo, vidro, azul+roxo genérico, ícone genérico. Gosta da disciplina Apple: claro, contido, um foco por tela, tipografia precisa, animação com mola.
- **Mas o app tem dono e identidade.** A marca VSL Play usa azul/roxo (azul-marinho #000C39, índigo #5D6CF9, magenta #E04DF2, fonte Roboto, medidos no site em out/2026). Não troque a identidade por gosto nosso. Nos materiais do Vítor usamos as cores chapadas do logo, sem o degradê, e isso deu certo; propor o mesmo no app é válido, **como proposta com print**, nunca aplicado direto.
- Precedência: palavra do Deidson/Vítor > identidade da marca VSL Play > design system do Vítor (`motion-base/DESIGN-SYSTEM.md`) > lições > skills.
- Logos de integrações sempre os reais (SVG oficial), nunca redesenhados. Nada de número inventado ("+2.000 usuários" só se for verdade e com fonte).
- Skills úteis no repositório do núcleo: `design-taste-frontend`, `apple-design`, `extract-ds` (já testado no vslplay.com; notas em `motion-base/fontes/ferramentas/extract-ds/NOTAS.md`), `animation-vocabulary`.

## 8. O que exige o OK explícito do Vítor (e às vezes do Deidson)

Faça sem pedir: ler código, criar branch, rascunho de PR, medir, prints, rodar testes, escrever documentação e propostas.

**Espere o OK antes de:**
- Juntar qualquer coisa na main ou subir para produção.
- Mexer em banco de dados de produção, cobrança, planos, preços, e-mails para clientes.
- Apagar arquivos, branches ou dados.
- Mudar configuração de hospedagem, domínio, DNS ou permissões do repositório.
- Mudar o jeito de trabalhar do dev atual (combine com ele pelo Vítor).
- Qualquer funcionalidade nova (aval do Deidson).
- Falar com clientes ou publicar qualquer coisa em nome do VSL Play.

## 9. Acessos

A lista completa do que já temos (GitHub da conta `vodetmor`, PC do Vítor por Remote Control, Playwright para prints, pesquisa no X, APIs grátis) está no guia geral, seção 6. Para o app, além disso, vamos precisar:

| Acesso | Situação | Como |
|---|---|---|
| Repositório do app | **A confirmar** (seção 3) | Deidson ou o dev adiciona `vodetmor` como colaborador; depois conectar ao Claude (claude.ai/connect-github + app do Claude instalado no repositório) |
| Hospedagem / prévias | A confirmar | Só leitura no começo; quem sobe para o ar continua sendo quem sobe hoje até o Deidson decidir o contrário |
| Métricas (analytics, funil) | A confirmar | Só leitura |
| Banco, cobrança | **Não pedir** no começo | Só se uma melhoria aprovada precisar, e só leitura |

Chaves: o Vítor manda uma vez numa mensagem; a IA guarda num `.env` que o Git ignora; nunca repete no chat nem grava na memória. Se uma chave aparecer exposta, avise para trocar.

## 10. Primeira mensagem sugerida para o projeto do app

> Leia os arquivos COLABORACAO-AGENTICA-VSLPLAY.md e COLABORACAO-AGENTICA-VITOR.md inteiros antes de responder. O primeiro explica o app VSL Play, o que o Deidson quer, como organizamos o GitHub (nunca direto na main), o backup no meu PC e o ciclo de melhorias. O segundo explica como falar comigo e todos os acessos. Comece pelo levantamento do app (seção 3) e me diga, em poucas linhas, o que você precisa de acesso e como vai trabalhar comigo.

Teste que deu certo no guia geral, adaptado: pergunte "posso pedir para você colocar isso no ar agora?". A resposta certa explica, curto, que vai em branch + PR com prévia e medição, e só sobe depois do OK, com plano de volta.
