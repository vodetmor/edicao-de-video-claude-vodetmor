---
name: vixplay-pdf-aprovacao-modelo
description: PDF de aprovação de vídeo SEMPRE no modelo da skill pdf-aprovacao (gera_pdf.py + plano.json com tema), nunca HTML improvisado
metadata:
  type: feedback
---
Todo PDF de aprovação de storytelling/storyboard sai pela skill `pdf-aprovacao` (`gera_pdf.py` + `plano.json`, tema da marca copiado do último plano do cliente, ex.: `clientes/vixplaytv/criativos/trabalho/historias-vox/plano.json`), com quadros codificados, página de roteiro, som e "Para aprovar".

**Why:** em 07/11/2026 mandei um PDF improvisado (HTML simples com folha de storyboard) e o Vítor chamou de horrível e mandou excluir; também reclamou quando mandei só imagens sem o PDF.
**How to apply:** quadros individuais 9:16 em `trabalho/<obra>/quadros/` → `plano.json` → `gera_pdf.py` → conferir as páginas → enviar o PDF como anexo (`display: attach`). Ver [[vixplay-feedback-storytelling]].
