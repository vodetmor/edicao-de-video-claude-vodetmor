# ECC (github.com/affaan-m/ECC) · avaliado em 02/10/2026

Versão lida: 2.2.3 (commit em `motion-base/fontes/ferramentas/ecc/COMMIT.txt`). Licença MIT: grátis, pode copiar e adaptar. Tem README em português em `docs/pt-BR/README.md` do repositório.

## O que é, em palavras simples
O ECC é um "kit de organização" para o Claude Code. Ele instala de uma vez:
- **68 agentes**: "funcionários especialistas" (planejador, arquiteto, revisor, revisor de segurança etc.). O Claude principal funciona como gerente e passa cada tarefa para o especialista certo.
- **293 skills**: "manuais de procedimento" que o Claude lê quando o assunto aparece.
- **94 comandos** (`/plan`, `/save-session`, `/learn`...): atalhos que disparam um procedimento.
- **Hooks**: gatilhos automáticos (ex.: ao terminar uma sessão, salvar o que foi aprendido).

A filosofia dele é: `planejar → testar → fazer → revisar → verificar → lembrar → melhorar`, e "economize a janela de contexto, persista todo o resto".

## Por que o Vítor sentiu que "é como a gente trabalha"
Porque é a mesma ideia do nosso Projeto. Comparação direta:

| ECC | Nosso projeto (já existe) |
|---|---|
| Agente principal que delega para especialistas | Coordenador no chat principal + um Claude por tópico (thread) |
| `/save-session` e `/resume-session` | `ESTADO.md` em cada `trabalho/` (regra de persistência) |
| Aprendizado contínuo ("instincts") | `LICOES-MOTION.md` + memória do projeto |
| Skills | `/mnt/project-files/skills/` (5 escolhidas) |
| plan → implement → review | referências → SPEC → arquitetura → plano → parâmetros → edição (padrão ouro) |

Ou seja: a gente já tem o "esqueleto" do ECC, feito sob medida para edição de vídeo.

## Veredito
**Não instalar o ECC inteiro.** Motivos:
1. Cerca de 90% dele é para programação (revisores de Rust, Django, Kotlin, testes de software, segurança de código). Não serve para edição.
2. Carregar centenas de skills e agentes enche a "memória de trabalho" (contexto) do Claude e piora o resultado. O próprio autor avisa isso no guia dele.
3. Aqui na nuvem, tudo que se instala fora de `/mnt/project-files` some quando o container reinicia.
4. O "ECC Pro" (pago) é um app do GitHub para repositórios privados. Não precisamos.

**Pegar só as peças boas (garimpo):**
1. **taste-distillation (medir referência).** Mede vídeos de referência e gera um "pacote de estilo": ritmo de cortes (duração de cada plano), cor como LUT (arquivo `.cube` que dá para usar no Resolve/ffmpeg), quadros-chave. Roda offline e grátis. É exatamente o que precisaremos para o plano futuro do Vítor: **pegar anúncio escalado (Meta Ad Library, TikTok Ads) e modelar**. Cópia salva em `motion-base/fontes/ferramentas/ecc/taste-distillation/` (MIT). Para rodar, precisa instalar numpy, opencv e scenedetect (pedir ok antes).
   - Lição central dela: **"prompt não entrega cor; medição entrega"**. Descrever o visual em palavras para uma IA geradora falha; medir a referência e aplicar depois acerta.
2. **Revisão com "olhos novos".** O ECC sempre revisa o trabalho com um agente separado, que não participou da criação. Para nós: depois de cada render, um revisor separado confere o vídeo contra o SPEC e o DESIGN-SYSTEM (legenda batendo em objeto, trecho parado, volume da voz, logo errado) antes de entregar. Já temos as peças (`qa.py`, skill review-animations); falta virar etapa fixa.
3. **Lições com grau de confiança.** O ECC marca cada aprendizado com confiança (0,3 palpite a 0,9 certeza) e evidência. Podemos marcar nas lições "confirmado pelo Vítor" versus "palpite nosso", para não tratar palpite como regra.
4. **Dica de economia de contexto:** manter poucas ferramentas/conectores ligados por vez.

**Não vale pegar:** `remotion-video-creation` (a nossa `remotion-best-practices` é mais completa), `video-editing` (genérica; o nosso processo é mais rico), `motion-*` (são para sites em React, não vídeo), `taste` (estética "angelcore/hyperpop", oposta ao estilo Apple do Vítor).

## Pergunta do Vítor sobre tokens e "novo chat"
- Neste Projeto, **cada mensagem nova no chat principal vira um tópico (thread) novo, com um Claude novo e contexto limpo**. Esse é o "novo chat".
- Para continuar um assunto, escreva **dentro do tópico** dele; para assunto novo, escreva no chat principal.
- O Claude do chat principal é trocado automaticamente quando a conversa fica longa, e o que importa passa pela memória do projeto. O Vítor não precisa fazer nada.
- Se um tópico ficar enorme, pedir "abre um tópico novo para continuar X": o estado está no `ESTADO.md`, então nada se perde. É o mesmo que o `/save-session` do ECC faz.
