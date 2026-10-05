# Voz neural grátis da Microsoft (Edge), sem chave. Uso:
#   python3 -m pip install edge-tts
#   python3 voz_edge.py pt-BR-ThalitaMultilingualNeural "texto" saida.mp3
# Vozes pt-BR: ThalitaMultilingualNeural, FranciscaNeural, AntonioNeural.
# Na nuvem o edge-tts ignora o certificado do proxy, por isso a troca abaixo.
import asyncio, sys, os, certifi
if os.path.exists("/root/.ccr/ca-bundle.crt"):
    certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
voz, texto, saida = sys.argv[1], sys.argv[2], sys.argv[3]
asyncio.run(edge_tts.Communicate(texto, voz).save(saida))
