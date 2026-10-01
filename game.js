'use strict';
(() => {
  const E=ForestGame,canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);
  let state=E.create(),last=0,keys=new Set(),touch=new Map(),sound=false,audio=null,messageUntil=0,celebrate=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function line(points,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.stroke();}
  function label(text,x,y,size,color='#3f6848'){ctx.font=`bold ${size}px "Yu Gothic", Meiryo, sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,x,y);}
  function leaf(x,y,s,rotation=0,color='#6e9c57'){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-s,0);ctx.quadraticCurveTo(0,-s,s,0);ctx.quadraticCurveTo(0,s,-s,0);ctx.fill();line([[-s*.6,0],[s*.6,0]],'#ffffff35',1);ctx.restore();}
  function flower(x,y,color='#fff8db',s=1){line([[x,y],[x-2,y+9*s]],'#87ab64',2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(x+Math.cos(a)*4*s,y+Math.sin(a)*4*s,3*s,3*s,color);}ellipse(x,y,2*s,2*s,'#e9bd5f');}
  function tree(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(8,12,40,13,'#769a5325');line([[0,0],[0,-48]],'#9b8054',13);line([[0,-22],[-19,-42]],'#9b8054',7);ellipse(-22,-49,27,30,'#769d58');ellipse(22,-50,27,33,'#7da65f');ellipse(0,-69,34,32,'#8caf68');ellipse(-8,-80,21,17,'#9cbb76');leaf(11,-48,9,-.5,'#b1c887');ctx.restore();}
  function mushroom(x,y,s=1){ellipse(x,y+5,4*s,8*s,'#fff4d7');ctx.fillStyle='#cb8060';ctx.beginPath();ctx.arc(x,y,10*s,Math.PI,0);ctx.fill();ellipse(x-4*s,y-3*s,2*s,2*s,'#ffeacc');ellipse(x+3*s,y-5*s,2*s,2*s,'#ffeacc');}
  // The entire illustrated woodland is drawn locally, without external assets.
  const scenery=document.createElement('canvas');scenery.width=960;scenery.height=600;
  function background(){
    ctx.fillStyle='#c7db9f';ctx.fillRect(0,0,960,600);
    ellipse(480,295,460,263,'#d1e2aa');ellipse(470,325,374,214,'#d7e5b2');
    ctx.strokeStyle='#e9e6bc';ctx.lineWidth=88;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-20,445);ctx.bezierCurveTo(140,330,302,388,407,282);ctx.bezierCurveTo(530,155,764,329,980,158);ctx.stroke();
    ctx.strokeStyle='#e3e4b7';ctx.lineWidth=48;ctx.beginPath();ctx.moveTo(398,292);ctx.bezierCurveTo(417,381,646,480,676,630);ctx.stroke();
    let seed=53;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<190;i++){let x=rand()*960,y=rand()*600;ellipse(x,y,rand()*2+1,1,rand()>.5?'#a3bd7d80':'#f4f2c080');if(i%4===0)line([[x-3,y],[x-5,y-4],[x,y],[x+3,y-5]],'#a6c17d',1.4);}
    [[15,110,1.5],[97,58,1.3],[209,48,1.1],[345,18,1.2],[537,34,1.5],[725,41,1.3],[870,78,1.5],[965,167,1.5],[-10,287,1.1],[38,600,1.4],[258,632,1.5],[546,650,1.6],[886,616,1.5],[955,470,1.3]].forEach(v=>tree(...v));
    [[255,202,1.1],[693,186,1.15]].forEach(v=>tree(...v));
    E.obstacles.slice(2).forEach((o,i)=>{ellipse(o.x+4,o.y+8,o.r+5,14,'#789c542b');ellipse(o.x,o.y-1,o.r,o.r*.64,['#a6b48b','#b1baa0','#a8b99a'][i]);ellipse(o.x-8,o.y-10,o.r*.6,o.r*.3,'#c0caae');leaf(o.x+19,o.y-14,11,-.4);});
    [[101,212],[140,170],[820,300],[736,517],[330,481],[583,114],[562,513],[55,338],[355,135],[862,370],[241,533],[847,112]].forEach(([x,y],i)=>{flower(x,y,i%3===0?'#e8b7a5':'#fff8de',1);flower(x+13,y+10,'#fff8de',.65);});
    mushroom(224,233);mushroom(237,239,.7);mushroom(720,213,.8);
    // A small welcoming wooden sign.
    line([[475,91],[475,127]],'#a88d5a',6);ctx.save();ctx.translate(475,79);ctx.rotate(-.06);ctx.fillStyle='#f1dfaa';ctx.fillRect(-55,-14,110,29);label('なかよしの森',0,5,12,'#9b8457');ctx.restore();
    scenery.getContext('2d').drawImage(canvas,0,0);
  }
  function animal(p,kind,t,moving=false){
    const monkey=kind==='monkey',bob=moving&&!reduced?Math.sin(t*15)*2.5:0;
    ctx.save();ctx.translate(p.x,p.y);ellipse(0,17,25,9,'#5b794a27');ctx.translate(0,bob);
    if(monkey){ctx.strokeStyle='#98643f';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(16,9);ctx.bezierCurveTo(47,13,39,-20,29,-6);ctx.stroke();}
    else{ctx.save();ctx.translate(22,9);ctx.rotate(-.5);ellipse(0,0,11,20,'#9a7952');ellipse(0,7,10,7,'#65503a');ctx.restore();}
    const stride=moving&&!reduced?Math.sin(t*15)*5:0;
    ellipse(-12,20+stride,7,8,monkey?'#98643f':'#69523e');ellipse(12,20-stride,7,8,monkey?'#98643f':'#69523e');
    ellipse(0,3,22,24,monkey?'#a77649':'#a88b60');ellipse(0,7,15,17,monkey?'#efcc93':'#e7d3a4');
    ellipse(-23,0-stride,7,10,monkey?'#a77649':'#a88b60');ellipse(23,0+stride,7,10,monkey?'#a77649':'#a88b60');
    ellipse(-23,-27,11,12,monkey?'#a77649':'#68503a');ellipse(23,-27,11,12,monkey?'#a77649':'#68503a');
    ellipse(-23,-27,6,7,monkey?'#e4b980':'#c3a77a');ellipse(23,-27,6,7,monkey?'#e4b980':'#c3a77a');
    ellipse(0,-24,28,25,monkey?'#a77649':'#ab8a5d');
    if(monkey){ellipse(-10,-26,13,15,'#f1d09a');ellipse(10,-26,13,15,'#f1d09a');ellipse(0,-15,19,13,'#f1d09a');line([[-13,-46],[-6,-50],[0,-46]],'#835534',3);}
    else{ellipse(0,-15,22,13,'#eee0b9');ctx.save();ctx.translate(-12,-25);ctx.rotate(.4);ellipse(0,0,13,10,'#604e3b');ctx.restore();ctx.save();ctx.translate(12,-25);ctx.rotate(-.4);ellipse(0,0,13,10,'#604e3b');ctx.restore();leaf(4,-51,16,-.4,'#5d964b');line([[-6,-49],[-10,-54]],'#547c3f',2);}
    if(state.status==='won'){line([[-14,-25],[-10,-28],[-6,-25]],'#3e3529',2);line([[6,-25],[10,-28],[14,-25]],'#3e3529',2);}else{ellipse(-10,-26,2.8,3.5,'#352f26');ellipse(10,-26,2.8,3.5,'#352f26');ellipse(-10.8,-27.3,.8,.9,'#fff');ellipse(9.2,-27.3,.8,.9,'#fff');}
    ellipse(0,-17,monkey?3:4,2.5,'#55402d');ctx.strokeStyle='#73533a';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(0,-14,6,.2,Math.PI-.2);ctx.stroke();ellipse(-17,-16,4,2,'#d8907777');ellipse(17,-16,4,2,'#d8907777');
    if(monkey){line([[-15,-2],[0,2],[15,-2]],'#d0805b',5);ctx.fillStyle='#d0805b';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(22,10);ctx.lineTo(11,12);ctx.fill();}
    ctx.restore();
    if(state.status!=='won'){ctx.fillStyle='#fffdf1e8';ctx.beginPath();ctx.roundRect(p.x-37,p.y+32,74,22,11);ctx.fill();label(monkey?'お猿さん':'あなた',p.x,p.y+47,10);}
  }
  function draw(t){
    ctx.drawImage(scenery,0,0);const running=state.status==='playing';
    const people=[{p:state.player,k:'tanuki'},{p:state.monkey,k:'monkey'}].sort((a,b)=>a.p.y-b.p.y);
    for(const a of people)animal(a.p,a.k,t,running&&(a.k==='monkey'||keys.size||touch.size));
    if(state.dash>0&&running){for(let i=0;i<4;i++)ellipse(state.player.x-28-i*8,state.player.y+10+i*2,5-i,3,'#fff9db99');}
    if(state.status==='won'&&!reduced){for(let i=0;i<35;i++){let x=(i*113+celebrate*24)%960,y=(i*67+celebrate*63)%600;ctx.save();ctx.translate(x,y);ctx.rotate(t+i);ctx.fillStyle=['#e9bb69','#f4f1cd','#8bab6c','#d9987c'][i%4];ctx.fillRect(-3,-3,6,9);ctx.restore();}}
  }
  function tone(freq,duration=.12,delay=0){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+delay;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.07,at+.01);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+duration+.02);}catch{sound=false;$('sound').textContent='♪ 音：オフ';$('sound').setAttribute('aria-pressed','false');}}
  function message(text){$('message').textContent=text;$('message').classList.add('visible');messageUntil=performance.now()+2500;}
  function clearInput(){keys.clear();touch.clear();document.querySelectorAll('.held').forEach(el=>el.classList.remove('held'));}
  function start(){state=E.create($('difficulty').value);state.status='playing';celebrate=0;clearInput();$('overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','ひとやすみ');$('dash').disabled=false;canvas.focus({preventScroll:true});message('まてまて〜！ お猿さんにタッチしよう');tone(440);tone(660,.15,.12);}
  function pause(){if(!['playing','paused'].includes(state.status))return;clearInput();if(state.status==='playing'){state.status='paused';$('overlay').hidden=false;$('overlay-label').textContent='のんびり、ひとやすみ。';$('overlay-title').innerHTML='ちょっと<br>休けいしよう';$('overlay-text').innerHTML='ふたりも、ひとやすみ中。<br>つづきは、いつでもどうぞ。';$('start').textContent='つづきを あそぶ →';$('start-note').textContent='Esc キーでも もどれるよ';$('pause').textContent='▷';$('pause').setAttribute('aria-label','つづきをあそぶ');$('dash').disabled=true;}else{state.status='playing';$('overlay').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','ひとやすみ');canvas.focus({preventScroll:true});}}
  function win(){clearInput();tone(523,.18);tone(659,.18,.15);tone(784,.25,.3);tone(1047,.4,.5);$('pause').disabled=true;$('dash').disabled=true;$('message').classList.remove('visible');$('overlay').hidden=false;$('overlay-label').textContent='タヌキさんの 勝ち！';$('overlay-title').innerHTML='つかまえた！<br>なかよし ハイタッチ';$('overlay-text').textContent=`${Math.floor(state.time)}秒で タッチできたよ。もう一回あそぼう！`;$('start').textContent='もういちど あそぶ →';$('start-note').textContent='あそんでくれて、ありがとう！';}
  function dash(){if(E.dash(state)){tone(540,.1);tone(820,.12,.06);}}
  const keyMap={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  window.addEventListener('keydown',e=>{if(e.target.matches('select,input,textarea'))return;if(e.key==='Escape'){e.preventDefault();if(!e.repeat)pause();return;}if(state.status!=='playing')return;if(keyMap[e.key]){e.preventDefault();keys.add(keyMap[e.key]);}if(e.code==='Space'&&e.target!==$('pause')&&e.target!==$('sound')){e.preventDefault();if(!e.repeat)dash();}});
  window.addEventListener('keyup',e=>{if(keyMap[e.key])keys.delete(keyMap[e.key]);});
  document.querySelectorAll('[data-direction]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(state.status!=='playing')return;b.setPointerCapture(e.pointerId);touch.set(e.pointerId,b.dataset.direction);b.classList.add('held');});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{touch.delete(e.pointerId);b.classList.remove('held');});});
  $('dash').addEventListener('click',dash);$('start').addEventListener('click',()=>state.status==='paused'?pause():start());$('pause').addEventListener('click',pause);$('restart').addEventListener('click',start);
  $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=`♪ 音：${sound?'オン':'オフ'}`;$('sound').setAttribute('aria-pressed',String(sound));tone(660);});
  window.addEventListener('blur',()=>{clearInput();if(state.status==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.status==='playing')pause();});
  background();
  function loop(now){const dt=Math.min((now-last)/1000,.04);last=now;const held=new Set([...keys,...touch.values()]);let before=state.status;E.step(state,{x:Number(held.has('right'))-Number(held.has('left')),y:Number(held.has('down'))-Number(held.has('up'))},dt);if(before==='playing'&&state.status==='won')win();if(state.status==='won')celebrate+=dt;draw(now/1000);$('timer').textContent=`${Math.floor(state.time/60)}:${String(Math.floor(state.time%60)).padStart(2,'0')}`;$('dash').disabled=state.status!=='playing'||state.cooldown>0;$('dash-label').textContent=state.cooldown>0?`あと ${state.cooldown.toFixed(1)} 秒でつかえるよ`:'スペースキーでも OK';if(now>messageUntil)$('message').classList.remove('visible');requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
})();
