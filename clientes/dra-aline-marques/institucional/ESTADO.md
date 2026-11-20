# Vídeo institucional · Dra. Aline Marques (potencial cliente da agência) · estado

Pedido: Ruan Ribeiro (19/11/2026, WhatsApp) -> Vítor. "Um vídeo igual o da MedicMais, só que para uma clínica de estética." É um **pitch 1 a 1**
(vai para a cliente pelo WhatsApp, assistido no celular com som), no padrão do vídeo da MedicMais (`clientes/medicmais-sobradinho/trabalho/`).
Voz: Ana Dias (ElevenLabs), gerada pelo Vítor no site. Créditos de IA do Vítor estão no fim: **reaproveitar a base, sem estudo novo**.

## O que a cliente é (fontes públicas, conferidas em 19/11)
- Dra. Aline Marques, **Estética Avançada**, harmonização facial, registro CRBM (biomédica esteta). Instagram `@dra.aline_marques`: 1.476 seguidores,
  bio "Beleza com estratégia, não achismo." Destaques: Feedbacks, Onde Estamos, Sobre Mim.
- Link da bio = site `draalinemarques.vercel.app` (página simples: foto, "Beleza natural conduzida com técnica, delicadeza e olhar atento a cada detalhe do seu rosto.",
  botão "Agendar avaliação pelo WhatsApp", avaliar no Google). **Já tem site: não vender site.**
- Cidade e endereço não aparecem em lugar nenhum: confirmar com o Ruan.

## O que o Ruan explicou (áudios de 19/11)
- Ela vai receber muitos leads (projeto de captação) e precisa responder rápido, 24 h, madrugada e fim de semana: **robô de atendimento no WhatsApp**.
- Quem cuida da administração (compras, estoque, organização) é o marido, hoje **no papel**: oferecer **CRM/painel** para ter o controle da clínica. Ele é cético: o vídeo
  precisa passar segurança (mostrar funcionando antes, a clínica continua no comando).
- Mostrar confiança com trabalho já feito: **Central do Espeto** (já rodando). **Não citar a MedicMais** ainda (não está 100%).
- Não usar estatística inventada: o Ruan falou de "estudos" sobre resposta em 5 minutos; deixei só "quem responde primeiro costuma fechar" até haver fonte.

## Identidade medida do site dela
Fundo creme (oklch 98,5% .012 78), areia/dourado suave (oklch 78% .06 65), marrom quente para texto (oklch 40% .05 45), fonte Jost. Foto dela em `brutos/aline-site.png`.
Filtro de gosto: sem gradiente, sem brilho, sem vidro; squircles, molas, uma cor de destaque; logos reais (WhatsApp, Google) em SVG.

## Roteiro
`ROTEIRO-ELEVENLABS.txt`: 1666 caracteres, ~122 s no ritmo da Ana Dias. "CRM" está escrito "cê erre ême" para a voz ler certo (na tela aparece CRM).
Estrutura: gancho com cena (2 da manhã, mensagem sem resposta; v2, 19/11, o Vítor não gostou da abertura com o lema) -> problema (resposta rápida) -> robô -> painel/CRM -> administração no papel virando tela -> prova (já funciona) -> caminho em 4 passos -> fecho com o lema dela ("Beleza com estratégia... agora também no atendimento").

## Storyboard (9:16, 1080x1920, 30 fps, cenas presas à palavra)
K01 relógio 2h da manhã + mensagem "Quanto custa a avaliação?" no WhatsApp (sem resposta) · K02 de manhã: outra clínica respondeu · K03 "cada vez mais" (24 h, fim de semana) · K04 as duas peças (dois cartões) ·
K05 conversa do robô (exemplo fictício, sem preço) · K06 "passa para a Dra. Aline" (quem manda é a clínica) · K07 painel CRM em colunas (Novo > Conversando > Avaliação marcada > Atendida > Retorno) ·
K08 agenda e lembretes · K09 caderno e caneta virando tela (compras, estoque, contas) · K10 prova: robô real, todo dia, num restaurante em Sobradinho (sem nomes nem dados de cliente) ·
K11 quatro passos · K12 capa final: foto + nome + lema.

## Como produzir (economia: copiar a base da MedicMais)
1. Copiar `clientes/medicmais-sobradinho/trabalho/fonte/` para `institucional/trabalho/fonte/` (Remotion: `src/Video.tsx`, `kit.tsx`, `Root.tsx`, `cues.py`, `audio/audio.py`).
2. Trocar tema (creme/areia/marrom, Jost), textos e cenas K01-K12; prints do WhatsApp e do painel desenhados em HTML com logos reais.
3. **Portão:** quadros-chave (stills) e PDF de aprovação para o Vítor ANTES do render completo.
4. Com o mp3: Scribe para os cues por palavra -> `cues.py` -> `audio.py` (trilha original, -14 LUFS) -> render -> crítica independente >= 8/10 -> entregar 9:16 e versão celular < 30 MB.

## Falta (nada disso bloqueia o roteiro)
- mp3 da Ana Dias com o `ROTEIRO-ELEVENLABS.txt` (Vítor).
- Logo oficial e 3 a 5 fotos da clínica/da Dra. (Ruan); nome da clínica, se houver além do nome dela; cidade.
- OK para citar a Central do Espeto como prova (o roteiro diz só "um restaurante em Sobradinho").
- Quadros-chave aprovados antes do render.
