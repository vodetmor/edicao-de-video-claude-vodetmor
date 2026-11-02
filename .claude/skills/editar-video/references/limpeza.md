# Limpeza (cortes)

`limpar.py` = `transcrever.py` → `cortes.py` → `montar.py` → `enquadrar.py`. Cada um pode rodar sozinho.

## Ritmo
| `--ritmo` | Pausa mínima mexida | Respiro que fica | Use em |
|---|---|---|---|
| `anuncio` | 0,24 s | 0,18 s | criativo, reels rápido |
| `conteudo` (padrão) | 0,30 s | 0,24 s | conteúdo orgânico |
| `aula` | 0,55 s | 0,40 s | aula: tempo para entender, não acelere |

Pausa é medida pela energia do áudio (não pelo tempo das palavras do Whisper, que estica a última palavra).

## Revisar `projeto/cortes.md`
- `tomada`: frase repetida, ficou a última. Confira se a última é mesmo a melhor; se não, troque `aplicar` das duas.
- `pedido`: o usuário falou "corta", "errei", "deixa eu repetir". "de novo" e "pera" vêm como sugestão (ambíguos).
- `repeticao`: "eu vou eu vou" → fica a última.
- `vicio?`: "né", "tipo", "é" solto: decida pelo jeito de falar do usuário (tirar todos deixa robótico).
- Corte errado: mude `aplicar`, ou acrescente `{"s": 3.2, "e": 3.9, "tipo": "manual", "texto": "motivo", "aplicar": true}`
  (tempos do ORIGINAL), e rode `montar.py` + `enquadrar.py`.
- Com roteiro: `--roteiro roteiro.txt` melhora a grafia de nomes. Divergência que muda o sentido: aponte, não corte.

## Velocidade
`montar.py --velocidade 1.1` acelera vídeo e voz juntos (sem mudar o tom). Aula: nunca acelere.

## Saídas
`base.mp4` (voz tratada: passa-alta 70 Hz, compressão leve, -14 LUFS), `base-palavras.json` (tempos já no vídeo
cortado), `mapa.json` (pedaços do original), `rosto.json`. Tudo o que vem depois usa a base, nunca o original.
