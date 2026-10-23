# Tutorial: conectar Pinterest e X/Twitter num projeto novo

Atualizado em 23/10/2026. Anexe este arquivo no primeiro chat do projeto novo e diga: "monte o acesso ao Pinterest e ao X seguindo este tutorial".

**Resumo em uma linha:** o Pinterest não precisa de token nenhum, e o X já está logado no PC do Vítor, então basta o Claude conectar no PC.

---

## 1. Pinterest (sem token, sem login)

O `pinterest-mcp-server` (github.com/terryso/mcp-pinterest) abre a busca pública do Pinterest num Chrome invisível e devolve os links das imagens. Testado em 13/10/2026: **não pede token, chave de API nem login.** Não há nada para o Vítor mandar.

### 1a. Na nuvem (Claude Code web/projeto), modo direto pelo script
É o jeito que já usamos. O Claude faz sozinho:

```bash
mkdir -p ~/pin && cd ~/pin
npm init -y >/dev/null && npm i pinterest-mcp-server
# copiar o busca.mjs (está em motion-base/fontes/pinterest/busca.mjs) para ~/pin
export MCP_PINTEREST_PROXY_SERVER="$HTTPS_PROXY"   # a nuvem só sai pela proxy
CHROME=/opt/pw-browsers/chromium node busca.mjs "anúncio de preço" "tipografia 3d números"
# resultado: res.json com as URLs (i.pinimg.com/originals/...)
```

O `busca.mjs` (6 linhas):
```js
import P from 'pinterest-mcp-server/pinterest-scraper.js';
import fs from 'fs';
const s = new P(); s.getChromePath = () => process.env.CHROME || '/opt/pw-browsers/chromium';
const out = {};
for (const q of process.argv.slice(2)) { try { out[q] = (await s.search(q, 14, true)).map(r => r.image_url); } catch (e) { out[q] = []; } }
fs.writeFileSync('res.json', JSON.stringify(out, null, 1));
```

Dicas:
- Para miniatura leve, troque `/originals/` por `/564x/` na URL.
- Monte uma folha de contato (grade de miniaturas) para o Vítor escolher.
- Limite: uns 8 a 12 pins por busca, sem título nem autor. Faça várias buscas com palavras diferentes (em inglês costuma render mais).

### 1b. Como servidor MCP (Claude Desktop, Claude Code no PC, Cursor)
Precisa de Node 18+ e do Google Chrome instalado. No arquivo de configuração MCP (no Claude Code: `claude mcp add`; no Desktop: `claude_desktop_config.json`):

```json
"pinterest": {
  "command": "npx",
  "args": ["pinterest-mcp-server"],
  "env": {
    "MCP_PINTEREST_DOWNLOAD_DIR": "C:\\Users\\vitor\\OneDrive\\Desktop\\Maquina de Editar\\referencias-pinterest",
    "MCP_PINTEREST_FILENAME_TEMPLATE": "pin_{imageId}_{timestamp}.{fileExtension}"
  }
}
```
Atalho no Claude Code: `claude mcp add pinterest -- npx pinterest-mcp-server`

Ferramentas que aparecem: `pinterest_search` (palavra, quantidade), `pinterest_get_image_info` (detalhes de uma imagem) e `pinterest_search_and_download` (busca e baixa para a pasta acima).

Na nuvem, se usar como MCP, acrescente `"MCP_PINTEREST_PROXY_SERVER": "<valor de $HTTPS_PROXY>"` no `env`.

### 1c. Quando precisaria de login
Só para ler pastas privadas do próprio Vítor. Hoje não é necessário. Se um dia for, o caminho é o Chrome logado do PC dele (Remote Control), não token.

---

## 2. X/Twitter

### 2a. Caminho principal: o PC do Vítor (já está tudo pronto lá)
O login do X fica no PC do Vítor (VITOR-SAMSUNG), em duas variáveis do Windows salvas com `setx`: `TWITTER_AUTH_TOKEN` e `TWITTER_CT0`. O `twitter-cli` corrigido também já está instalado lá. Então, no projeto novo, **só precisa conectar no PC**:

1. No chat do projeto, o Claude pede para conectar no computador (cartão "conectar dispositivo" ou Remote Control). O Vítor aprova.
2. Pasta para escolher: `C:\Users\vitor\OneDrive\Desktop\Maquina de Editar`.
3. O Claude roda os comandos no terminal do PC. O terminal já enxerga os cookies pelas variáveis; o Claude não precisa ver nem copiar os valores.

Comandos (sempre com `-c`, que devolve JSON compacto):
```powershell
twitter -c search "claude code motion" -t top --min-likes 500 --since 2026-10-01
twitter -c search "remotion" -t latest --lang pt --has videos --exclude replies
twitter -c search "after effects" --from usuario
twitter tweet <id>            # post + respostas (onde costuma estar "o prompt nos comentários")
twitter user-posts <usuario>  # posts de um perfil
twitter list <id>             # ler uma lista de contas de uma vez
```

**Regra fixa: só leitura.** Nunca postar, curtir, seguir, repostar, salvar ou mandar DM. Volume baixo (uma rodada por dia no máximo para radar de novidades), porque leitura automatizada demais pode travar a conta. O PC precisa estar ligado.

### 2b. Ler o post inteiro e baixar vídeos (na nuvem, sem login)
Com os IDs que a busca do PC devolveu:
```bash
python3 motion-base/fontes/x/xler.py <url ou id> [<outro id> ...] --baixar --saida pasta/
```
Usa `https://api.fxtwitter.com/status/<id>`: texto completo, likes, views, reposts, fotos e o mp4 na maior qualidade. Artigos do X (x.com/i/article/...) vêm inteiros em `tweet.article`. Copie o `xler.py` para o projeto novo (ele não tem dependência, só Python).

Sem PC ligado, dá para achar posts com busca web `site:x.com <tema>` e passar as URLs no `xler.py` (mais lento para posts novos, e sem respostas).

### 2c. Se precisar instalar num PC novo (ou se quebrar)
Instalar a versão corrigida (o `twitter-cli` 0.8.5 oficial dá erro 404):
```powershell
pip install --force-reinstall --no-deps "git+https://github.com/c4nc/twitter-cli@4cd4407fdac898c4bcc8765fbc9f21cc1333681e"
```
Quando sair versão oficial consertada: `pip install -U twitter-cli`. Alternativa: `pip install twitter-cli` e depois `python consertar_twitter_cli.py` (em `motion-base/fontes/x/conserto/`).

Salvar os cookies (o Vítor faz isso, uma vez):
1. Entrar no x.com no Chrome.
2. F12 > Application > Cookies > `https://x.com`.
3. Copiar o valor de `auth_token` e de `ct0`.
4. No PowerShell:
   ```powershell
   setx TWITTER_AUTH_TOKEN "valor_do_auth_token"
   setx TWITTER_CT0 "valor_do_ct0"
   ```
5. Fechar e abrir um terminal novo (o `setx` só vale em terminal aberto depois).

Erros comuns:
- **Erro de login / 401:** os cookies venceram. Sair do X no Chrome, entrar de novo e repetir os passos 2 a 5.
- **"Failed to init ClientTransaction" + 404:** a correção foi desfeita (atualizou para a versão quebrada). Rodar o `pip install` corrigido de novo e apagar `%USERPROFILE%\.twitter-cli\transaction_cache.json` se existir.
- **Da nuvem direto não funciona:** o X recusa login vindo de IP de servidor (401 código 32). Sempre pelo PC.

---

## 3. Tokens e cookies: o que entrou neste arquivo e o que não entrou

O Vítor autorizou colocar os valores aqui. Mesmo assim, eles **não estão escritos**, por dois motivos:

1. **Nenhum é necessário para estes dois acessos.** O Pinterest não usa token. O X usa os cookies que já estão nas variáveis do Windows do PC; conectando no PC, funciona sem copiar nada.
2. **O sistema bloqueou a leitura.** Ao tentar abrir os `.env` para copiar os valores, o controle de segurança do ambiente recusou ("exploração de credenciais"). Os cookies do X também não foram copiados: `auth_token` e `ct0` dão acesso total à conta (quem tiver eles entra como o Vítor, posta e lê DM), diferente de uma chave de API de banco de mídia.

Se o projeto novo precisar das outras chaves (Pexels, Freesound, Jamendo, ElevenLabs, Apify), elas estão nestes arquivos, que você pode abrir no PC ou anexar no projeto novo:

| Serviço | Variáveis | Arquivo |
|---|---|---|
| Pexels | `PEXELS_API_KEY` | `escola-consciencia-negra/edicao/.env` |
| Freesound | `FREESOUND_CLIENT_ID`, `FREESOUND_API_KEY` | `escola-consciencia-negra/edicao/.env` |
| Jamendo | `JAMENDO_CLIENT_ID`, `JAMENDO_CLIENT_SECRET` | `escola-consciencia-negra/edicao/.env` |
| ElevenLabs | `ELEVENLABS_API_KEY` | `anuncio-vslplay/trabalho/.env` |
| Apify (serve também para Pinterest em volume, ator "pinterest scraper") | token `apify_api_...` | só na mensagem do chat do projeto de 29/09/2026 |
| X/Twitter | `TWITTER_AUTH_TOKEN`, `TWITTER_CT0` | variáveis do Windows no PC (`setx`) |

**Se quiser colar os valores neste tutorial você mesmo:** salve a cópia com valores com um nome que comece por `credentials` (ex.: `organizacao/credentials-acessos.md`). O backup (`backup/sincronizar.py`) pula esses arquivos; um .md comum com chave dentro faz o backup parar inteiro sem enviar nada.

Mapa completo de todas as chaves do projeto: `organizacao/TOKENS-E-ACESSOS.md`.
