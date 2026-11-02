# Revisão e correção por trecho

## Painel (o jeito principal)
`node estudio/editor/remotion/painel.mjs <pasta> [--porta 8080]` e o usuário abre http://localhost:8080.
- A prévia toca direto do código (Remotion Player): nenhuma espera de render. Qualquer mudança no roteiro, na base,
  no rosto ou no código atualiza sozinha.
- Atalhos: `N` nota no quadro atual · `I`/`O` início e fim de um trecho · espaço toca/pausa · ← → um quadro ·
  Shift+← → um segundo · clicar numa palavra da transcrição pula para ela.
- Notas vão para `projeto/revisao/notas.json`: `{id, s, e, quadro, texto, fala, status}` (tempos no vídeo editado).

## "Aplica as notas"
1. Leia `notas.json`; trabalhe só as `pendente`.
2. Para cada nota, ache a causa pelo tempo: cena/elemento do roteiro (âncora perto de `s`), corte (`mapa.json` liga o
   tempo da base ao original), legenda (palavra em `base-palavras.json`) ou enquadramento (`rosto.json`/layout).
3. Faça a MENOR mudança que resolve. Preserve o resto. Não acrescente efeito que ninguém pediu.
4. Marque a nota como `corrigido` (o usuário vê no painel e muda para `aprovado`).
5. Responda em uma linha por nota: o que mudou. Se mexeu nos cortes, as notas seguintes mudam de tempo: avise.
6. Sem painel: `renderizar.mjs <pasta> --trecho 6-12` mostra só o trecho corrigido, com entrada e saída.

Pedido vago ("ficou estranho"): transforme em problema observável e mudança conferível antes de mexer.
Mesmo erro de novo: diagnóstico primeiro, depois a menor correção.

## Verificação final (sem efeito novo)
Fala e oferta preservadas, legenda correta, áudio inteligível, rosto visível, assets inteiros, CTA legível, duração certa.
