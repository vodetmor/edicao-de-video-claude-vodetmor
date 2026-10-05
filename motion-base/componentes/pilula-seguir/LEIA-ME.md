# Pílula "Seguir" (meio do vídeo, loop intacto)

PADRÃO nas aulas de conteúdo do canal pessoal (Vítor, 05/10/2026: muita view, pouca gente seguindo).
- PilulaSeguir.tsx: foto + @vitormach._ + botão Seguir que o cursor clica e vira "Seguindo ✓". Sem logo do TikTok. Só depende do Remotion.
- Duração 96 quadros (3,2 s). Props: inicio, x, y, escala, escuro, frase.
- Copie pessoal-vitor/marca/foto-perfil.jpg para public/img/avatar.jpg.
- Quando: logo depois de uma entrega de valor no meio do vídeo (resposta de questão), numa pausa planejada; nunca perto do 1º ou do último quadro, então o loop continua igual.
- Onde: canto superior direito livre (x = 1920-560-70, y = 26 no horizontal); conferir nos quadros que não cobre texto e não tem linha cruzando.
- Som (sons.py): whoosh curto na entrada, tick no clique (inicio+34), chime 1568 Hz em inicio+37, tudo baixo (-16 a -30 dB).
- Primeiro uso: aula de ótica (pessoal-vitor/aula-otica), depois da resposta θ₂ ≈ 37°.
- Fala: FALA-SEGUIR.txt (frase curta para o ElevenLabs, já vai dentro do roteiro das próximas aulas).
