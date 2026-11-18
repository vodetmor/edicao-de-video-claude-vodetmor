M=/mnt/project-files/escola-consciencia-negra/somalia/midia/mapas-historia/mapas
mkdir -p rawmap
for pass in 1 2 3; do
 while read n u; do
  [ -s "rawmap/$n" ] && continue
  c=$(curl -sS -m 90 -o "rawmap/$n" -w "%{http_code}" -A "EscolaBusca/1.0 (school project; low volume)" "$u")
  echo "$pass $c $n"; [ "$c" = 200 ] || rm -f "rawmap/$n"
  sleep 40
 done < maps_list.txt
done
