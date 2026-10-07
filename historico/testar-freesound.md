# testar-freesound

## 2026-09-29T01:01:46Z · Claude

Abri uma conversa nova já com a rede atualizada para testar o Freesound.

## 2026-09-29T01:01:53Z · Claude

Estou testando se a rede nova já deixa acessar o Freesound com a sua chave.

## 2026-09-29T01:04:44Z · Claude

Agora funciona, Vítor. O Freesound está liberado, e só o Jamendo continua travado, por causa da chave.

- **Freesound:** ok. A busca por "rain" com a sua chave voltou resultados, e baixei uma prévia de 8 MB (mp3 válido, licença CC0). O download é lento, levou cerca de 2 minutos.
- **Jamendo:** o site responde, mas recusa o Client ID salvo ("credential is not authorized"). Precisa conferir essa chave no painel do Jamendo (devportal.jamendo.com).
- **Wikimedia:** ok. A busca e o download de arquivos funcionam. A busca só responde se o pedido se identificar direito, senão dá erro 429.
- **Pexels:** as imagens baixam normalmente. A busca responde, mas exige uma chave de API que ainda não temos. É grátis em pexels.com/api.

Não mudei nenhuma configuração.

## 2026-09-29T01:05:43Z · Claude

O Jamendo também funciona agora com a chave nova. Salvei o Client ID e o Secret no mesmo arquivo de chaves do Freesound.

- A busca por estilo funciona (por exemplo, `tags=ambient` ou `fuzzytags`), e também por artista e por popularidade.
- A busca por texto livre ("rain", "calm") volta vazia. Então vamos buscar música por tags.
- Baixei uma faixa inteira em mp3 (4 MB, liberada para download) em 3 segundos, muito mais rápido que o Freesound.

Como o Secret apareceu no chat, vale gerar um novo no painel do Jamendo quando der. Para buscar e baixar, só o Client ID é usado.
