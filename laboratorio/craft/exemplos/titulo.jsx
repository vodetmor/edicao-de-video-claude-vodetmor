// Teste: cartão de título estilo Apple feito só por script (sem janela)
var comp = app.project.items.addComp("Titulo", 1920, 1080, 1, 3, 30);
comp.bgColor = [0.97, 0.97, 0.975];
var t = comp.layers.addText("Máquina de Editar");
var td = t.property("ADBE Text Properties").property("ADBE Text Document");
var doc = td.value; doc.fontSize = 120; doc.fillColor = [0.07,0.07,0.08]; doc.font = "Inter"; td.setValue(doc);
var pos = t.property("ADBE Transform Group").property("ADBE Position");
pos.setValueAtTime(0, [960, 640]); pos.setValueAtTime(0.7, [960, 540]);
var op = t.property("ADBE Transform Group").property("ADBE Opacity");
op.setValueAtTime(0, 0); op.setValueAtTime(0.5, 100);
var s = comp.layers.addShape(); s.name = "Ponto";
writeLn("layers=" + comp.numLayers);
comp;
