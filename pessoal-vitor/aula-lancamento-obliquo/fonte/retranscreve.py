# Re-transcreve trechos onde o Whisper colou palavras (tempos absolutos)
import json, subprocess, sys
from faster_whisper import WhisperModel
D="/mnt/project-files/estudio/aula-lancamento-obliquo"
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
for a,b,prompt in [(138.5,153.2,"Usando Torricelli na vertical: zero igual a vê zero ípsilon ao quadrado, menos dois gê agá. Então, altura máxima: agá igual a vê zero ao quadrado, vezes seno ao quadrado de teta, sobre dois gê."),
                   (208.7,217.5,"Resumindo: quebra a velocidade em duas. Na horizontal, movimento uniforme. Na vertical, movimento variado."),
                   (16.0,18.3,"Primeiro, a regra do jogo.")]:
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(a),"-to",str(b),"-i",f"{D}/audio/locucao.mp3","-ar","16000","-ac","1","/tmp/trecho.wav"])
    segs,_=m.transcribe("/tmp/trecho.wav",language="pt",word_timestamps=True,initial_prompt=prompt)
    for s in segs:
        for w in s.words: print(f"{w.word.strip()}@{a+w.start:.2f}-{a+w.end:.2f}", end="  ")
    print("\n---")
