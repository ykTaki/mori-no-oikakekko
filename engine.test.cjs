const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('./engine.js');
function playing(level){const s=E.create(level);s.status='playing';return s;}
test('only touching the monkey wins',()=>{const s=playing();E.step(s,{},.02);assert.equal(s.status,'playing');s.player={...s.monkey};E.step(s,{},.02);assert.equal(s.status,'won');assert.equal(s.caught,true);});
test('diagonal movement has the same speed',()=>{const a=playing(),b=playing();E.step(a,{x:1},.02);E.step(b,{x:1,y:1},.02);assert.ok(Math.abs(Math.hypot(a.player.x-300,a.player.y-330)-Math.hypot(b.player.x-300,b.player.y-330))<1e-8);});
test('dash speeds up, cannot stack, and recharges',()=>{const s=playing();assert.equal(E.dash(s),true);assert.equal(E.dash(s),false);E.step(s,{x:1},.02);assert.ok(s.player.x>303.5);for(let i=0;i<160;i++)E.step(s,{},.02);assert.equal(s.cooldown,0);assert.equal(E.dash(s),true);});
test('world boundaries and trees block movement',()=>{let p={x:45,y:100};E.move(p,-10,0);assert.equal(p.x,45);p={x:255-37-22,y:202};E.move(p,10,0);assert.equal(p.x,196);});
test('paused and won games do not advance',()=>{for(const status of ['ready','paused','won']){const s=E.create();s.status=status;const before=JSON.stringify(s);E.step(s,{x:1,y:1},.04);assert.equal(JSON.stringify(s),before);assert.equal(E.dash(s),false);}});
test('monkey remains in valid space during a long chase',()=>{for(const level of ['easy','normal','fast']){const s=playing(level);for(let i=0;i<15000;i++){E.step(s,{},1/60);assert.ok(E.valid(s.monkey.x,s.monkey.y));}assert.equal(s.status,'playing');}});
test('new rounds reset timer, cooldown and winner',()=>{const s=E.create('easy');assert.equal(s.time,0);assert.equal(s.cooldown,0);assert.equal(s.caught,false);assert.equal(s.level,'easy');});
