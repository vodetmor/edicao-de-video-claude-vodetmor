// Cartão squircle com mola + título subindo (fundo transparente), para virar Lottie/ProRes 4444
var comp = app.project.items.addComp("Cartao", 1080, 1080, 1, 2.5, 30);
var s = comp.layers.addShape(); s.name = "Squircle";
var g = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
var v = g.property("ADBE Vectors Group");
var r = v.addProperty("ADBE Vector Shape - Rect");
r.property("ADBE Vector Rect Size").setValue([520, 520]);
r.property("ADBE Vector Rect Roundness").setValue(130);
var f = v.addProperty("ADBE Vector Graphic - Fill");
f.property("ADBE Vector Fill Color").setValue([0, 0.443, 0.89]);
var sc = s.property("ADBE Transform Group").property("ADBE Scale");
sc.setValueAtTime(0, [0, 0]); sc.setValueAtTime(0.45, [100, 100]);
// mola: overshoot por expressão (receita clássica de AE)
sc.expression = "n=0;if(numKeys>0){n=nearestKey(time).index;if(key(n).time>time)n--;}if(n==0){t=0}else{t=time-key(n).time;}if(n>0&&t<1){v=velocityAtTime(key(n).time-thisComp.frameDuration/10);amp=.06;freq=2.5;decay=6;value+v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);}else{value;}";
var t = comp.layers.addText("Edite com IA");
var td = t.property("ADBE Text Properties").property("ADBE Text Document");
var d = td.value; d.fontSize = 84; d.fillColor = [1,1,1]; d.font = "Inter"; d.justification = ParagraphJustification.CENTER_JUSTIFY; td.setValue(d);
var p = t.property("ADBE Transform Group").property("ADBE Position");
p.setValueAtTime(0.35, [540, 620]); p.setValueAtTime(0.9, [540, 570]);
p.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER); 
var o = t.property("ADBE Transform Group").property("ADBE Opacity");
o.setValueAtTime(0.35, 0); o.setValueAtTime(0.75, 100);
writeLn("ok " + comp.numLayers);
