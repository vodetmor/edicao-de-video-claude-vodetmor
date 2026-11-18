# usage: dlc.sh list.tsv   (lines: name<TAB>h<TAB>url)
while IFS=$'\t' read -r name h url; do
  [ -s "raw/$name.webm" ] && continue
  base="${url##*/}"; t="${url/\/commons\//\/commons\/transcoded\/}/$base"
  for r in $( [ "$h" -ge 720 ] && echo 720 ) 480 360; do
    code=$(curl -sS -m 300 -o "raw/$name.webm" -w "%{http_code}" -A "EscolaBusca/1.0 (school project)" "$t.${r}p.vp9.webm")
    [ "$code" = 200 ] && { echo "$name ok ${r}p"; break; }
    echo "$name $code ${r}p"; rm -f "raw/$name.webm"; [ "$code" = 429 ] && sleep 30
  done
  sleep 2
done < "$1"
