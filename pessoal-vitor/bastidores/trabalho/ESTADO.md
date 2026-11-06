# Bastidores (TikTok 9:16) — estado em 05/10/2026
Pedido do Vítor (04/10 noite): editar o pré-edit dos bastidores da aula de lançamento oblíquo, plano e render já aprovados, postar 05/10 ao meio-dia.

## Feito
- brutos/bastidor_pre-edit_v2.mp4 (1:49, só câmera, 1080x1920). prints/ = interface do Claude (escuro).
- Voz: DeepFilterNet3 (aberto, CPU; modelo salvo em ferramentas/modelos/DeepFilterNet3.zip) + EQ/compressor -> audio/voz_final.wav. Mesmo número de amostras (sincronia labial intacta). Ruído de fundo ~20 dB mais baixo.
  Meta SAM Audio: código aberto, mas pesos com acesso controlado no Hugging Face + precisa GPU; não usado.
- Transcrição: faster-whisper large-v3 -> audio/palavras.json.
- Edição Remotion em fonte/remotion (Bastidores.tsx). Mapa de tempo em fonte/prepara.py: pausa de 3 s inserida em 68,98 s (3D) e cartão final de 3,5 s (CTA seguir) no lugar do clique. Total 1:54,9.
- Som: fonte/sons.py (voz + Wallpaper de Kevin MacLeod com ducking + efeitos) -> audio/mix.wav (-14 LUFS, -1 dBTP).
- Componentes reutilizáveis da interface do Claude: motion-base/componentes/claude-ui/.

## Reconstruir
```
python3 -m venv /opt/va && /opt/va/bin/pip install faster-whisper deepfilternet soundfile scipy && /opt/va/bin/pip install torch==2.3.1 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cpu
mkdir -p ~/.cache/DeepFilterNet && cd ~/.cache/DeepFilterNet && unzip /mnt/project-files/ferramentas/modelos/DeepFilterNet3.zip
cp -r trabalho/fonte/remotion /root/bast && cd /root/bast && npm ci
mkdir -p public/video && ffmpeg -i ../brutos/... -an -c:v libx264 -crf 14 -g 15 public/video/face.mp4 ; idem aula.mp4 (estudio/aula-lancamento-obliquo/renders/lancamento-obliquo.mp4)
OUT=/root/bast/src/data python3 trabalho/fonte/prepara.py
/opt/va/bin/python trabalho/fonte/sons.py
npx remotion render src/index.ts Bastidores out/video.mp4 --muted --concurrency=4 --crf=17 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ffmpeg -i out/video.mp4 -i trabalho/audio/mix.wav -c:v copy -c:a aac -b:a 256k -shortest bastidores-final.mp4
```
## Próximo
- Esperar opinião do Vítor; ajustar só o que ele citar.

## 2026-10-05 06:40 UTC: ENTREGUE
- Final: ../bastidores-final.mp4 (114.93 s, 1080x1920, -14 LUFS). Entregue no thread.
- Código salvo no GitHub vodetmor/edicao-de-video-claude-vodetmor (main), mesma estrutura de pastas de /mnt/project-files (só fonte, sem vídeos/áudios).
- Crédito: Música "Wallpaper" de Kevin MacLeod (incompetech.com), CC BY 4.0.

## 2026-10-05 15:45 UTC: rodada 2 (feedback do Vítor)
- Legenda: sempre 1 linha, pílula escura, centro em y=1100 (emenda entre os quadros).
- Rosto no split: k 1.1, cy 840 (rosto no meio do painel de baixo).
- Logos reais ChatGPT/Gemini (motion-base/logos/lobehub-*).
- Vitrine: 6,4 s da aula (com o som dela) depois do gancho (prepara.py SHOW_AT=7.6). tempo.json ganhou showAt/show/gapOut/endOut; sons.py usa.
- Rebuild: OUT=/root/bast/src/data python3 fonte/prepara.py; /opt/va/bin/python fonte/sons.py /root/bast/src/data/tempo.json; render Remotion; mux; versão celular (crf 23, maxrate 6M).
- Rodada 3: cortes de silêncio (23 cortes, -5,9 s) em prepara.py -> tempo.json "segs"; sons.py monta a voz pelos segs; rosto por segs com zoom alternado; legenda y 1100 (split) / 1330 (rosto); barra de passos removida; dica e comentários na tela de cima.
