# Gera as 6 imagens base. Uso: powershell -File rodar.ps1 [chatgpt|gemini]
param([string]$prov='chatgpt')
$d = Split-Path -Parent $MyInvocation.MyCommand.Path
$p = Get-Content "$d\prompts.json" -Raw -Encoding UTF8 | ConvertFrom-Json
New-Item -ItemType Directory -Force "$d\saida" | Out-Null
foreach ($i in $p) {
  $f = "$d\saida\$($i.nome).txt"
  [IO.File]::WriteAllText($f, $i.prompt, (New-Object Text.UTF8Encoding($false)))
  node C:\image-automation\gerar-imagem.js --provider $prov --prompt-file $f --out "$d\saida\$($i.nome)-$prov.png"
}
