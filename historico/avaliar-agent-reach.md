# avaliar-agent-reach

## 2026-09-28T23:03:10Z · Rei da VSL - Vítor

https://github.com/Panniantong/agent-reach analise a utilidade disso para tudo e edição tb

## 2026-09-28T23:03:17Z · Claude

Estou lendo o README e o código do Agent Reach para entender o que ele faz.

## 2026-09-28T23:04:02Z · Claude

**Resumo: é útil, mas no seu PC, não aqui na nuvem. E serve pra pesquisa, não pra edição em si.**

**O que é:** um instalador com "manual" pro agente (MIT, gratuito, v1.5.0). Ele não lê nada sozinho. O que faz é escolher, instalar e testar ferramentas de terceiros: Jina Reader pra páginas, yt-dlp pra YouTube, twitter-cli pra X, Exa pra busca e OpenCLI pra Instagram, Facebook e Reddit. Depois deixa um SKILL.md dizendo ao Claude qual comando usar em cada caso. Metade dos canais é voltada pra China (Xiaohongshu, Bilibili, Boss, Xueqiu), e isso não te serve.

**Aqui na nuvem ele não resolve nada.** Testei agora: r.jina.ai, youtube.com, a API de tweets e o Exa foram todos bloqueados pela política de rede deste ambiente. O X não abre por causa da rede, não por falta de ferramenta. Pra liberar, é preciso adicionar esses domínios em Network access nas [Configurações do projeto](#project-settings/environment). Mesmo assim, o YouTube costuma bloquear servidores.

**No seu PC (via Remote Control), vale a pena por três coisas:**
1. **X completo:** busca, threads e artigos longos. Isso destrava as referências de motion que você tira do X. O porém: ele usa os cookies da sua conta do X, e o X pode suspender a conta por automação. Use uma conta secundária.
2. **YouTube:** transcrição de VSLs e anúncios que estão vencendo, pra dissecar o roteiro, e download do vídeo de referência pro estudo quadro a quadro (o SPEC.md do motion-base).
3. **Instagram, Facebook e Reddit:** usa o Chrome já logado, bom pra ver criativos e comentários. A Biblioteca de Anúncios da Meta não está incluída.

**Na edição (ffmpeg, Remotion, Flow) ele não entra.** Ele só alimenta a etapa de referência e roteiro.

**Minha recomendação:** não instalar o pacote inteiro. Só o yt-dlp já cobre YouTube e download de referência, e o twitter-cli (com conta secundária) cobre o X, ambos no seu PC. Posso montar esse passo a passo quando você quiser rodar localmente.
