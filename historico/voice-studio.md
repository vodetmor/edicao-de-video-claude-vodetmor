# voice-studio

## 2026-10-02T22:09:54Z · Rei da VSL - Vítor

https://voicestudio.sh/ baixa isso pfvr, aí posso te enviar vozes para vc clonar e usar que são tops evitando usar o elevenlabs e gastar créditos kkkk não sei a qualdiade disso, mas é massa

_Anexos: omnivoice-design-masc-anuncio.mp3, omnivoice-design-fem-anuncio.mp3, omnivoice-clone-sintetico-anuncio.mp3, dots-soar-clone-sintetico-anuncio.mp3, edge-AntonioNeural-anuncio.mp3_

## 2026-10-02T22:10:03Z · Claude

Vou ver o que é o Voice Studio, onde ele roda melhor e testar a qualidade em português.

## 2026-10-02T22:14:28Z · Claude

Vítor, preciso de uma autorização sua: o ambiente bloqueou o teste de clonagem até o dono da voz dizer que pode. Se você responder **"autorizo clonar minha voz"**, eu testo com um trecho de 12 s da sua gravação do vídeo da escola e comparo com a voz grátis do Edge e com a Ana Dias.

O que já sei: o VoiceStudio é grátis e roda até sem placa de vídeo, só que mais devagar no seu PC. O motor dele já está instalado aqui na nuvem.

Tem um porém importante: a licença do modelo de voz padrão (OmniVoice) é **não comercial**. Serve para vídeo pessoal e de escola, mas não para anúncio pago de cliente. O app traz outros motores, então no teste também vou atrás de um com licença comercial para os anúncios.

Uma regra para as vozes que você mandar: só clone de quem deu permissão, como a sua ou de cliente que concordou. Anotei tudo em `motion-base/fontes/ferramentas/voicestudio.md`.

## 2026-10-02T23:10:47Z · Rei da VSL - Vítor

ja ta instalado no meu pc

## 2026-10-02T23:40:53Z · Claude

Boa, então você pode clonar direto aí no app. Testei aqui com vozes criadas do zero pela IA, sem voz de ninguém, e a conclusão é que **o motor padrão (OmniVoice) serve bem para o seu PC**. Ouve as amostras abaixo e me diz se o OmniVoice te agrada.

- **OmniVoice:** fala o texto do anúncio inteiro de forma clara. Só ficou ambíguo "quarenta e oito e cinquenta", então escreva o preço com uma pausa ("quarenta e oito, e cinquenta"). Sem placa NVIDIA, 12 s de fala demoraram de 1 a 2 min aqui. No seu PC deve ser parecido.
- **dots.tts:** é o motor do app que pode ser usado em anúncio pago, mas levou 40 min para 12 s e errou "AB". Ele só é viável com GPU (Kaggle), e no Windows nem roda.
- **Licença:** a voz do OmniVoice não pode ser usada em anúncio pago de cliente. Para escola e vídeos pessoais está liberada.

No app, use 10 a 15 s de áudio limpo e cole o texto exato do que a pessoa fala, porque isso deixa a clonagem bem mais rápida. Quando quiser que eu clone uma voz aqui, me manda junto um "autorizo" do dono dela.

## 2026-10-02T23:44:26Z · Rei da VSL - Vítor

ficou ruim todos kk, mas o app é útil ent deixa em  stand by, pode marcar como resolvido, mas salve na memoria essa ferramenta e semelhantes

## 2026-10-02T23:44:44Z · Claude

Combinado, ficou em stand-by. Salvei na memória o VoiceStudio e os motores parecidos (OmniVoice, dots.tts, MOSS, CosyVoice, IndexTTS, entre outros), com o seu veredito. A ElevenLabs continua sendo a referência de qualidade.
