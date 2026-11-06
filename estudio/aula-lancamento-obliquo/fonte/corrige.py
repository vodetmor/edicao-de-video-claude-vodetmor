# Junta a transcrição principal com os trechos re-transcritos -> audio/palavras_ok.json
import json
D="/mnt/project-files/estudio/aula-lancamento-obliquo"
W=json.load(open(f"{D}/audio/palavras.json"))
def parse(s):
    out=[]
    for tok in s.split():
        w,t=tok.rsplit("@",1); a,b=t.split("-"); out.append({"w":w,"s":float(a),"e":float(b)})
    return out
fix=[(138.5,153.2,parse("Usando@138.50-139.46 Torricelli@139.46-140.10 na@140.10-140.22 vertical,@140.22-140.54 zero@140.86-141.40 igual@141.40-141.90 a@141.90-142.20 vê@142.20-142.40 zero@142.40-142.70 ípsilon@142.70-143.12 ao@143.12-143.36 quadrado,@143.36-143.90 menos@143.92-144.30 dois@144.30-144.68 gê@144.68-145.08 agá.@145.08-145.36 Então,@145.48-146.16 altura@146.30-146.82 máxima,@146.82-147.48 agá@147.48-148.20 igual@148.20-148.60 a@148.60-148.84 vê@148.84-149.04 zero@149.04-149.36 ao@149.36-149.50 quadrado,@149.50-150.10 vezes@150.10-150.48 seno@150.48-151.10 ao@151.10-151.10 quadrado@151.10-151.60 de@151.60-151.74 teta,@151.74-152.10 sobre@152.16-152.48 dois@152.48-152.78 gê.@152.78-153.16")),
     (208.6,217.2,parse("Resumindo,@209.30-209.96 quebra@210.04-210.66 a@210.66-210.68 velocidade@210.68-211.12 em@211.12-211.46 duas.@211.46-211.70 Na@212.02-212.42 horizontal,@212.42-212.90 movimento@213.18-213.64 uniforme.@213.64-214.68 Na@214.68-215.00 vertical,@215.00-215.38 movimento@215.66-216.14 variado.@216.14-217.08")),
     (16.4,18.2,parse("Primeiro,@16.76-17.16 a@17.18-17.42 regra@17.42-17.92 do@17.92-17.98 jogo.@17.98-18.40"))]
for a,b,novas in fix:
    W=[w for w in W if not (a<=w["s"]<b)]+novas
W.sort(key=lambda w:w["s"])
# normaliza grafias da fala para as âncoras
troca={"gt":"gê tê","gt.":"gê tê.","g.":"gê.","2g.":"dois gê.","2gh.":"dois gê agá.","yis,":"ípsilon,","y":"ípsilon","Vy,":"vê ípsilon,","X,":"xis,","Y,":"ípsilon,","t.":"tê.","t,":"tê,"}
for w in W: w["w"]=troca.get(w["w"],w["w"])
for i,w in enumerate(W): w["i"]=i
json.dump(W,open(f"{D}/audio/palavras_ok.json","w"),ensure_ascii=False,indent=0)
print(len(W))
for w in W: print(w["i"],w["w"],w["s"],w["e"],sep="|",end="  ")
