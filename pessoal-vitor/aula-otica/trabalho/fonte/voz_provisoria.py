# Voz provisória (edge-tts, pt-BR-AntonioNeural) só para montar e sincronizar o vídeo.
# A entrega final usa a voz do ElevenLabs (troca com troca-voz.sh).
import asyncio, json, os, ssl, edge_tts
import edge_tts.communicate as _ec
if os.path.exists("/root/.ccr/ca-bundle.crt"): _ec._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")  # proxy da nuvem
D = "/mnt/project-files/pessoal-vitor/aula-otica/trabalho"
txt = open(f"{D}/roteiro/ROTEIRO-ELEVENLABS.txt", encoding="utf-8").read().replace("\n\n", "\n")
async def main():
    c = edge_tts.Communicate(txt, "pt-BR-AntonioNeural", rate="+0%", boundary="WordBoundary")
    ws = []
    with open(f"{D}/audio/locucao.mp3", "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7; ws.append({"w": ch["text"], "s": s, "e": s + ch["duration"] / 1e7})
    json.dump(ws, open(f"{D}/audio/palavras_edge.json", "w"), ensure_ascii=False)
asyncio.run(main())
