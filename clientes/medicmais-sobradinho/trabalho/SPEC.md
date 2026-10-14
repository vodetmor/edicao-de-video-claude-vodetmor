# SPEC · Vídeo de venda do site MedicMais Sobradinho (interno)

Pedido do Vítor, 13/10/2026 23:44 BRT: vídeo editado no nosso padrão vendendo ao dono da clínica o próprio site
(https://medicmais-sobradinho-site.vercel.app/): por que uma clínica precisa de site e infraestrutura, como agrega
ao negócio, por que comprar. Primeiro entregável: plano + quadros-chave para aprovação (sem render completo).

## Público e uso
- Uma pessoa: o dono da MedicMais (o rapaz do tour, provável). Vai receber pelo WhatsApp e assistir no celular, com som.
- Logo: 9:16 1080x1920 30 fps primeiro; 16:9 1920x1080 da mesma spec para reunião.
- Não é criativo de tráfego, é pitch 1 a 1: pode ter 70-80 s; gancho é a personalização (o site DELE já pronto).

## Identidade (medida, `identidade/tema.json`)
Vermelho #EB2026, grafite #121216, névoa #F4F5F7, branco, texto #55565E; Poppins 800 caixa alta (títulos, tracking -0,025em),
400/600 no resto; "+" em squircle vermelho como motivo que costura as cenas; botões pílula. Filtro de gosto: sem degradê,
sem brilho. Uma família só (Poppins) + legenda não usada (as frases são a tipografia, como nos criativos Rei da VSL).

## Material real (nada inventado)
- Prints do site: `identidade/prints/` (celular 390 @3x e desktop 1440 @2x; `.pend` escondido).
- Reels do Instagram da clínica baixados com yt-dlp (público): `../brutos/reels/` DJXkhhZv_-R (tour 38,5 s, 720x1280),
  DRxLD5sDhRp (Dona Ana 68,5 s), DOeJs35Dn7D (Maria 32,4 s, 1080x1920), DR226gCAYMv ("aqui somos família" 40,8 s).
  DK-UPmov7B0 (Beatriz) não baixou sem login. Todos têm legenda queimada: usar o terço de cima (card com altura ≤ 0,65 da largura x 1,78).
- Dados do cliente: só os do site (550 m², médico e dentista no mesmo lugar, 30+ edições do Saúde Day, serviços, comentários).
- Dados externos com fonte na tela: TIC Saúde 2023 (Cetic.br/NIC.br): agendamento online em estabelecimentos de saúde 13% (2022) -> 34% (2023).
- Busca pelo nome "MedicMais Sobradinho" (14/10, WebSearch): só catálogos (catalogo.med.br), Doctoralia e outra clínica (Salute).
  CONFERIR no Google do Vítor antes do render; se mudar, trocar a frase C04b.

## Referências e por que
- Padrão-ouro VSL Play v6: animação presa à palavra falada, música no tempo, ducking pela voz.
- Criativos Rei da VSL (rodada 4/5): uma ideia por cena, quadro 0 = capa, objeto-herói segura a frase.
- Pitch de agência para clínica (busca web): o que convence é ver o site rodando no celular + jornada do paciente
  (busca -> página do tratamento -> WhatsApp) + prova social. Nada de "UI falsa": tudo que aparece em tela é print real do site.
- Publicidade médica: CFM 2.336/2023 (vigente desde 11/03/2024) pede identificação do diretor técnico (nome + CRM) em anúncio de estabelecimento; regra do CFO para o CRO a conferir;
  o site já tem o espaço (CRM/CRO) — usado no ato "faltam 4 detalhes".

## Estrutura e tempos (voz provisória edge-tts Antonio +10%, `voz/tempos.json`)
| Ato | Frases | Tempo |
|---|---|---|
| Gancho | C01 | 0,0-4,0 |
| A clínica (o que já tem) | C02 | 4,3-13,0 |
| O problema (feed, pesquisa, mercado) | C03-C05 | 13,4-34,9 |
| Como o site agrega (4 frentes) | C06-C10 | 35,2-62,2 |
| Por que comprar (identidade, faltam 4 detalhes) | C11-C12 | 62,5-75,8 |
| Chamada (loop com a capa) | C13 | 76,1-77,8 |
Total ~78 s. Com a voz final (ElevenLabs) os tempos mudam; quadros-chave seguem a frase, não o segundo.

## Parâmetros de motion (DESIGN-SYSTEM §5)
- Entradas `approach` k 0,15; cards 15-23 quadros; stagger 3 quadros; câmera 30-45 quadros; nada escala de 0 (0,94 -> 1).
- Celular: sobe 40 px na capa e a página rola por `translateY` do print real (rolagem com ease `expressiva`, 1,2 s).
- Contadores (550, 30+, 13%/34%) contam em 18 quadros e pousam na sílaba tônica.
- Digitação nas buscas: 2 quadros por letra, cursor vermelho piscando a 15 quadros.
- Troca de fundo como ritmo: névoa -> vermelho (Saúde Day) -> grafite (feed) -> branco (dado) -> grafite (4 frentes) -> névoa.
- Nada parado > 8 quadros fora do quadro final (push-in 100 -> 104% nas telas de leitura).

## Som (DESIGN-SYSTEM §7)
- Trilha original sintetizada (synth.py do VSL Play) ~96 BPM, piano + baixo macio, tom maior; grade presa a "pronto" (C01), "quatro frentes" (C06) e "no ar" (C13).
- SFX: tique nos contadores, digitação leve nas buscas, clique + "pop" no toque do WhatsApp, whoosh curto nos cards, "+" com pluck.
- Voz -16 LUFS curto prazo, música 19 dB abaixo enquanto fala, volta em 0,7 s nas pausas; master -14 LUFS / -1 dBTP.

## Produção depois do OK
Projeto Remotion próprio da obra em `fonte/` (base estudio/motor), cues por palavra da voz final (ElevenLabs Scribe),
reels em `public/`, render 720p para crítica independente (alvo ≥ 8/10), depois 1080p 9:16 e 16:9.
