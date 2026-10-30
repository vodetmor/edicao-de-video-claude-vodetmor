# Técnicas avançadas (teste curto antes de prometer)

Regra: técnica arriscada = teste de 5 s renderizado em arquivo, conferido, antes de qualquer vídeo inteiro.
Instalar uma skill não dá a capacidade; confira a ferramenta real.

## Recorte de fundo (alfa)
- Para: palavra atrás do ombro, telas atrás da cabeça, apresentador sobre grade de imagens.
- Opção do Remotion: `@remotion/video-matting` (precisa de WebGPU: costuma exigir placa de vídeo; `canUseVideoMatting()`
  diz se dá). Sem GPU: testar alternativas locais grátis de segmentação de pessoa; avaliar no teste.
- Teste: 5 s com cabelo, mãos e ombros se mexendo, sobre fundo claro E escuro. Halo, borda tremendo ou mão sumindo
  reprova. Corrija pouco; continuou ruim: proponha regravar (fundo liso, luz constante) ou use `moldura` sem recorte.
  Nunca finja recorte com retângulo nem esconda defeito com brilho.
- Aprovado: guarde a camada com alfa separada (WebM VP9 ou ProRes 4444) e reutilize; não recalcule a cada ajuste de texto.
  MP4 H.264 não guarda transparência.

## 3D
- `@remotion/three` + `ThreeCanvas`, geometria real, tudo animado por `useCurrentFrame()` (nunca `useFrame`).
- Render com `--gl=angle` se a cena sair preta. Teste de 5 s: volume, oclusão, sombra; um quadro do Studio não vale.
- Sem modelo comprado nem render pago sem autorização.

## B-roll e material real
`ferramentas/busca/busca.py` (fontes grátis com licença registrada) → `assets/` → elemento `imagem`. Nunca imagem de IA
fingindo ser foto real.
