# Aula: Ótica (refração → reflexão total → dispersão) — estado em 2026-10-05
Pedido do Vítor (04/10, project chat): mesma fórmula do lançamento oblíquo, prisma 3D como gancho e final, loop (último quadro = primeiro), plano e render PRÉ-APROVADOS, horizontal 1080p.

## Decisões
- Estúdio ESCURO (a luz e o arco-íris só brilham no escuro); lousa 2D também escura, mesma tipografia, legenda branca com halo escuro.
- Prisma 3D: vidro flint SF10 (Cauchy n(656)=1,7215 / n(405)=1,7783), 16 comprimentos de onda, Snell por cor (src/aula/otica.ts, cenaPrisma.ts). No 2D/narração: vidro comum 1,51/1,53 (crown).
- Física conferida: água 4/3 (225 000 km/s); 53° → sen 0,8 → sen θ2 = 0,6 → 36,87°; sen L = 0,75 → 48,59°.
- 3D em 3 momentos: gancho (câmera termina de cima e vira lousa 2D sem corte), fibra óptica (P(222)–pausa 230), final (volta ao quadro 0: luz apaga, câmera F0).
- Som: cada cor = nota da pentatônica (vermelho grave → violeta agudo); arpejo quando o leque abre. Música "Inspired" (Kevin MacLeod, CC BY 4.0 — CRÉDITO na descrição).
- Voz PROVISÓRIA: edge-tts pt-BR-AntonioNeural. Final = ElevenLabs (Vítor gera). Roteiro: roteiro/ROTEIRO-ELEVENLABS.txt.

## Pipeline (BASE = /mnt/project-files/pessoal-vitor/aula-otica/trabalho)
- Remotion de trabalho em /root/otica (cópia de fonte/remotion + npm ci). Depois de mexer em /root/otica/src, copiar de volta para fonte/remotion/src.
- fonte/voz_provisoria.py → fonte/alinha.py (Whisper medium ou --edge) → fonte/tempo.py (pausas, aperta silêncios, relogio.json) → fonte/sons.py (mix -14 LUFS) → fonte/render-final.sh (blocos de 150 retomáveis em renders/blocos).
- TROCAR A VOZ: bash fonte/troca-voz.sh /caminho/elevenlabs.mp3 (refaz tudo e renderiza).
- Render: 3D ≈ 10 s/quadro (SwiftShader, 4 CPUs), 2D ≈ 0,5 s/quadro.

## Reconstruir do zero
```
pip install numpy pillow edge-tts faster-whisper
mkdir -p /root/otica && cp -r BASE/fonte/remotion/. /root/otica/ && cd /root/otica && npm ci
mkdir -p public/audio && cp BASE/audio/mix.wav public/audio/
bash BASE/fonte/render-final.sh
```

## 05/10/2026 10:10 UTC: ENTREGUE (voz provisória)
renders/aula-otica.mp4 (2:03, loop conferido; título menor e sem brilho no quadro 0). v0 antiga em renders/aula-otica-v0.mp4.
Próximo: quando Vítor mandar o mp3 do ElevenLabs, `bash fonte/troca-voz.sh <mp3>`.

## 05/10/2026 15:20 UTC: voz do ElevenLabs encaixada
Narração em audio/elevenlabs/narracao-otica.mp3. Pausas +0,5 s, silêncios naturais preservados (até 1,2 s), música sobe suave nas pausas. Render completo em andamento (renders/blocos). A versão com voz provisória ficou em renders/aula-otica-voz-provisoria.mp4.
alinha.py agora: sem roteiro no prompt do Whisper, expande dígitos; `--raw` reaproveita audio/whisper_raw.json.
