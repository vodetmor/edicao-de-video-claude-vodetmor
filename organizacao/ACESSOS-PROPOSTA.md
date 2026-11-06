# Que acessos dar ao Claude agora (proposta, 02/10/2026)

## A ideia central
Acesso novo só vale se resolver um dos **4 gargalos reais** de qualidade que temos hoje. Não falta "mais ferramenta"; faltam estas 4 coisas:

1. **Olhos e ouvidos.** Eu vejo quadros e meço o som com números, mas não *assisto* um vídeo com áudio como uma pessoa. Isso limita duas coisas: entender uma referência inteira (ritmo, emoção, música) e criticar nosso próprio render.
2. **Placar.** Nos criativos, qualidade = retenção, CTR e venda. Hoje a gente edita no escuro: não sei qual gancho segurou mais gente.
3. **Matéria-prima.** Voz em português sem passo manual, música boa e liberada para anúncio, clipes de IA em resolução de entrega (o Flow grátis sai em 720p).
4. **Força bruta.** A nuvem aqui não tem placa de vídeo (GPU). Modelos pesados e úteis (clonar voz, recortar a pessoa do fundo, aumentar resolução, câmera lenta suave) precisam dela.

Abaixo, cada acesso ligado ao gargalo que resolve. Em ordem de prioridade.

---

## Prioridade 1: fazer agora (tudo grátis)

### 1. Chave do Gemini (Google AI Studio) — olhos e ouvidos
- **O que destrava:** o Gemini assiste vídeo **com som**. Vira (a) o analista das referências e dos anúncios escalados ("aos 0:03 a música cai e entra o texto grande"), e (b) o **crítico de olhos novos** que assiste nosso render antes de você. Isso é exatamente o "crítico que não viu a construção" que os melhores prompts do X usam. Bônus a confirmar com a chave: voz em português (TTS do Gemini) e geração de imagem no plano grátis.
- **Custo:** zero (plano grátis com limite diário, que dá para o nosso volume).
- **Risco:** no plano grátis o Google pode usar o que enviamos para treinar. Então: referências e nossos renders sim; material sigiloso de cliente, não.
- **Testado daqui:** a API responde da nuvem (só pede a chave).
- **O que você faz (2 min):** entrar em aistudio.google.com com uma conta Google sua (pode ser uma secundária) > "Get API key" > criar > colar a chave aqui no tópico. Eu guardo no `.env` e não repito em lugar nenhum.

### 2. Biblioteca de anúncios (Meta e TikTok) pelo Apify — matéria-prima para modelar escalados
- **O que destrava:** o módulo "anúncio escalado" do plano do estúdio. Busco por palavra, nicho ou página e trago os anúncios **ativos há mais tempo** (anúncio que roda há 60+ dias está dando lucro), com vídeo, texto e datas. Depois: transcrevo, meço os cortes, o Gemini assiste, e eu escrevo a spec modelada com as nossas variações.
- **Custo:** o Apify grátis dá US$ 5 por mês de crédito. O robô da Meta cobra por anúncio coletado (centavos por lote); dá para centenas de anúncios por mês. Você já mandou o token do Apify.
- **Risco:** baixo. Só leitura de biblioteca pública.
- **Testado daqui:** a biblioteca da Meta tem uma barreira anti-robô que o navegador da nuvem não passa, e a API oficial da Meta só mostra anúncio político no Brasil. Por isso o caminho é o Apify (robôs prontos: `apify/facebook-ads-scraper`, 40 mil usuários; `doliz/tiktok-creative-center-scraper`). Plano B grátis: o Chrome do seu PC pelo Remote Control.
- **Status (02/10, 21:40 UTC): FUNCIONANDO.** O token do Apify que você mandou no dia 29 vale; teste com 10 anúncios da busca "vsl" no Brasil trouxe página, texto, há quantos dias roda (69 a 162 dias) e o link do vídeo em HD. Resultado em `estudio/escalados/teste-apify/anuncios.json`.
- **O que você faz:** escolher o nicho do primeiro lote de verdade.

### 3. Voz provisória grátis, já funcionando — matéria-prima
- **O que destrava:** montar o vídeo inteiro **com a voz no tempo certo antes da locução final existir** (animática). Hoje a gente espera você gerar no ElevenLabs para começar a sincronizar. Com isso eu edito tudo preso às palavras e, quando a voz final chega, só troco o áudio e reancoro.
- **Custo:** zero, sem chave, sem conta.
- **Testado daqui:** funciona agora. Ouça: [Thalita](amostras-voz/thalita.mp3) e [Antonio](amostras-voz/antonio.mp3) (vozes neurais da Microsoft). Script: `amostras-voz/voz_edge.py`.
- **Limite honesto:** é boa para rascunho, não para anúncio final. A voz final continua ElevenLabs ou humana.

---

## Prioridade 2: vale muito, pede um pouco de você

### 4. Placar dos anúncios (Meta Ads, só leitura) — o gargalo nº 2
- **O que destrava:** eu leio retenção por segundo (quantos assistem 3 s, 25%, 50%...), CTR e custo de cada criativo e devolvo "o gancho B segurou 2x mais, a queda é no segundo 4, vou atacar isso na próxima leva". É isso que transforma "criativo em massa" em **criativo que melhora sozinho a cada rodada**. Sem placar, variação em massa é chute em massa.
- **Custo:** zero.
- **Risco:** é conta de anúncio de cliente (seu chefe, Deidson/Dhay). Precisa ser **só leitura** (permissão `ads_read`), nunca edição nem gasto.
- **O que você faz:** perguntar ao dono da conta se aceita dar acesso de leitura. Se sim, eu mando o passo a passo exato (criar um "usuário do sistema" no Gerenciador de Negócios com permissão só de ver).

### 5. Kaggle (GPU grátis, 30 h por semana) — força bruta
- **O que destrava**, tudo com modelos abertos que não rodam aqui sem GPU:
  - **Aumentar resolução** dos clipes do Flow de 720p para 1080p/4K (o Flow grátis entrega 720p).
  - **Recortar a pessoa do fundo** em vídeo: o truque de After Effects de texto e gráfico passando **atrás** do apresentador.
  - **Câmera lenta suave** (interpolação de quadros) e estabilização.
  - **Clonar voz** do cliente ou a sua, em português, para variações de gancho sem regravar (só com autorização de quem é a voz).
  - Separar voz e música de uma referência para estudar a mixagem dela.
- **Custo:** zero.
- **Risco:** baixo. Limite de 30 h por semana, sobra para nós.
- **O que você faz (5 min):** criar conta em kaggle.com, confirmar o telefone (libera a GPU), Settings > API > "Create New Token" e me mandar o arquivo `kaggle.json`.
- **Pergunta antes:** **seu PC tem placa de vídeo NVIDIA?** Se tiver, ela é a nossa GPU grátis via Remote Control e o Kaggle vira reserva.

### 6. Repositório privado no GitHub — proteção do estúdio
- **O que destrava:** o motor, os blocos e as specs ficam versionados e a salvo dos reinícios (já perdemos trabalho uma vez). Também deixa levar o estúdio para outro projeto ou PC com um comando.
- **Custo:** zero. **Risco:** nenhum (privado).
- **O que você faz:** conectar o GitHub em https://claude.ai/connect-github. Eu crio o repositório e organizo.

---

## Prioridade 3: quando houver verba (barato, sem assinatura grande)

| O quê | Destrava | Custo aprox. |
|---|---|---|
| **ElevenLabs Starter** | API com as vozes brasileiras (Ana Dias): fim do passo manual de gerar no site | US$ 5/mês |
| **fal.ai (paga por clipe)** | Kling, Veo, Seedance e outros por uso, sem assinatura. Bom para testar antes do Higgsfield | por clipe (centavos a poucos dólares) |
| **Higgsfield** | Já planejado: apresentador, produto e ganchos com IA | assinatura |
| **Biblioteca de música paga** (Epidemic/Artlist) | Música de anúncio com licença limpa e qualidade alta. Hoje é o ponto mais fraco do nosso material | ~US$ 10–15/mês |

Música merece nota: as opções grátis com licença para anúncio são poucas (Freesound/Jamendo, que já usamos). A chave do Pixabay que está pendente **não cobre música** (a API deles só tem imagem e vídeo), então ela ajuda no B-roll, não na trilha.

---

## O que eu NÃO pediria
- Sua conta Google principal, cartão ou senhas.
- Conta de anúncio com permissão de editar ou gastar.
- Postar em nome de alguém (X, Instagram): seguimos só leitura.
- Automatizar o site do ElevenLabs no seu PC (como fizemos no Flow): funciona, mas fere os termos e arrisca a conta. Melhor os US$ 5 do Starter quando der.

## Resumo do que eu preciso de você
1. Chave do Gemini (2 min).
2. "Pode usar o crédito grátis do Apify" + um nicho para o primeiro lote.
3. Se seu PC tem placa NVIDIA.
4. Quando puder: conectar o GitHub, conta no Kaggle, e perguntar ao dono da conta de anúncios sobre o acesso de leitura.

## Uma observação de qualidade (fora dos acessos)
Acesso aumenta o que eu consigo **pegar**; o que mais sobe o nível do motion agora é o **treino de recriação**: você escolher 2 dos 7 vídeos de motion salvos do X (`motion-base/fontes/x/videos/`), eu recriar no motor e cada técnica virar bloco do catálogo. Isso continua esperando sua escolha.
