(function(root){
  'use strict';
  const W=960,H=600,R=22;
  const obstacles=[{x:255,y:202,r:37},{x:693,y:186,r:39},{x:465,y:425,r:33},{x:160,y:442,r:29},{x:793,y:423,r:32}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));
  function create(level='normal') {return {level,status:'ready',time:0,player:{x:300,y:330},monkey:{x:645,y:320},cooldown:0,dash:0,heading:0,think:0,caught:false};}
  function valid(x,y){return x>=45&&x<=W-45&&y>=60&&y<=H-40&&obstacles.every(o=>Math.hypot(x-o.x,y-o.y)>=o.r+R);}
  function move(p,dx,dy){if(valid(p.x+dx,p.y+dy)){p.x+=dx;p.y+=dy;return;}if(valid(p.x+dx,p.y))p.x+=dx;if(valid(p.x,p.y+dy))p.y+=dy;}
  function dash(s){if(s.status==='playing'&&s.cooldown<=0){s.dash=.65;s.cooldown=3;return true;}return false;}
  function step(s,input,dt){
    if(s.status!=='playing')return;
    dt=clamp(dt,0,.04);s.time+=dt;s.cooldown=Math.max(0,s.cooldown-dt);s.dash=Math.max(0,s.dash-dt);
    let x=input.x||0,y=input.y||0,n=Math.hypot(x,y);let speed=s.dash>0?310:175;
    if(n)move(s.player,x/n*speed*dt,y/n*speed*dt);
    if(Math.hypot(s.player.x-s.monkey.x,s.player.y-s.monkey.y)<43){s.status='won';s.caught=true;return;}
    s.think-=dt;
    if(s.think<=0){
      s.think=.13;let best=-Infinity;
      for(let i=0;i<32;i++){
        let a=i*Math.PI/16,tx=s.monkey.x+Math.cos(a)*65,ty=s.monkey.y+Math.sin(a)*65;
        if(!valid(tx,ty)||!valid(s.monkey.x+Math.cos(a)*25,s.monkey.y+Math.sin(a)*25))continue;
        let score=Math.hypot(tx-s.player.x,ty-s.player.y)+Math.cos(a-s.heading)*13;
        score+=Math.min(tx-45,W-45-tx,ty-60,H-40-ty)*.13;
        if(score>best){best=score;s.nextHeading=a;}
      }
      if(best>-Infinity)s.heading=s.nextHeading;
    }
    const resting=s.time%7>5.9;
    let monkeySpeed=resting?34:({easy:92,normal:133,fast:159}[s.level]||133);
    move(s.monkey,Math.cos(s.heading)*monkeySpeed*dt,Math.sin(s.heading)*monkeySpeed*dt);
    if(Math.hypot(s.player.x-s.monkey.x,s.player.y-s.monkey.y)<43){s.status='won';s.caught=true;}
  }
  const api={W,H,R,obstacles,create,valid,move,dash,step};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
