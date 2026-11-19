/* ===== Pixel-art scroll hero (canvas, GSAP ScrollTrigger pinned 500vh). Edit WAYPOINTS below. ===== */
(() => {
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
document.documentElement.style.scrollBehavior = "auto";
/* ===== EDIT ME: tile coords (x,y), stand facing, pose, dialog, via = corner tiles ===== */
const START = {x:14, y:9};
const EASEL = {x:21, y:11};
const WAYPOINTS = [
  {id:"dogs",   x:7,  y:7,  face:"up",    pose:"pet",    text:"Zolo and July are playing!", via:[[7,9]]},
  {id:"garden", x:8,  y:11, face:"down",  pose:"water",  text:"Watering the garden.",       via:[[7,9],[8,9]]},
  {id:"door",   x:21, y:7,  face:"up",    pose:null,     text:"", via:[[8,9],[21,9]], spawn:{x:3,y:14}},
  {id:"laptop", x:6,  y:6,  face:"up",    pose:"type",   text:"Shipping pixels.",           via:[[3,6]]},
  {id:"easel",  x:20, y:11, face:"right", pose:"sketch", text:"Sketching something new...", via:[[6,11]]}
];
const TM = {intro:.5, speed:.22, hold:1.8, doorHold:.6, tail:1.4, cps:26};
const DOOR = {x:21, y:7}, MOBILE_TILES = 15;
/* ======================================================================================= */

const T = 16, CW = 30, CH = 17;
const $ = id => document.getElementById(id);
const hero = $("hero"), stage = $("shStage"), cv = $("shCanvas");
if(!hero || !stage || !cv) return;
const c = cv.getContext("2d");
const dlg = $("shDialog"), txt = $("shText"), fade = $("shFade"), dotsEl = $("shDots");
c.imageSmoothingEnabled = false;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const dotEls = WAYPOINTS.map(() => dotsEl.appendChild(document.createElement("i")));

/* ---------- string-grid tiles (8x8, drawn 2x => 16x16) ---------- */
const TILES = {
  G:{p:{a:"#7ccf7c",b:"#8fdc8f",c:"#62b868"},g:["aaaaaaaa","aabaaaaa","aaaaaaca","aaaaaaaa","abaaaaaa","aaaaabaa","acaaaaaa","aaaaaaaa"]},
  S:{p:{a:"#ead9a0",b:"#f3e6b8",c:"#d6c288"},g:["aaaaaaaa","aabaaaaa","aaaaaaca","aaaaaaaa","abaaaaaa","aaaaabaa","acaaaaaa","aaaaaaaa"]},
  P:{p:{a:"#a8774a",c:"#7a5230",k:"#5a3a20"},g:["aaaaaaak","aaaaaaak","cccccccc","kaaaaaaa","kaaaaaaa","cccccccc","aaaaaaak","aaaaaaak"]},
  F:{p:{a:"#c98f5a",c:"#a86f3e"},g:["aaaaaaac","aaaaaaac","cccccccc","acaaaaaa","acaaaaaa","cccccccc","aaaaaaac","aaaaaaac"]},
  W:{p:{a:"#e8dcc0",c:"#c8b894",k:"#7a6648"},g:["kkkkkkkk","aaaacaaa","aaaacaaa","kkkkkkkk","acaaaaaa","acaaaaaa","kkkkkkkk","aaaaaaca"]}
};
function grid(x2, g, pal, x, y, s, flip){
  g.forEach((row, j) => [...row].forEach((ch, i) => {
    const col = pal[ch]; if(!col) return;
    x2.fillStyle = col; x2.fillRect(x + (flip ? g[0].length-1-i : i)*s, y + j*s, s, s);
  }));
}
const R = (x2, col, x, y, w, h) => { x2.fillStyle = col; x2.fillRect(x, y, w, h); };
const blob = (x2, col, x, y, w, h) => { R(x2,col,x+2,y,w-4,h); R(x2,col,x,y+2,w,h-4); R(x2,col,x+1,y+1,w-2,h-2); };
const outBlob = (x2, col, x, y, w, h) => { blob(x2,"#141414",x-1,y-1,w+2,h+2); blob(x2,col,x,y,w,h); };

/* ---------- map ---------- */
const fill = f => Array.from({length:CH}, (_, y) => Array.from({length:CW}, (_, x) => f(x, y)));
const mapOut = fill(() => "G");
[[2,9,27,9],[7,7,7,9],[8,9,8,11],[21,7,21,9]].forEach(([x0,y0,x1,y1]) => { for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) mapOut[y][x]="S"; });
const mapIn = fill((x, y) => (y<3 || x===0 || x===CW-1 || (x===14 && y!==10 && y!==11)) ? "W" : "F");

/* ---------- static background (pre-rendered once) ---------- */
const mkc = () => { const k = document.createElement("canvas"); k.width = 480; k.height = 272; return k; };
const bgs = {out:mkc(), in:mkc()}, bo = bgs.out.getContext("2d"), bi = bgs.in.getContext("2d");
let b = bo;
function fence(x, y, n){ for(let i=0;i<n;i++){ const X=(x+i)*T; R(b,"#141414",X,y*T+4,T,8); R(b,"#d8c8a8",X,y*T+5,T,3); R(b,"#d8c8a8",X,y*T+9,T,2); R(b,"#141414",X+5,y*T+1,5,14); R(b,"#e8dcc0",X+6,y*T+2,3,12); } }
function can(x, y){ R(b,"#141414",x*T+3,y*T+7,10,7); R(b,"#8ea0b8",x*T+4,y*T+8,8,5); R(b,"#141414",x*T+11,y*T+4,5,3); R(b,"#8ea0b8",x*T+12,y*T+5,3,1); }
function desk(x, y){ R(b,"#141414",x*T-1,y*T+3,50,28); R(b,"#8a5a30",x*T,y*T+4,48,26); R(b,"#a8743f",x*T,y*T+4,48,4);
  R(b,"#141414",x*T+14,y*T+1,20,14); R(b,"#c8ccd8",x*T+15,y*T+2,18,12); R(b,"#303850",x*T+17,y*T+3,14,8); R(b,"#6ae0a0",x*T+19,y*T+5,6,1); R(b,"#6ae0a0",x*T+19,y*T+7,9,1); }
function chair(x, y){ R(b,"#141414",x*T+1,y*T+2,14,13); R(b,"#a03a3a",x*T+2,y*T+3,12,11); }
function shelf(x, y){ R(b,"#141414",x*T-1,y*T-1,34,18); R(b,"#6b4423",x*T,y*T,32,16); ["#d84a4a","#4a8ad8","#e0c040","#58b868","#d84a4a","#9a58c8","#e0c040","#4a8ad8"].forEach((col,i)=>R(b,col,x*T+2+i*4,y*T+2+(i%2),3,6)); R(b,"#2a1a0a",x*T,y*T+9,32,1); R(b,"#d8c8a8",x*T+4,y*T+11,8,4); R(b,"#58b868",x*T+20,y*T+10,6,5); }
function records(x, y){ R(b,"#141414",x*T,y*T+4,24,18); R(b,"#3a2a3a",x*T+1,y*T+5,22,16); R(b,"#141414",x*T+3,y*T+7,12,12); R(b,"#202030",x*T+4,y*T+8,10,10); R(b,"#d84a4a",x*T+7,y*T+11,4,4); R(b,"#c8ccd8",x*T+17,y*T+7,2,10); }
function easel(x, y){ R(b,"#141414",x*T,y*T-14,18,38); R(b,"#6b4423",x*T+1,y*T-13,2,36); R(b,"#6b4423",x*T+15,y*T-13,2,36); R(b,"#8a5a30",x*T+1,y*T+14,16,2); R(b,"#f4ecd8",x*T+2,y*T-12,14,16); }
function monstera(x, y){ R(b,"#141414",x*T+3,y*T+8,10,8); R(b,"#c0623a",x*T+4,y*T+9,8,6); [[0,0,8,6],[8,1,8,6],[3,-6,9,7],[-2,3,6,5],[10,-4,6,5]].forEach(l=>outBlob(b,"#2f8a4a",x*T+l[0],y*T+l[1]-2,l[2],l[3])); }
function lampIn(x, y){ R(b,"#141414",x*T+6,y*T-4,4,20); R(b,"#8a8a9a",x*T+7,y*T-3,2,18); R(b,"#141414",x*T+1,y*T-10,14,8); R(b,"#d8d0b0",x*T+2,y*T-9,12,6); }
function rug(x, y, w, h){ R(b,"#141414",x*T,y*T,w*T,h*T); R(b,"#b8403a",x*T+1,y*T+1,w*T-2,h*T-2); R(b,"#e8d8a8",x*T+4,y*T+4,w*T-8,h*T-8); R(b,"#b8403a",x*T+6,y*T+6,w*T-12,h*T-12); }

function pine(x, y){ const X=x*T, Y=y*T; R(b,"#141414",X+6,Y+14,4,8); R(b,"#7a5230",X+7,Y+14,2,7);
  [[4,-9,8,10],[2,-3,12,11],[0,3,16,13]].forEach(q => { outBlob(b,"#3f9a4e",X+q[0],Y+q[1],q[2],q[3]); blob(b,"#6cc070",X+q[0]+2,Y+q[1]+2,Math.max(4,Math.round(q[2]/3)),q[3]>>1); }); }
function bed(x, y, col){ const X=x*T, Y=y*T; R(b,"#141414",X,Y+2,T,T-2); R(b,"#8a5a30",X+1,Y+3,T-2,T-4);
  [4,11].forEach(fx => { R(b,"#2f9a4a",X+fx,Y+6,1,6); R(b,col,X+fx-1,Y+3,3,3); R(b,"#ffd84a",X+fx,Y+4,1,1); }); }
function doghouse(x, y){ const X=x*T, Y=y*T; R(b,"#141414",X+3,Y+1,26,9); R(b,"#c0392b",X+4,Y+2,24,7); R(b,"#141414",X,Y+9,32,22); R(b,"#c98f5a",X+1,Y+10,30,20); R(b,"#141414",X+10,Y+16,12,14); R(b,"#2a1a0a",X+11,Y+17,10,13); }
function house(x, y){ const X=x*T, Y=y*T, w=7*T;
  R(b,"#141414",X+w-26,Y-6,12,16); R(b,"#a8503a",X+w-25,Y-5,10,14);
  R(b,"#141414",X-2,Y+2,w+4,3*T-2); R(b,"#d9503f",X,Y+4,w,3*T-6);
  for(let i=0;i<5;i++) R(b,"#b83c30",X,Y+10+i*8,w,2);
  R(b,"#141414",X+2,Y+3*T,w-4,3*T); R(b,"#f4ecd8",X+4,Y+3*T+2,w-8,3*T-2); R(b,"#c8b894",X+4,Y+3*T+2,w-8,3);
  [X+14,X+80].forEach(wx => { R(b,"#141414",wx,Y+3*T+10,20,18); R(b,"#7fc6ff",wx+2,Y+3*T+12,16,14); R(b,"#ffffff",wx+9,Y+3*T+12,2,14); }); }
function buildOut(){ b = bo;
  mapOut.forEach((row,y) => row.forEach((k,x) => { const t=TILES[k]; grid(b,t.g,t.p,x*T,y*T,2); }));
  fence(3,2,8); fence(3,7,3); fence(8,7,3);
  [[3,2,6],[10,2,6]].forEach(v => { R(b,"#141414",v[0]*T+4,v[1]*T,8,v[2]*T); R(b,"#e8dcc0",v[0]*T+6,v[1]*T,4,v[2]*T); });
  doghouse(4,3);
  for(let x=4;x<=12;x++){ bed(x,12,["#ff5a7a","#ffd84a","#ff9a5a"][x%3]); bed(x,14,["#ffffff","#ff7aa8"][x%2]); }
  fence(3,15,10); can(13,11); house(18,2);
  R(b,"#141414",DOOR.x*T,DOOR.y*T,T,T); R(b,"#8a5a30",DOOR.x*T+2,DOOR.y*T+1,12,15); R(b,"#6b4423",DOOR.x*T+3,DOOR.y*T+2,4,13); R(b,"#6b4423",DOOR.x*T+9,DOOR.y*T+2,4,13); R(b,"#ffd84a",DOOR.x*T+11,DOOR.y*T+8,2,2);
  for(let y=0;y<CH;y++) for(let x=0;x<CW;x++) if(y===0||y===CH-1||x===0||x===CW-1||((x===1||x===CW-2||y===CH-2)&&(x+y)%2===0)) pine(x,y); }
function buildIn(){ b = bi;
  mapIn.forEach((row,y) => row.forEach((k,x) => { const t=TILES[k]; grid(b,t.g,t.p,x*T,y*T,2); }));
  R(b,"#141414",3*T,14*T,2*T,T); R(b,"#8a6a4a",3*T+2,14*T+2,2*T-4,T-4);
  rug(3,9,4,3); rug(18,9,4,3);
  shelf(2,1); shelf(17,1); shelf(22,1); desk(5,4); chair(6,6); records(10,3); lampIn(12,4); monstera(12,12);
  easel(EASEL.x,EASEL.y); lampIn(24,11); monstera(27,13); }
buildOut(); buildIn();

/* ---------- player: 16x24 procedural sprite (4 dirs, 3-frame walk, 4 poses) ---------- */
function player(x2, px, py, dir, fr, pose, now){
  const K="#141414",S="#f2b88a",H="#4a2c1a",B="#3a6fe0",B2="#2a52b0",Pn="#2a2a44",side=dir==="left"||dir==="right";
  x2.save(); if(dir==="right"){ x2.translate(px*2+16,0); x2.scale(-1,1); }
  let bob = pose==="pet"?1:0, y = py-8;
  const f=(col,x,yy,w,h)=>R(x2,col,px+x,y+yy+bob,w,h), wig=Math.sin(now*9);
  // legs (hidden when seated)
  if(pose!=="type"){ const l=fr===1?-1:0, r=fr===2?-1:0;
    f(K,3,18,10,6); f(Pn,4,18,3,4+l+1); f(Pn,9,18,3,4+r+1); f(K,3,22+l,5,2); f(K,8,22+r,5,2); }
  // torso
  f(K,2,12,12,8); f(B,3,13,10,6); f(B2,3,17,10,2); f(Pn,3,19,10,1);
  if(!side){ f(K,1,13,2,6); f(B,2,13,1,4); f(S,1,17,2,2); f(K,13,13,2,6); f(B,13,13,1,4); f(S,13,17,2,2); }
  else { f(K,5,13,6,6); f(B,6,14,4,4); f(S,6,18,3,2); }
  // head
  f(K,2,0,12,13); f(S,4,6,8,6);
  if(dir==="down"){ f(H,3,1,10,5); f(H,2,3,2,4); f(H,12,3,2,4); f(H,4,0,3,1); f(H,8,0,4,1); f(K,5,7,1,2); f(K,10,7,1,2); f(H,4,9,8,3); f(H,5,8,6,1); f(S,7,10,2,1); }
  else if(dir==="up"){ f(H,3,1,10,10); f(H,2,3,2,6); f(H,12,3,2,6); f(H,4,0,3,1); f(H,8,0,4,1); f(S,5,11,6,1); }
  else { f(H,3,1,10,5); f(H,9,3,5,8); f(H,4,0,3,1); f(H,8,0,4,1); f(K,4,7,1,2); f(H,3,9,6,3); f(S,3,6,1,3); }
  // poses
  if(pose==="pet"){ const h=Math.round(wig); f(K,0,6+h,4,7); f(S,1,7+h,2,3); f(B,1,10+h,2,3); f(K,12,6-h,4,7); f(S,13,7-h,2,3); f(B,13,10-h,2,3); }
  if(pose==="water"){ f(S,11,16,3,2); f(K,11,17,8,6); f("#8ea0b8",12,18,6,4); f("#8ea0b8",16,16,3,3);
    const d=(now*14)%5; R(x2,"#6ac0ff",px+19,y+21+d+bob,1,2); R(x2,"#6ac0ff",px+17,y+23+((d+2)%5)+bob,1,2); }
  if(pose==="type"){ f(K,2,15,12,4); f(S,3,15,2,2+Math.round(wig)); f(S,11,15,2,2-Math.round(wig)); f(K,3,19,10,2); }
  if(pose==="sketch"){ f(K,-4,13,8,5); f(B,-3,14,6,3); f(S,-5,14,3,2); f("#e0c040",-8,13+Math.round(wig),4,1); f(K,12,13,2,6); }
  x2.restore();
}

/* ---------- animated bits ---------- */
function dogs(x2, now, near){
  const hop = near ? Math.abs(Math.sin(now*8)) * 2 : 0, wag = Math.round(Math.sin(now*14));
  const dog = (x,y,c1,c2,h) => { y -= h; R(x2,"#141414",x-1,y+4,15,11); R(x2,c1,x,y+5,13,8); R(x2,"#141414",x+9,y,8,8); R(x2,c1,x+10,y+1,6,6); R(x2,c2,x+9,y,2,4); R(x2,"#141414",x+14,y+3,1,2); R(x2,"#141414",x-3,y+5+wag,3,3); R(x2,c2,x-2,y+6+wag,2,1); R(x2,c2,x+2,y+13,3,2); R(x2,c2,x+8,y+13,3,2); };
  dog(6*T+6, 5*T+8, "#b07a45", "#7a4a25", hop); dog(8*T, 6*T-2, "#f0e8d8", "#c8b898", near ? hop*0.7 : 0);
}
const SK = ["bbbbbbbbbb","bbbbbyybbb","bbbbbyybbb","bbbbbbbbbb","bbbbbbbbbb","bbggbbbbgb","bggggbbggg","gggggggggg","gdddggdddg","dddddddddd","dddddddddd","dddddddddd"];
const SKP = {b:"#8ec5ff",y:"#ffd84a",g:"#58b868",d:"#2d6a3e"};
function sketch(x2, prog){ const ex=EASEL.x*T+4, ey=EASEL.y*T-10, rows=Math.floor((.4+.6*prog)*SK.length);
  SK.forEach((row,j)=>[...row].forEach((ch,i)=>{ if(j<rows) R(x2,SKP[ch],ex+i,ey+j,1,1); else if(ch!=="b") R(x2,"#9a9a9a",ex+i,ey+j,1,1); })); }


/* ---------- extra details (static, drawn once) + small animations ---------- */
let seed = 7; const rn = () => (seed = (seed*9301+49297) % 233280) / 233280;
function detailsOut(){
  for(let i=0;i<70;i++){ const x=2+Math.floor(rn()*26), y=2+Math.floor(rn()*13), k=rn();
    if(mapOut[y][x]!=="G" || (x>=3&&x<=10&&y>=2&&y<=7) || (x>=3&&x<=13&&y>=11) || (x>=17&&x<=25&&y<=8)) continue;
    const X=x*T+Math.floor(rn()*8), Y=y*T+Math.floor(rn()*8);
    if(k<.6){ R(b,"#4fa85a",X,Y+2,1,2); R(b,"#4fa85a",X+2,Y,1,4); R(b,"#4fa85a",X+4,Y+2,1,2); }
    else { R(b,k<.8?"#ffffff":"#ff9ac0",X,Y,3,3); R(b,"#ffd84a",X+1,Y+1,1,1); R(b,"#2f9a4a",X+1,Y+3,1,2); } }
  [19,23].forEach(x => { outBlob(b,"#3f9a4e",x*T,7*T+4,16,12); blob(b,"#6cc070",x*T+3,7*T+6,5,4); });
  let X=24*T, Y=8*T; R(b,"#141414",X+6,Y+6,4,10); R(b,"#7a5230",X+7,Y+7,2,9); R(b,"#141414",X+1,Y,14,8); R(b,"#d9503f",X+2,Y+1,12,6); R(b,"#ffd84a",X+12,Y-3,2,4);
  X=8*T; Y=3*T; R(b,"#141414",X+2,Y+8,12,6); R(b,"#d84a4a",X+3,Y+9,10,4); R(b,"#c8ccd8",X+5,Y+10,6,2);
}
function detailsIn(){
  const X=8*T; R(b,"#141414",X,4,32,34); R(b,"#7fc6ff",X+2,6,28,30); R(b,"#ffffff",X+15,6,2,30); R(b,"#ffffff",X+2,20,28,2);
  outBlob(b,"#f4ecd8",12*T+1,T,14,14);
  R(b,"#141414",20*T+1,6,14,18); R(b,"#c8a060",20*T+2,7,12,16); R(b,"#8ec5ff",20*T+4,9,8,6); R(b,"#58b868",20*T+4,15,8,5);
}
b = bo; detailsOut(); b = bi; detailsIn();
function smoke(x2, now){ for(let i=0;i<3;i++){ const p=(now*.4+i/3)%1; x2.globalAlpha=(1-p)*.75; const z=3+Math.round(p*4); R(x2,"#ffffff",380+Math.round(Math.sin(p*6+i)*3)-(z>>1),24-Math.round(p*20),z,z); } x2.globalAlpha=1; }
function butterflies(x2, now){ ["#ff7aa8","#ffd84a","#8ec5ff"].forEach((col,i) => {
  const x=Math.round((5+i*3)*T+Math.sin(now*.8+i*2)*22), y=Math.round((12.4+(i%2)*1.6)*T+Math.cos(now*1.1+i)*9-6), f=Math.sin(now*18+i*3)>0?1:0;
  R(x2,col,x-2,y-f,2,2); R(x2,col,x+1,y-f,2,2); R(x2,"#141414",x,y,1,2); }); }
function indoorAnim(x2, now){
  x2.save(); x2.beginPath(); x2.rect(8*T+2,6,28,30); x2.clip(); const cx0=8*T+((now*3)%44)-12; R(x2,"#ffffff",cx0,10,10,3); R(x2,"#ffffff",cx0+2,8,6,2); x2.restore();
  const a=now*1.2, kx=12*T+8, ky=T+8; for(let k=1;k<=5;k++) R(x2,"#141414",kx+Math.round(Math.cos(a)*k),ky+Math.round(Math.sin(a)*k),1,1);
  if(Math.sin(now*6)>0) R(x2,"#6ae0a0",5*T+29,4*T+7,2,1);
  const br=Math.sin(now*2)>0?1:0, CX=4*T+1, CY=10*T+6-br;
  outBlob(x2,"#e8a060",CX,CY,14,8+br); R(x2,"#141414",CX+1,CY-3,3,3); R(x2,"#141414",CX+9,CY-3,3,3); R(x2,"#e8a060",CX+2,CY-2,1,2); R(x2,"#e8a060",CX+10,CY-2,1,2);
  R(x2,"#c07830",CX+5,CY+1,1,6); R(x2,"#c07830",CX+8,CY+1,1,6);
  const p=(now%3)/3; x2.globalAlpha=1-p; const zx=CX+14, zy=CY-6-Math.round(p*10); R(x2,"#ffffff",zx,zy,3,1); R(x2,"#ffffff",zx+1,zy+1,1,1); R(x2,"#ffffff",zx,zy+2,3,1); x2.globalAlpha=1;
}

/* ---------- timeline model: built from WAYPOINTS, evaluated purely from time ---------- */
const ev = []; let t = TM.intro, cur = {x:START.x, y:START.y}, dist = 0, sc = "out";
WAYPOINTS.forEach((w, i) => {
  [...w.via, [w.x, w.y]].forEach(q => {
    const d = Math.abs(q[0]-cur.x) + Math.abs(q[1]-cur.y); if(!d) return;
    const dir = q[0] > cur.x ? "right" : q[0] < cur.x ? "left" : q[1] > cur.y ? "down" : "up";
    ev.push({k:"move", t0:t, t1:t+d*TM.speed, a:{...cur}, b:{x:q[0], y:q[1]}, dir, d0:dist, i, sc}); t += d*TM.speed; dist += d; cur = {x:q[0], y:q[1]};
  });
  const hl = w.id === "door" ? TM.doorHold : TM.hold;
  ev.push({k:"hold", t0:t, t1:t+hl, w, i, sc}); t += hl; if(w.spawn){ cur = {...w.spawn}; sc = "in"; }
});
const TOTAL = t * 1.25; // last 20% of the scroll (= 100vh of the 500% pin) is the next section sliding over
const easelHold = ev.find(e => e.k==="hold" && e.w.id==="easel");

function state(T){
  let e = ev.find(v => T < v.t1) || ev[ev.length-1];
  if(T < TM.intro) return {x:START.x, y:START.y, dir:"down", fr:0, pose:null, i:-1, hold:null, sc:"out"};
  if(e.k === "move"){
    const u = Math.min(1, (T-e.t0)/(e.t1-e.t0)), dd = e.d0 + u*(Math.abs(e.b.x-e.a.x)+Math.abs(e.b.y-e.a.y));
    return {x:e.a.x+(e.b.x-e.a.x)*u, y:e.a.y+(e.b.y-e.a.y)*u, dir:e.dir, fr:[0,1,0,2][Math.floor(dd*2)%4], pose:null, i:e.i-0.5, hold:null, sc:e.sc};
  }
  const late = e.w.spawn && T > (e.t0+e.t1)/2;
  return {x:late?e.w.spawn.x:e.w.x, y:late?e.w.spawn.y:e.w.y, dir:e.w.face, fr:0, pose:e.w.pose, i:e.i, hold:e, sc:late?"in":e.sc};
}

/* ---------- render ---------- */
let VW, VH, W, H, mobile;
function measure(){
  VW = hero.clientWidth; VH = hero.clientHeight; mobile = innerWidth <= 767;
  W = mobile ? VW * CW / MOBILE_TILES : Math.min(VW, VH*16/9); H = W*9/16;
  stage.style.width = W+"px"; stage.style.height = H+"px";
  stage.style.setProperty("--u", (W/CW)+"px");
}
let lastDot = -2, lastTxt = "";
function draw(tm){
  const s = state(tm), now = performance.now()/1000, ins = s.sc === "in", eh = easelHold;
  c.drawImage(ins ? bgs.in : bgs.out, 0, 0);
  if(!ins){ butterflies(c, now); dogs(c, now, s.i === 0 || Math.abs(s.x-7)+Math.abs(s.y-7) < 4); smoke(c, now); }
  else { indoorAnim(c, now); sketch(c, eh ? Math.max(0, Math.min(1, (tm-eh.t0)/(TM.hold*.9))) : 0); }
  player(c, Math.round(s.x*T), Math.round(s.y*T), s.dir, s.fr, s.pose, now);
  if(ins){ const lit = eh ? Math.max(0, Math.min(1, (tm-eh.t0)/.6)) : 0, gx = 24*T+8, gy = 11*T-6, g = c.createRadialGradient(gx,gy,2,gx,gy,70);
    g.addColorStop(0,`rgba(255,226,140,${(.5*lit).toFixed(2)})`); g.addColorStop(1,"rgba(255,226,140,0)"); c.fillStyle = g; c.fillRect(0,0,CW*T,CH*T); }
  let tx = (VW-W)/2, ty = (VH-H)/2;
  if(mobile){ const cx = (s.x+.5)/CW*W, cy = (s.y+.5)/CH*H;
    tx = Math.min(0, Math.max(VW-W, VW/2-cx)); ty = H <= VH ? (VH-H)/2 : Math.min(0, Math.max(VH-H, VH/2-cy)); }
  stage.style.transform = `translate(${tx}px,${ty}px)`;
  const dh = ev.find(v => v.k==="hold" && v.w.id==="door");
  fade.style.opacity = dh && tm>dh.t0 && tm<dh.t1 ? Math.sin(Math.PI*(tm-dh.t0)/(dh.t1-dh.t0)).toFixed(2) : 0;
  const full = s.hold ? s.hold.w.text : "", n = s.hold ? Math.floor((tm-s.hold.t0)*TM.cps) : 0, shown = full.slice(0, n);
  if(shown !== lastTxt){ txt.textContent = shown; lastTxt = shown; dlg.classList.toggle("on", !!shown); }
  const di = Math.floor(s.i + .5); if(di !== lastDot){ dotEls.forEach((d,k) => d.classList.toggle("on", k <= di)); lastDot = di; }
}

/* ---------- boot ---------- */
measure();
if(reduced){
  // static fallback: no pin, final scene shown with last caption
  hero.classList.add("is-static"); draw(TOTAL); txt.textContent = WAYPOINTS[WAYPOINTS.length-1].text; dlg.classList.add("on");
  dotEls.forEach(d => d.classList.add("on")); fade.style.opacity = 0;
  addEventListener("resize", () => { measure(); draw(TOTAL); });
  return;
}
/* ---------- intro greeting: small bubble above the character, once, a few seconds after the loader ---------- */
(() => {
  const hello = $("shHello"), typed = $("shHelloText"), ghost = $("shHelloGhost");
  if(!hello || !typed || !ghost) return;
  const MSG = "Holaa, I'm Ravish Shetty!", HOLD_MS = 3500, CHAR_MS = 45;
  ghost.textContent = MSG;                                    // reserves the final size so the bubble doesn't jitter while typing
  hello.style.left = ((START.x*T + 8) / (CW*T) * 100) + "%";  // centred over the character's head
  hello.style.top  = ((START.y*T - 12) / (CH*T) * 100) + "%";
  let timer = 0, done = false;
  const hide = () => { done = true; clearInterval(timer); hello.classList.remove("on"); };
  const show = () => {
    if(done || scrollY > 30) return;                          // reloaded mid-page / already scrolling: skip
    hello.classList.add("on");
    let n = 0;
    timer = setInterval(() => {
      typed.textContent = MSG.slice(0, ++n);
      if(n >= MSG.length){ clearInterval(timer); setTimeout(hide, HOLD_MS); }
    }, CHAR_MS);
  };
  addEventListener("scroll", () => { if(scrollY > 30) hide(); }, {passive:true});
  const waitForLoader = (tries = 0) => {
    const l = $("loader");
    const gone = !l || l.style.pointerEvents === "none" || parseFloat(getComputedStyle(l).opacity) < .05;
    if(gone || tries > 40) setTimeout(show, 350); else setTimeout(() => waitForLoader(tries + 1), 100);
  };
  waitForLoader();
})();
const tl = gsap.timeline({paused:true, defaults:{ease:"none"}});
tl.to("#shHeadline", {opacity:0, y:-20, duration:TM.intro}, 0);
tl.to({}, {duration:TOTAL}, 0);
/* the real next section overlaps the last viewport of the pin and slides up over the hero (curved top edge) */
const aboutEl = document.getElementById("about-story");
if(aboutEl){
  const col = getComputedStyle(aboutEl).backgroundColor, cw = document.createElement("div");
  cw.style.cssText = "--ch:clamp(30px,6vw,90px);position:relative;z-index:21;height:0;pointer-events:none";
  const syncOverlap = () => { cw.style.marginTop = (-hero.offsetHeight) + "px"; };
  syncOverlap();
  ScrollTrigger.addEventListener("refreshInit", syncOverlap);
  cw.innerHTML = `<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;bottom:-1px;width:100%;height:var(--ch);display:block"><path d="M0 0 Q50 10 100 0 V10 H0Z" fill="${col}"/></svg>`;
  aboutEl.parentNode.insertBefore(cw, aboutEl);
  aboutEl.style.position = "relative"; aboutEl.style.zIndex = 20;
}
/* next section's content drifts up as it arrives (notes lag more, like the reference) */
if(aboutEl){
  const rev = (sel, y) => { const el = aboutEl.querySelector(sel); if(!el) return;
    gsap.fromTo(el, {y, opacity:0}, {y:0, opacity:1, ease:"none", onComplete:() => gsap.set(el, {clearProps:"transform"}),
      scrollTrigger:{trigger:aboutEl, start:"top 90%", end:"top 25%", scrub:true}}); };
  rev(".story-text-col", 70); rev(".story-notes-col", 160);
}
ScrollTrigger.create({ trigger:hero, start:"top top", end:"+=500%", pin:true, scrub:1, animation:tl, invalidateOnRefresh:true, anticipatePin:1, refreshPriority:1 });
addEventListener("load", () => ScrollTrigger.refresh());
ScrollTrigger.addEventListener("refreshInit", measure);
gsap.ticker.add(() => draw(tl.time()));   // redraws every frame so the dogs animate
})();