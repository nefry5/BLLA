import{useState,useEffect,useRef,useCallback,useMemo}from"react";
let _ac=null;const AC=()=>{try{if(!_ac)_ac=new AudioContext();}catch{}return _ac;};
function tn(f,tp,d,v=0.13,dl=0){const a=AC();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=tp;o.frequency.value=f;const t=a.currentTime+dl;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.05);}
const SFX={flip:()=>{tn(480,"sine",.06,.08);tn(640,"sine",.06,.07,.05)},ok:()=>{[523,659,784].forEach((f,i)=>tn(f,"sine",.12,.14,i*.08))},wrong:()=>{tn(280,"sawtooth",.07,.12);tn(200,"sawtooth",.09,.09,.09)},perfect:()=>{[523,659,784,1047,1319].forEach((f,i)=>tn(f,"sine",.18,.17,i*.07))},rankup:()=>{[440,554,659,880,1100].forEach((f,i)=>tn(f,"sine",.22,.24,i*.07))},quest:()=>{[523,784,1047].forEach((f,i)=>tn(f,"sine",.1,.16,i*.08))},loot:()=>{[330,440,554,659,880].forEach((f,i)=>tn(f,"triangle",.18,.18,i*.09))},rTick:(s)=>tn(200+s*500,"square",.02,.05),rWin:()=>{[523,784,1047,1319].forEach((f,i)=>tn(f,"sine",.25,.22,i*.08))},milestone:()=>{[440,554,659,880].forEach((f,i)=>tn(f,"sine",.15,.19,i*.08))},platinum:()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>tn(f,"sine",.2,.22,i*.07))},nav:()=>tn(440,"sine",.05,.07),focus:()=>{tn(220,"sine",.18,.13);tn(330,"triangle",.18,.09,.1)},
lootC:()=>tn(523,"sine",.1,.13),
lootR:()=>{[523,659].forEach((f,i)=>tn(f,"sine",.15,.14,i*.07))},
lootSR:()=>{[523,659,784].forEach((f,i)=>tn(f,"sine",.2,.16,i*.06))},
lootE:()=>{[440,554,659,880].forEach((f,i)=>tn(f,"sine",.24,.2,i*.07))},
lootL:()=>{[523,659,784,1047,1319].forEach((f,i)=>tn(f,"sine",.3,.24,i*.07))},
lootS:()=>{[261,330,523,784,1047].forEach((f,i)=>tn(f,"triangle",.38,.3,i*.09));tn(220,"sawtooth",.2,.12,.45)}
};
const getScore=r=>r==null?null:r/10,updateRaw=(r,ok)=>Math.max(0,Math.min(100,(r??0)+(ok?10:-20))),noteCol=s=>s==null?"#444":s<4?"#e74c3c":s<7?"#f39c12":"#27ae60",xpGain=s=>10+Math.floor(Math.min(s,1000)/2),genUUID=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:(r&0x3|0x8)).toString(16);});
const BASE_RANKS={wood:{col:"#c87941",glow:"#d4924d",sf:"#8B5A2B",si:"#5a2e0a",ss:"#D4A060",wings:false},bronze:{col:"#cd7f32",glow:"#e89040",sf:"#CD7F32",si:"#8B5A20",ss:"#E8B060",wings:false},silver:{col:"#a0b8c8",glow:"#c0d8e8",sf:"#8898A8",si:"#4A6070",ss:"#D0E0F0",wings:false},gold:{col:"#ffd700",glow:"#ffe44d",sf:"#FFD700",si:"#2266AA",ss:"#FFF44D",wings:true},diamond:{col:"#4fc3f7",glow:"#88ddff",sf:"#1144AA",si:"#0A2288",ss:"#66BBFF",wings:true},plat:{col:"#ce93d8",glow:"#e0b0ff",sf:"#7722CC",si:"#5511AA",ss:"#DDB0FF",wings:true},solar:{col:"#ff9800",glow:"#ffcc44",sf:"#FF6600",si:"#AA2200",ss:"#FFE044",wings:true}};
const _rl=(bid,sub,l,cumXP,xpCap)=>({...BASE_RANKS[bid],id:sub===0?bid:bid+sub,baseId:bid,sub,l,cumXP,xpCap,nStars:sub===0?5:sub});
const RANK_LEVELS=[_rl("wood",1,"Bois I",0,100),_rl("wood",2,"Bois II",100,200),_rl("wood",3,"Bois III",300,300),_rl("bronze",1,"Bronze I",600,400),_rl("bronze",2,"Bronze II",1000,500),_rl("bronze",3,"Bronze III",1500,800),_rl("silver",1,"Argent I",2300,900),_rl("silver",2,"Argent II",3200,1000),_rl("silver",3,"Argent III",4200,1200),_rl("gold",1,"Or I",5400,1400),_rl("gold",2,"Or II",6800,1600),_rl("gold",3,"Or III",8400,2000),_rl("diamond",1,"Diamant I",10400,2500),_rl("diamond",2,"Diamant II",12900,3000),_rl("diamond",3,"Diamant III",15900,5000),_rl("plat",1,"Platine I",20900,10000),_rl("plat",2,"Platine II",30900,15000),_rl("plat",3,"Platine III",45900,25000),_rl("solar",0,"Solaire",70900,Infinity)];
const RANK_REWARDS={1:{coins:50},2:{coins:75},3:{coins:100},4:{coins:150},5:{coins:200},6:{coins:250},7:{coins:300},8:{coins:350},9:{coins:500},10:{coins:600},11:{coins:700},12:{coins:1000},13:{coins:1200},14:{coins:1500},15:{coins:2000},16:{coins:2500},17:{coins:3000},18:{coins:5000}};
const CAT_UNLOCK=[0,0,1,1,2,2,3,3,4,5,5,6];
function getRankInfo(xp){let li=0;for(let i=RANK_LEVELS.length-1;i>=0;i--){if(xp>=RANK_LEVELS[i].cumXP){li=i;break;}}const lv=RANK_LEVELS[li];const xIn=xp-lv.cumXP;const xNeed=lv.xpCap;const isMax=li===RANK_LEVELS.length-1;const pct=isMax?100:Math.min(100,Math.round(xIn/xNeed*100));const rank=lv;const nextRank=!isMax?RANK_LEVELS[li+1]:null;const baseIds=["wood","bronze","silver","gold","diamond","plat","solar"];const rankIdx=baseIds.indexOf(lv.baseId);return{rank,lv,levelIdx:li,rankIdx,xIn,xNeed,isMax,pct,nextRank};}
const RARITY={commun:{l:"Commun",col:"#9e9e9e"},rare:{l:"Rare",col:"#4caf50"},super_rare:{l:"Super Rare",col:"#2196f3"},epique:{l:"Épique",col:"#9c27b0"},legendaire:{l:"Légendaire",col:"#ff9800"},secret:{l:"Secret",col:"#ff2222"}};
const THEMES={default:{bg:"#050510",surf:"#0d1117",card:"#1a1f3a",acc:"#4ecdc4",txt:"#fff",sub:"#777",brd:"rgba(255,255,255,.07)",label:"Espace Sombre",rarity:"commun",free:true},zen:{bg:"#020e05",surf:"#041508",card:"#0a2210",acc:"#52e07c",txt:"#e8ffe0",sub:"#6b9",brd:"rgba(82,224,124,.1)",label:"Forêt Zen",rarity:"commun"},arctic:{bg:"#000d1a",surf:"#001a2e",card:"#002244",acc:"#88ddff",txt:"#e0f4ff",sub:"#7bb",brd:"rgba(136,221,255,.1)",label:"Arctic Frost",rarity:"commun"},sakura:{bg:"#120009",surf:"#1e000f",card:"#2e0018",acc:"#ff80ab",txt:"#ffe0f0",sub:"#d9a",brd:"rgba(255,128,171,.1)",label:"Sakura Nuit",rarity:"commun"},desert:{bg:"#140a00",surf:"#1e1200",card:"#2a1800",acc:"#d4a050",txt:"#f5e0b0",sub:"#a85",brd:"rgba(212,160,80,.12)",label:"Désert Antique",rarity:"commun"},abyss:{bg:"#000a12",surf:"#001525",card:"#002035",acc:"#00bcd4",txt:"#e0f7fa",sub:"#5bc",brd:"rgba(0,188,212,.1)",label:"Océan Abyssal",rarity:"rare"},pixel:{bg:"#000511",surf:"#000a1e",card:"#001133",acc:"#ff4466",txt:"#ddeeff",sub:"#8ac",brd:"rgba(255,68,102,.12)",label:"Pixel Rétro",rarity:"rare"},jungle:{bg:"#020810",surf:"#040f18",card:"#061a20",acc:"#39ff14",txt:"#e0ffe0",sub:"#5a8",brd:"rgba(57,255,20,.1)",label:"Jungle Néon",rarity:"rare"},volcano:{bg:"#0d0000",surf:"#1a0000",card:"#250500",acc:"#ff4400",txt:"#ffe0d0",sub:"#c76",brd:"rgba(255,68,0,.12)",label:"Volcan",rarity:"rare"},steam:{bg:"#100c08",surf:"#1a1408",card:"#261c10",acc:"#c8922a",txt:"#f5e8c0",sub:"#b98",brd:"rgba(200,146,42,.12)",label:"Steampunk",rarity:"rare"},cyber:{bg:"#0a0015",surf:"#100020",card:"#1a0035",acc:"#ff00cc",txt:"#fff",sub:"#bb8",brd:"rgba(255,0,204,.12)",label:"Cyberpunk 2099",rarity:"super_rare"},scriptorium:{bg:"#0d0800",surf:"#180d00",card:"#221200",acc:"#c8a840",txt:"#f5e0b0",sub:"#a88",brd:"rgba(200,168,64,.12)",label:"Scriptorium",rarity:"super_rare"},cosmos:{bg:"#050010",surf:"#0a0020",card:"#0f0030",acc:"#cc88ff",txt:"#f0e0ff",sub:"#99a",brd:"rgba(204,136,255,.1)",label:"Cosmos",rarity:"super_rare"},spectre:{bg:"#080018",surf:"#100025",card:"#180035",acc:"#7700ff",txt:"#f0e0ff",sub:"#9a7",brd:"rgba(119,0,255,.12)",label:"Spectre Violet",rarity:"super_rare"},royal:{bg:"#060600",surf:"#0d0d00",card:"#141400",acc:"#ffd700",txt:"#fff8e0",sub:"#cc9",brd:"rgba(255,215,0,.12)",label:"Royal Gold",rarity:"epique"},bloodmoon:{bg:"#0d0000",surf:"#1a0000",card:"#280000",acc:"#ff3030",txt:"#ffe0e0",sub:"#d77",brd:"rgba(255,48,48,.12)",label:"Blood Moon",rarity:"epique"},arcane:{bg:"#001414",surf:"#001e1e",card:"#002828",acc:"#00e5ff",txt:"#e0ffff",sub:"#5cc",brd:"rgba(0,229,255,.1)",label:"Cristal Arcanique",rarity:"epique"},void_th:{bg:"#000000",surf:"#050005",card:"#0a000f",acc:"#aa00ff",txt:"#f0e0ff",sub:"#a7c",brd:"rgba(170,0,255,.12)",label:"Void Éternel",rarity:"legendaire"},prism:{bg:"#050010",surf:"#0a0018",card:"#0f0025",acc:"#ffffff",txt:"#fff",sub:"#aaa",brd:"rgba(255,255,255,.15)",label:"Dimension Prismatique",rarity:"legendaire"},nexus:{bg:"#000000",surf:"#000000",card:"#050005",acc:"#ff0000",txt:"#ff8888",sub:"#555",brd:"rgba(255,0,0,.2)",label:"??? Nexus Quantique",rarity:"secret"}};

// SKIN OVERLAYS
const FA={position:"absolute",inset:0,width:"100%",height:"100%",overflow:"hidden",borderRadius:18,pointerEvents:"none"};
function OParchment(){return <div style={FA}><div style={{...FA,background:"linear-gradient(145deg,#d4b06a,#c8985a,#c0904a)",boxShadow:"inset 0 0 28px rgba(80,40,0,.32)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><rect x="0" y="0" width="7%" height="100%" fill="rgba(60,25,0,.22)"/><rect x="93%" y="0" width="7%" height="100%" fill="rgba(60,25,0,.22)"/><rect y="0" width="100%" height="7%" fill="rgba(60,25,0,.18)"/><rect y="93%" width="100%" height="7%" fill="rgba(60,25,0,.28)"/>{[14,28,42,56,70,84].map(y=><line key={y} x1="3%" y1={`${y}%`} x2="97%" y2={`${y+.3}%`} stroke="rgba(100,50,0,.09)" strokeWidth=".7"/>)}</svg></div>;}
function OBamboo(){return <div style={FA}><div style={{...FA,background:"linear-gradient(180deg,#3d5a2d,#2d4a1d)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{[25,50,75].map(y=><rect key={y} x="0" y={`${y}%`} width="100%" height="3" fill="rgba(0,0,0,.28)"/>)}{[8,18,28,38,48,58,68,78,88].map(x=><line key={x} x1={`${x}%`} y1="0" x2={`${x+1}%`} y2="100%" stroke="rgba(255,255,255,.06)" strokeWidth="1.5"/>)}<rect width="13%" height="100%" fill="rgba(255,255,255,.07)"/></svg></div>;}
function OSlate(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#2c2c2c,#1a1a1a)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{[20,40,60,80].map(y=><line key={y} x1="4%" y1={`${y}%`} x2="96%" y2={`${y}%`} stroke="rgba(255,255,255,.05)" strokeWidth=".7" strokeDasharray="3,6"/>)}</svg></div>;}
function OWashi(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#ede5d5,#ddd0b8)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{[[18,25],[55,68],[78,32],[30,77],[85,55]].map(([x,y])=><g key={`${x}${y}`} opacity=".14"><circle cx={`${x}%`} cy={`${y}%`} r="9" fill="none" stroke="#5a2a0a" strokeWidth=".7"/><circle cx={`${x}%`} cy={`${y}%`} r="3.5" fill="#8a4a1a"/>{[0,60,120,180,240,300].map(a=>{const rad=a*Math.PI/180;const lx2=x+5*Math.cos(rad),ly2=y+5*Math.sin(rad);return <line key={a} x1={`${x}%`} y1={`${y}%`} x2={`${lx2}%`} y2={`${ly2}%`} stroke="#8a4a1a" strokeWidth=".8"/>;})}</g>)}</svg></div>;}
function OCrystal(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#0a2040,#051020)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><polygon points="30,0 60,0 100,45 70,100 30,100 0,55" fill="rgba(136,220,255,.04)" stroke="rgba(136,220,255,.12)" strokeWidth=".8"/>{[[0,30,100,50],[20,0,30,100],[80,0,70,100]].map(([x1,y1,x2,y2],i)=><line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="rgba(136,220,255,.1)" strokeWidth=".7"/>)}</svg></div>;}
function OHolo(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#1a1a2a,#2a1a2a)"}}/><div style={{...FA,background:"linear-gradient(135deg,rgba(255,0,128,.18),rgba(0,255,255,.12),rgba(128,0,255,.18),rgba(255,128,0,.12))",animation:"holoShift 3s ease infinite alternate"}}/></div>;}
function OLeather(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#3a1a08,#261008)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{Array.from({length:10}).map((_,i)=>Array.from({length:7}).map((_,j)=><rect key={`${i}${j}`} x={`${i*10.5}%`} y={`${j*14.5}%`} width="8.5%" height="12%" rx="1" fill="rgba(0,0,0,.1)" stroke="rgba(0,0,0,.18)" strokeWidth=".3"/>))}</svg></div>;}
function OMetal(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#2a3040,#1a2030)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{Array.from({length:22}).map((_,i)=><line key={i} x1="0" y1={`${i*4.5}%`} x2="100%" y2={`${i*4.5}%`} stroke="rgba(200,220,255,.04)" strokeWidth=".7"/>)}<rect width="12%" height="100%" fill="rgba(255,255,255,.06)"/><circle cx="4%" cy="5%" r="3" fill="#6688aa" opacity=".5"/><circle cx="96%" cy="5%" r="3" fill="#6688aa" opacity=".5"/><circle cx="4%" cy="95%" r="3" fill="#6688aa" opacity=".5"/><circle cx="96%" cy="95%" r="3" fill="#6688aa" opacity=".5"/></svg></div>;}
function OCoral(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#2a0a10,#180508)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><path d="M20,100 L20,55 L15,35 M20,70 L10,52 M20,82 L30,65" stroke="rgba(255,100,80,.42)" strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M70,100 L70,45 L75,28 M70,62 L80,47 M70,75 L60,58" stroke="rgba(255,80,100,.4)" strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M45,100 L45,65 L40,48 M45,78 L35,62 M45,88 L55,72" stroke="rgba(255,120,60,.35)" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg></div>;}
function ODragon(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#0a1a0a,#051205)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{Array.from({length:6}).map((_,row)=>Array.from({length:9}).map((_,col)=>{const x=col*12+(row%2)*6,y=row*16;return <polygon key={`${row}${col}`} points={`${x+6},${y} ${x+12},${y+8} ${x+6},${y+16} ${x},${y+8}`} fill="none" stroke="rgba(0,200,80,.22)" strokeWidth=".6"/>;}))}</svg></div>;}
function OObsidian(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#0a0510,#050208)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><polygon points="0,35 25,50 0,65" fill="rgba(120,0,220,.14)"/><polygon points="100,20 72,38 100,55" fill="rgba(160,0,180,.12)"/><polygon points="40,0 65,30 80,0" fill="rgba(100,0,200,.1)"/><polygon points="20,100 45,70 60,100" fill="rgba(140,0,200,.1)"/><line x1="0" y1="65%" x2="100%" y2="50%" stroke="rgba(180,0,255,.1)" strokeWidth=".7"/></svg></div>;}
function OMarbleW(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#f0f0f0,#e0e0e0)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><path d="M0,35 Q20,30 40,38 Q60,45 80,35 Q90,30 100,33" stroke="rgba(180,160,100,.3)" strokeWidth=".9" fill="none"/><path d="M0,55 Q30,50 50,58 Q70,65 100,55" stroke="rgba(180,160,100,.2)" strokeWidth=".6" fill="none"/><path d="M25,0 Q28,40 22,100" stroke="rgba(180,150,80,.2)" strokeWidth=".7" fill="none"/></svg></div>;}
function OMarbleB(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#0a0a0a,#050505)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><path d="M0,40 Q25,32 45,42 Q65,52 85,38 Q95,32 100,40" stroke="rgba(255,215,0,.25)" strokeWidth=".9" fill="none"/><path d="M0,65 Q30,58 55,68 Q75,76 100,65" stroke="rgba(255,215,0,.18)" strokeWidth=".6" fill="none"/><path d="M30,0 Q35,45 28,100" stroke="rgba(255,200,0,.15)" strokeWidth=".7" fill="none"/></svg></div>;}
function ONeonV(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#0d001a,#07000d)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><rect x="2%" y="2%" width="96%" height="96%" rx="15" fill="none" stroke="#cc00ff" strokeWidth="2" opacity=".8"/><rect x="4%" y="4%" width="92%" height="92%" rx="12" fill="none" stroke="#ff00cc" strokeWidth="1" opacity=".4"/><rect x="6%" y="6%" width="88%" height="88%" rx="10" fill="none" stroke="#cc00ff" strokeWidth=".5" opacity=".25"/></svg></div>;}
const CSTARS=[[15,20,1.4],[35,60,1.1],[55,15,1.7],[75,45,1.2],[85,25,0.9],[25,80,1.3],[65,75,1.6],[45,40,1.0],[10,55,1.2],[90,70,1.5],[50,88,0.8],[38,30,1.1],[80,85,1.3]];
function OCelestial(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#020a1a,#01050d)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{CSTARS.map(([x,y,r])=><circle key={`${x}${y}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="#ffd700" opacity=".65"/>)}<path d="M75,12 L78,22 L88,22 L80,28 L83,38 L75,32 L67,38 L70,28 L62,22 L72,22 Z" fill="rgba(255,215,0,.1)"/></svg></div>;}
const CTRACES=[[10,0,10,60],[10,60,35,60],[35,60,35,100],[55,0,55,30],[55,30,80,30],[80,30,80,100],[25,0,25,25],[25,25,45,25],[90,0,90,45],[90,45,70,45],[70,45,70,70]];
function OCircuit(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#000a05,#000502)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{CTRACES.map(([x1,y1,x2,y2],i)=><line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#00ff4488" strokeWidth=".8"/>)}{[[10,60],[35,60],[55,30],[80,30],[25,25],[90,45],[70,45]].map(([x,y])=><circle key={`${x}${y}`} cx={`${x}%`} cy={`${y}%`} r="2" fill="#00ff44" opacity=".8"/>)}</svg></div>;}
function OInferno(){return <div style={FA}><div style={{...FA,background:"linear-gradient(180deg,#0a0200,#050100)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}><path d="M0,78 Q8,58 18,72 Q28,52 38,68 Q48,48 58,65 Q68,50 78,70 Q88,55 100,72 L100,100 L0,100 Z" fill="#cc2200" opacity=".65"/><path d="M5,84 Q14,68 24,80 Q34,63 44,76 Q54,60 64,73 Q74,62 84,78 Q94,68 100,80 L100,100 L0,100 Z" fill="#ff4400" opacity=".5"/><path d="M0,90 Q22,80 44,88 Q66,78 88,86 L100,88 L100,100 L0,100 Z" fill="#ff8800" opacity=".4"/></svg></div>;}
function OAbyssal(){return <div style={FA}><div style={{...FA,background:"linear-gradient(135deg,#000510,#000208)"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{[[18,35],[72,60],[40,78],[88,28],[55,50]].map(([x,y])=><g key={`${x}${y}`} opacity=".3"><ellipse cx={`${x}%`} cy={`${y}%`} rx="8" ry="3" fill="rgba(0,255,220,.4)"/><line x1={`${x-4}%`} y1={`${y-2}%`} x2={`${x-14}%`} y2={`${y-5}%`} stroke="rgba(0,255,220,.3)" strokeWidth=".6"/><line x1={`${x+4}%`} y1={`${y+1}%`} x2={`${x+14}%`} y2={`${y+4}%`} stroke="rgba(0,255,220,.3)" strokeWidth=".6"/></g>)}</svg></div>;}
function OCursed(){return <div style={{...FA,animation:"cursedFlicker 2s ease infinite"}}><div style={{...FA,background:"#000"}}/>
<svg width="100%" height="100%" preserveAspectRatio="none" style={{...FA}}>{[["ᚠ",18,30],["ᚢ",62,50],["ᚦ",38,72],["ᚨ",82,25],["ᚱ",22,78],["ᚲ",72,82],["ᚾ",50,18]].map(([s,x,y])=><text key={`${x}${y}`} x={`${x}%`} y={`${y}%`} fontSize="14" fill="rgba(220,0,0,.55)" fontFamily="serif" textAnchor="middle">{s}</text>)}<rect x="4%" y="4%" width="92%" height="92%" rx="14" fill="none" stroke="rgba(180,0,0,.35)" strokeWidth="1"/></svg></div>;}
const SK_OVLS={parchment:OParchment,bamboo:OBamboo,slate:OSlate,washi:OWashi,crystal:OCrystal,holo:OHolo,leather:OLeather,metal:OMetal,coral:OCoral,dragon:ODragon,obsidian:OObsidian,marble_w:OMarbleW,marble_b:OMarbleB,neon_v:ONeonV,celestial:OCelestial,circuit:OCircuit,inferno:OInferno,abyssal:OAbyssal,cursed:OCursed};
const SKINS={default:{label:"Standard",rarity:"commun",tc:"#fff",brd:"rgba(255,255,255,.08)",bg1:"#1a1f3a",bg2:"#0f1225",free:true,ovl:null},parchment:{label:"Parchemin",rarity:"commun",tc:"#3d2b0e",brd:"rgba(160,100,20,.6)",bg1:"#c9a86c",bg2:"#b08040",ovl:"parchment"},bamboo:{label:"Bambou",rarity:"commun",tc:"#c8ffc8",brd:"rgba(80,160,40,.4)",bg1:"#3d5a2d",bg2:"#2d4a1d",ovl:"bamboo"},slate:{label:"Ardoise",rarity:"commun",tc:"#e0e0d8",brd:"rgba(120,120,110,.4)",bg1:"#2c2c2c",bg2:"#1a1a1a",ovl:"slate"},washi:{label:"Papier Washi",rarity:"commun",tc:"#3a2a1a",brd:"rgba(140,100,60,.4)",bg1:"#ede5d5",bg2:"#ddd0b8",ovl:"washi"},crystal:{label:"Cristal Bleu",rarity:"rare",tc:"#e0f4ff",brd:"rgba(100,200,255,.45)",bg1:"#0a2040",bg2:"#051020",ovl:"crystal"},holo:{label:"Holographique",rarity:"rare",tc:"#fff",brd:"rgba(200,100,255,.5)",bg1:"#1a1a2a",bg2:"#2a1a2a",ovl:"holo"},leather:{label:"Cuir Vintage",rarity:"rare",tc:"#f5e8c0",brd:"rgba(160,90,30,.5)",bg1:"#3a1a08",bg2:"#261008",ovl:"leather"},metal:{label:"Métal Brossé",rarity:"rare",tc:"#ddeeff",brd:"rgba(100,140,200,.35)",bg1:"#2a3040",bg2:"#1a2030",ovl:"metal"},coral:{label:"Corail",rarity:"super_rare",tc:"#fff0e8",brd:"rgba(255,100,80,.45)",bg1:"#2a0a10",bg2:"#180508",ovl:"coral"},dragon:{label:"Écailles Dragon",rarity:"super_rare",tc:"#c8ffcc",brd:"rgba(0,200,80,.4)",bg1:"#0a1a0a",bg2:"#051205",ovl:"dragon"},obsidian:{label:"Obsidienne",rarity:"super_rare",tc:"#e0d0ff",brd:"rgba(140,0,220,.45)",bg1:"#0a0510",bg2:"#050208",ovl:"obsidian"},marble_w:{label:"Marbre Blanc",rarity:"super_rare",tc:"#2a2a2a",brd:"rgba(180,160,100,.5)",bg1:"#f0f0f0",bg2:"#e0e0e0",ovl:"marble_w"},neon_v:{label:"Néon Violet",rarity:"epique",tc:"#ff88ff",brd:"rgba(200,0,255,.7)",bg1:"#0d001a",bg2:"#07000d",ovl:"neon_v"},marble_b:{label:"Marbre Noir",rarity:"epique",tc:"#ffd700",brd:"rgba(255,215,0,.45)",bg1:"#0a0a0a",bg2:"#050505",ovl:"marble_b"},celestial:{label:"Céleste",rarity:"epique",tc:"#ffd700",brd:"rgba(255,215,0,.4)",bg1:"#020a1a",bg2:"#01050d",ovl:"celestial"},circuit:{label:"Circuit",rarity:"epique",tc:"#00ff88",brd:"rgba(0,255,68,.4)",bg1:"#000a05",bg2:"#000502",ovl:"circuit"},inferno:{label:"Inferno",rarity:"legendaire",tc:"#ffcc44",brd:"rgba(255,100,0,.5)",bg1:"#0a0200",bg2:"#050100",ovl:"inferno"},abyssal:{label:"Abyssal",rarity:"legendaire",tc:"#44ffee",brd:"rgba(0,255,220,.45)",bg1:"#000510",bg2:"#000208",ovl:"abyssal"},cursed:{label:"??? Carte Maudite",rarity:"secret",tc:"#ff4444",brd:"rgba(200,0,0,.6)",bg1:"#000000",bg2:"#000000",ovl:"cursed"}};

const LOOT_BOXES=[
  {id:"sk_b",label:"Coffre Bois",sub:"Skins",type:"skin",cost:250,col:"#8B4513",level:"wood",pool:[{id:"skin_parchment",p:.35,name:"Parchemin",rar:"commun"},{id:"skin_bamboo",p:.28,name:"Bambou",rar:"commun"},{id:"skin_slate",p:.22,name:"Ardoise",rar:"commun"},{id:"skin_washi",p:.12,name:"Papier Washi",rar:"commun"},{id:"skin_crystal",p:.02,name:"Cristal Bleu",rar:"rare"},{id:"skin_holo",p:.01,name:"Holographique",rar:"rare"}]},
  {id:"sk_g",label:"Coffre Or",sub:"Skins",type:"skin",cost:1000,col:"#ffd700",level:"gold",pool:[{id:"skin_crystal",p:.25,name:"Cristal Bleu",rar:"rare"},{id:"skin_holo",p:.22,name:"Holographique",rar:"rare"},{id:"skin_leather",p:.20,name:"Cuir Vintage",rar:"rare"},{id:"skin_metal",p:.14,name:"Métal Brossé",rar:"rare"},{id:"skin_coral",p:.07,name:"Corail",rar:"super_rare"},{id:"skin_dragon",p:.05,name:"Écailles Dragon",rar:"super_rare"},{id:"skin_obsidian",p:.04,name:"Obsidienne",rar:"super_rare"},{id:"skin_marble_w",p:.02,name:"Marbre Blanc",rar:"super_rare"},{id:"skin_marble_b",p:.01,name:"Marbre Noir",rar:"epique"}]},
  {id:"sk_l",label:"Coffre Légendaire",sub:"Skins",type:"skin",cost:5000,col:"#ff9800",level:"leg",pool:[{id:"skin_coral",p:.13,name:"Corail",rar:"super_rare"},{id:"skin_dragon",p:.12,name:"Écailles Dragon",rar:"super_rare"},{id:"skin_obsidian",p:.12,name:"Obsidienne",rar:"super_rare"},{id:"skin_marble_w",p:.10,name:"Marbre Blanc",rar:"super_rare"},{id:"skin_neon_v",p:.14,name:"Néon Violet",rar:"epique"},{id:"skin_marble_b",p:.12,name:"Marbre Noir",rar:"epique"},{id:"skin_celestial",p:.10,name:"Céleste",rar:"epique"},{id:"skin_circuit",p:.07,name:"Circuit",rar:"epique"},{id:"skin_inferno",p:.05,name:"Inferno",rar:"legendaire"},{id:"skin_abyssal",p:.04,name:"Abyssal",rar:"legendaire"},{id:"skin_cursed",p:.01,name:"???",rar:"secret",secret:true}]},
  {id:"th_b",label:"Coffre Bois",sub:"Thèmes",type:"theme",cost:250,col:"#8B4513",level:"wood",pool:[{id:"theme_zen",p:.35,name:"Forêt Zen",rar:"commun"},{id:"theme_arctic",p:.28,name:"Arctic Frost",rar:"commun"},{id:"theme_sakura",p:.22,name:"Sakura Nuit",rar:"commun"},{id:"theme_desert",p:.12,name:"Désert Antique",rar:"commun"},{id:"theme_abyss",p:.02,name:"Océan Abyssal",rar:"rare"},{id:"theme_pixel",p:.01,name:"Pixel Rétro",rar:"rare"}]},
  {id:"th_g",label:"Coffre Or",sub:"Thèmes",type:"theme",cost:1000,col:"#ffd700",level:"gold",pool:[{id:"theme_abyss",p:.22,name:"Océan Abyssal",rar:"rare"},{id:"theme_pixel",p:.18,name:"Pixel Rétro",rar:"rare"},{id:"theme_jungle",p:.16,name:"Jungle Néon",rar:"rare"},{id:"theme_volcano",p:.13,name:"Volcan",rar:"rare"},{id:"theme_steam",p:.12,name:"Steampunk",rar:"rare"},{id:"theme_cyber",p:.08,name:"Cyberpunk 2099",rar:"super_rare"},{id:"theme_scriptorium",p:.06,name:"Scriptorium",rar:"super_rare"},{id:"theme_cosmos",p:.03,name:"Cosmos",rar:"super_rare"},{id:"theme_spectre",p:.02,name:"Spectre Violet",rar:"super_rare"}]},
  {id:"th_l",label:"Coffre Légendaire",sub:"Thèmes",type:"theme",cost:5000,col:"#aa00ff",level:"leg",pool:[{id:"theme_cyber",p:.13,name:"Cyberpunk 2099",rar:"super_rare"},{id:"theme_scriptorium",p:.11,name:"Scriptorium",rar:"super_rare"},{id:"theme_cosmos",p:.11,name:"Cosmos",rar:"super_rare"},{id:"theme_spectre",p:.09,name:"Spectre Violet",rar:"super_rare"},{id:"theme_royal",p:.14,name:"Royal Gold",rar:"epique"},{id:"theme_bloodmoon",p:.12,name:"Blood Moon",rar:"epique"},{id:"theme_arcane",p:.10,name:"Cristal Arcanique",rar:"epique"},{id:"theme_void_th",p:.09,name:"Void Éternel",rar:"legendaire"},{id:"theme_prism",p:.10,name:"Dimension Prismatique",rar:"legendaire"},{id:"theme_nexus",p:.01,name:"???",rar:"secret",secret:true}]},
];
function rollLoot(box){const r=Math.random();let c=0;for(const it of box.pool){c+=it.p;if(r<=c)return it;}return box.pool[box.pool.length-1];}

const Q_POOL=[{id:"c20",t:"cards",n:20,label:"Retourne 20 cartes",xp:50,coins:30},{id:"c50",t:"cards",n:50,label:"Retourne 50 cartes",xp:100,coins:80},{id:"c100",t:"cards",n:100,label:"Retourne 100 cartes",xp:200,coins:150},{id:"s10",t:"streak",n:10,label:"Streak de 10",xp:80,coins:60},{id:"s20",t:"streak",n:20,label:"Streak de 20",xp:150,coins:120},{id:"s30",t:"streak",n:30,label:"Streak de 30",xp:250,coins:200},{id:"m1",t:"master",n:1,label:"Maîtrise 1 mot",xp:60,coins:50},{id:"m3",t:"master",n:3,label:"Maîtrise 3 mots",xp:150,coins:120},{id:"x100",t:"xp",n:100,label:"Gagne 100 XP",xp:30,coins:40},{id:"x200",t:"xp",n:200,label:"Gagne 200 XP",xp:60,coins:80}];
const WEEKLY_Q_POOL=[{id:"wc200",t:"cards",n:200,label:"Retourne 200 cartes",xp:200,coins:300},{id:"wc500",t:"cards",n:500,label:"Retourne 500 cartes",xp:500,coins:600},{id:"ws50",t:"streak",n:50,label:"Streak de 50",xp:300,coins:400},{id:"ws100",t:"streak",n:100,label:"Streak de 100",xp:600,coins:800},{id:"wm5",t:"master",n:5,label:"Maîtrise 5 mots",xp:250,coins:350},{id:"wm10",t:"master",n:10,label:"Maîtrise 10 mots",xp:500,coins:700},{id:"wx500",t:"xp",n:500,label:"Gagne 500 XP",xp:150,coins:200},{id:"wx1000",t:"xp",n:1000,label:"Gagne 1000 XP",xp:300,coins:400}];
const todayStr=()=>new Date().toISOString().split("T")[0];
const weekStr=()=>{const d=new Date();const jan1=new Date(d.getFullYear(),0,1);const wk=Math.ceil(((d.getTime()-jan1.getTime())/86400000+jan1.getDay()+1)/7);return`${d.getFullYear()}-W${String(wk).padStart(2,"0")}`;};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWeeklyQuests(ws:string,lk:string):any[]{let s=(ws+lk).split("").reduce((a,c,i)=>a+(c.charCodeAt(0)*(i+1)),0);const p:typeof WEEKLY_Q_POOL=[];const pu:number[]=[];while(p.length<2){s=(s*1664525+1013904223)>>>0;const i=s%WEEKLY_Q_POOL.length;if(!pu.includes(i)){pu.push(i);p.push(WEEKLY_Q_POOL[i]);}}return p;}
function getDailyQuests(ds){let s=ds.split("-").reduce((a,b,i)=>a+(parseInt(b)*(i===0?10000:i===1?100:1)),0);const p=[],u=new Set();while(p.length<3){s=(s*1664525+1013904223)>>>0;const i=s%Q_POOL.length;if(!u.has(i)){u.add(i);p.push(Q_POOL[i]);}}return p;}
const BADGES=[{id:"b_fw",ic:"⭐",l:"1er mot maîtrisé"},{id:"b_s10",ic:"🔥",l:"Streak 10"},{id:"b_s50",ic:"💥",l:"Streak 50"},{id:"b_s100",ic:"⚡",l:"Streak 100"},{id:"b_m10",ic:"📚",l:"10 mots"},{id:"b_m50",ic:"🎓",l:"50 mots"},{id:"b_m100",ic:"👑",l:"100 mots"},{id:"b_rbr",ic:"🥉",l:"Rang Bronze"},{id:"b_rgo",ic:"🥇",l:"Rang Or"},{id:"b_rpl",ic:"🔮",l:"Rang Platine"},{id:"b_rso",ic:"☀️",l:"Rang Solaire"},{id:"b_pen",ic:"🏆",l:"Platine EN"},{id:"b_pde",ic:"🏆",l:"Platine DE"},{id:"b_pes",ic:"🏆",l:"Platine ES"},{id:"b_pit",ic:"🏆",l:"Platine IT"}];
const CAT_ICONS=["⚡","👪","🫀","🍎","🌿","🏠","💭","⏰","🌍","💡","🎨","🌀"],CAT_NAMES=["Actions","Famille","Corps","Nourriture","Nature","Maison","Émotions","Temps","Société","Concepts","Couleurs","Divers"];
const mkS=a=>new Set(a);
const EC=[mkS(["be","do","make","get","go","come","take","give","know","see","look","want","use","find","tell","work","call","try","ask","need","feel","leave","put","keep","let","show","hear","play","run","move","live","bring","write","sit","stand","lose","pay","meet","learn","change","watch","follow","stop","read","grow","open","walk","help","jump","laugh","lift","lock","push","roll","shake","smile","swim","talk","taste","touch","burn","wash","cook","pull","turn","cover","drink","act","attack","cry","drop","fold","support","control","produce","increase","seem","send","say","become","begin","break","build","buy","carry","catch","choose","clean","cut","die","drive","eat","explain","fall","fight","fly","forget","hit","hope","join","kill","lay","lead","lie","listen","mean","miss","offer","pass","protect","reach","receive","remember","rest","return","rise","save","serve","sleep","speak","start","stay","stretch","swing","throw","understand","wait","win","wish"]),mkS(["mother","father","brother","sister","son","daughter","baby","boy","girl","man","woman","family","person","child","female","male","friend","husband","wife","parent"]),mkS(["eye","ear","hand","foot","head","heart","brain","face","hair","mouth","nose","neck","arm","leg","knee","skin","blood","bone","muscle","nerve","lip","chin","back","chest","body","finger","breath","health","stomach","shoulder","elbow","ankle","wrist","thumb","toe","tongue","tooth"]),mkS(["food","bread","meat","milk","butter","cheese","egg","rice","potato","sugar","salt","oil","cake","soup","apple","orange","fish","meal","drink","cook","taste","grain","wine","beer","coffee","tea","honey","fruit","vegetable"]),mkS(["earth","air","tree","flower","grass","rain","snow","wind","cloud","sun","moon","star","sea","river","mountain","island","sand","stone","ice","leaf","wood","dust","field","bird","animal","insect","bee","horse","dog","cat","cow","pig","monkey","fire","water","sky","forest","lake","valley","root","branch","seed"]),mkS(["house","door","window","room","bed","floor","wall","roof","key","bag","box","bottle","cup","plate","fork","knife","pen","pencil","book","paper","card","cloth","needle","nail","hammer","brush","soap","drawer","clock","table","chair","basket","kettle","pipe","boat","road","engine","machine","glass","tin","pot"]),mkS(["happy","sad","angry","fear","love","hate","hope","shame","pain","pleasure","comfort","disgust","regret","surprise","desire","doubt","feeling","tired","ill","awake","free","cruel","bitter","violent","gentle","proud"]),mkS(["time","day","night","morning","year","month","week","hour","minute","early","late","past","future","present","age","now","always","never","before","after","when","while","long","short","new","old","young","slow","fast","sudden","first","last","moment"]),mkS(["country","nation","government","army","law","war","peace","trade","market","money","business","work","industry","tax","prison","crime","religion","church","society","public","private","political","education","science","art","music","town","news","school","hospital","bank"]),mkS(["idea","thought","reason","knowledge","theory","fact","truth","opinion","question","answer","decision","process","system","change","relation","interest","value","quality","condition","control","direction","sense","energy","level","number","amount","size","weight","space","experience"]),mkS(["red","blue","green","yellow","black","white","brown","grey","orange","bright","dark","light","colour","silver","gold","pink","purple"])];
const DC=[mkS(["haben","sein","werden","können","müssen","wollen","sagen","machen","gehen","kommen","sehen","wissen","lassen","geben","finden","bleiben","bringen","denken","zeigen","fühlen","suchen","kaufen","fahren","laufen","lesen","schreiben","hören","sprechen","lernen","verstehen","helfen","halten","öffnen","schlafen","trinken","essen","arbeiten","warten","fragen","nehmen","brauchen","stellen","legen","reden","bedeuten","lieben","spielen","kochen","waschen","rufen","fallen","verlieren","gewinnen","bauen","erzählen","vergessen","wählen","führen","erklären"]),mkS(["Mutter","Vater","Bruder","Schwester","Sohn","Tochter","Kind","Familie","Mann","Frau","Baby","Mädchen","Freund","Herr","Eltern"]),mkS(["Kopf","Hand","Auge","Ohr","Nase","Mund","Herz","Körper","Haar","Bein","Arm","Finger","Haut","Blut","Bauch","Rücken","Brust","Knochen","Muskel","Nerv","Lippe","Kinn","Schulter","Knie","Fuß","Zahn"]),mkS(["Brot","Wasser","Milch","Fleisch","Obst","Gemüse","Salz","Zucker","Butter","Käse","Ei","Reis","Kartoffel","Kuchen","Suppe","Wein","Bier","Fisch","Kaffee","Tee","Honig","Mehl"]),mkS(["Baum","Blume","Regen","Schnee","Wind","Sonne","Mond","Meer","Fluss","Berg","Tier","Wald","Erde","Luft","Feuer","Eis","Stein","Gras","Blatt","Vogel","Hund","Katze","Pferd","Sand","Wolke","Himmel"]),mkS(["Haus","Tür","Fenster","Zimmer","Bett","Tisch","Stuhl","Küche","Boden","Wand","Schlüssel","Buch","Glas","Messer","Tasse","Tasche","Schuhe","Uhr","Lampe","Stift","Brief","Spiegel","Treppe","Auto","Brücke","Straße"]),mkS(["Angst","Liebe","Freude","Ruhe","Glück","Hoffnung","Scham","Schmerz","Überraschung","müde","krank","frei","glücklich","traurig","wütend","nervös","ruhig","einsam"]),mkS(["Zeit","Tag","Nacht","Morgen","Jahr","Monat","Woche","Stunde","Minute","früh","spät","neu","alt","jung","immer","nie","jetzt","heute","morgen","gestern","schnell","langsam"]),mkS(["Land","Stadt","Arbeit","Schule","Geld","Krieg","Frieden","Gesetz","Kirche","Regierung","Gesellschaft","Politik","Medizin","Markt","Bank","Krankenhaus","Recht","Freiheit"]),mkS(["Idee","Wissen","Wahrheit","Frage","Antwort","System","Sprache","Geschichte","Kraft","Wert","Qualität","Lösung","Problem","Geist","Sinn"]),mkS(["rot","blau","grün","gelb","schwarz","weiß","grau","braun","orange","hell","dunkel","Farbe","golden"])];
const SC=[mkS(["ser","estar","tener","hacer","ir","decir","poder","querer","saber","ver","dar","hablar","llevar","dejar","encontrar","llamar","venir","pensar","salir","volver","tomar","conocer","vivir","sentir","mirar","empezar","esperar","buscar","trabajar","escribir","perder","entender","pedir","recibir","cambiar","ganar","morir","necesitar","leer","recordar","usar","escuchar","decidir","terminar","correr","dormir","comer","beber","abrir","cerrar","ayudar","comprar","aprender","nadar","cocinar","reír","llorar","lavar","limpiar","construir","llenar","vender","enseñar","jugar","pagar","responder","crecer","amar","mostrar","crear","mantener","permitir","añadir","cortar","empujar","tirar"]),mkS(["madre","padre","hermano","hermana","hijo","hija","familia","hombre","mujer","niño","amigo","bebé","persona","gente","marido","esposa","abuelo","abuela"]),mkS(["cabeza","ojo","oído","mano","pie","corazón","sangre","cuerpo","cara","pelo","boca","nariz","cuello","brazo","pierna","rodilla","piel","hueso","músculo","nervio","labio","espalda","pecho","estómago","dedo","hombro","diente"]),mkS(["comida","pan","carne","leche","agua","vino","aceite","azúcar","sal","arroz","papa","queso","huevo","pescado","fruta","verdura","sopa","mantequilla","miel","café","té","cerveza","harina","pimienta"]),mkS(["tierra","aire","árbol","flor","hierba","lluvia","nieve","viento","nube","sol","luna","mar","río","montaña","isla","arena","piedra","hielo","hoja","madera","campo","bosque","animal","pájaro","perro","gato","caballo","fuego","cielo"]),mkS(["casa","puerta","ventana","habitación","cama","suelo","pared","techo","llave","bolsa","caja","botella","taza","plato","tenedor","cuchillo","bolígrafo","lápiz","libro","papel","tarjeta","reloj","mesa","silla","barco","coche","tren","cocina"]),mkS(["feliz","triste","enojado","miedo","amor","odio","esperanza","vergüenza","dolor","placer","sorpresa","deseo","duda","alegría","cansado","enfermo","libre","nervioso","tranquilo","orgulloso"]),mkS(["tiempo","día","noche","mañana","año","mes","semana","hora","temprano","tarde","pasado","futuro","presente","ahora","hoy","ayer","siempre","nunca","antes","después","rápido","lento","nuevo","viejo","joven"]),mkS(["país","nación","gobierno","ejército","ley","guerra","paz","mercado","dinero","trabajo","industria","impuesto","religión","iglesia","sociedad","educación","ciencia","arte","ciudad","escuela","hospital","banco","cultura"]),mkS(["idea","razón","conocimiento","teoría","hecho","verdad","opinión","pregunta","respuesta","decisión","sistema","cambio","relación","valor","calidad","condición","sentido","fuerza","poder","energía"]),mkS(["rojo","azul","verde","amarillo","negro","blanco","marrón","gris","naranja","claro","oscuro","color","dorado","rosa"])];
const ITC=[mkS(["essere","avere","fare","dire","andare","sapere","volere","potere","venire","stare","dare","vedere","dovere","parlare","mettere","sentire","trovare","lasciare","prendere","portare","conoscere","credere","chiedere","mangiare","bere","dormire","lavorare","capire","aprire","chiudere","leggere","scrivere","vivere","aspettare","cercare","ricordare","tornare","cambiare","pensare","cominciare","finire","guardare","aiutare","amare","usare","rispondere","giocare","correre","comprare","imparare","perdere","creare","decidere","cadere","crescere","nuotare","cucinare","ridere","piangere","tagliare","pulire","lavare","costruire","riempire","vendere","insegnare","pagare","toccare","raggiungere","offrire","scegliere"]),mkS(["madre","padre","fratello","sorella","figlio","figlia","famiglia","uomo","donna","bambino","amico","neonato","persona","gente","marito","moglie","nonno","nonna"]),mkS(["testa","occhio","orecchio","mano","piede","cuore","sangue","corpo","faccia","capelli","bocca","naso","collo","braccio","gamba","ginocchio","pelle","osso","muscolo","nervo","labbro","mento","schiena","petto","stomaco","dito","spalla","dente"]),mkS(["cibo","pane","carne","latte","acqua","vino","olio","zucchero","sale","riso","patata","formaggio","uovo","pesce","frutta","verdura","zuppa","burro","miele","caffè","tè","birra","farina","pepe"]),mkS(["terra","aria","albero","fiore","erba","pioggia","neve","vento","nuvola","sole","luna","mare","fiume","montagna","isola","sabbia","pietra","ghiaccio","foglia","legno","campo","foresta","animale","uccello","cane","gatto","cavallo","fuoco","cielo"]),mkS(["casa","porta","finestra","camera","letto","pavimento","muro","tetto","chiave","borsa","scatola","bottiglia","tazza","piatto","forchetta","coltello","penna","matita","libro","carta","orologio","tavolo","sedia","nave","macchina","treno","cucina"]),mkS(["felice","triste","arrabbiato","paura","amore","odio","speranza","vergogna","dolore","piacere","sorpresa","desiderio","dubbio","gioia","stanco","malato","libero","nervoso","tranquillo","orgoglioso"]),mkS(["tempo","giorno","notte","mattina","anno","mese","settimana","ora","minuto","presto","tardi","passato","futuro","presente","adesso","oggi","ieri","sempre","mai","prima","dopo","veloce","lento","nuovo","vecchio","giovane"]),mkS(["paese","nazione","governo","esercito","legge","guerra","pace","mercato","denaro","lavoro","industria","tassa","religione","chiesa","società","educazione","scienza","arte","città","scuola","ospedale","banca","cultura"]),mkS(["idea","ragione","conoscenza","teoria","fatto","verità","opinione","domanda","risposta","decisione","sistema","cambiamento","relazione","valore","qualità","condizione","senso","forza","potere","energia"]),mkS(["rosso","blu","verde","giallo","nero","bianco","marrone","grigio","arancione","chiaro","scuro","colore","dorato","rosa"])];
const CAT_FNS={en:w=>{const i=EC.findIndex(s=>s.has(w));return i<0?11:i;},de:w=>{const i=DC.findIndex(s=>s.has(w));return i<0?11:i;},es:w=>{const i=SC.findIndex(s=>s.has(w));return i<0?11:i;},it:w=>{const i=ITC.findIndex(s=>s.has(w));return i<0?11:i;}};

const pw=s=>s.split(",").map(x=>{const i=x.indexOf("|");return[x.slice(0,i),x.slice(i+1)];});
const EN_RAW="a|un/une,able|capable,about|à propos de,account|compte,acid|acide,across|à travers,act|acte/agir,addition|addition,adjustment|ajustement,advertisement|publicité,after|après,again|encore,against|contre,age|âge,agreement|accord,air|air,all|tout,almost|presque,among|parmi,amount|quantité,amusement|amusement,and|et,angle|angle,angry|en colère,animal|animal,answer|réponse,ant|fourmi,any|n'importe quel,apparatus|appareil,apple|pomme,approval|approbation,arch|arche,argument|argument,arm|bras,army|armée,art|art,as|comme,at|à/chez,attack|attaque,attempt|tentative,attention|attention,automatic|automatique,awake|éveillé,baby|bébé,back|dos/arrière,bad|mauvais,bag|sac,balance|équilibre,ball|balle/ballon,band|bande/groupe,base|base,basin|bassin,basket|panier,bath|bain,be|être,beautiful|beau/belle,because|parce que,bed|lit,bee|abeille,before|avant,behaviour|comportement,belief|croyance,bell|cloche,bent|courbé,berry|baie,between|entre,bird|oiseau,birth|naissance,bit|morceau,bitter|amer,black|noir,blade|lame,blood|sang,blow|coup/souffler,blue|bleu,board|planche/tableau,boat|bateau,body|corps,boiling|bouillant,bone|os,book|livre,boot|botte,bottle|bouteille,box|boîte,boy|garçon,brain|cerveau,brake|frein,branch|branche,bread|pain,breath|souffle,brick|brique,bridge|pont,bright|brillant,broken|cassé,brother|frère,brown|brun,brush|brosse,bucket|seau,building|bâtiment,bulb|ampoule,burn|brûler,burst|éclater,business|affaires,but|mais,butter|beurre,button|bouton,by|par/près de,cake|gâteau,camera|appareil photo,canvas|toile,card|carte,care|soin,carriage|voiture/wagon,cart|charrette,cat|chat,cause|cause,certain|certain,chain|chaîne,chalk|craie,chance|chance,change|changement,cheap|bon marché,cheese|fromage,chemical|chimique,chest|poitrine/coffre,chief|chef,chin|menton,church|église,circle|cercle,clean|propre/nettoyer,clear|clair,clock|horloge,cloth|tissu,cloud|nuage,coal|charbon,coat|manteau,cold|froid,collar|col,colour|couleur,comb|peigne,come|venir,comfort|confort,committee|comité,common|commun,company|compagnie,comparison|comparaison,competition|compétition,complete|complet,complex|complexe,condition|condition,connection|connexion,conscious|conscient,control|contrôle,cook|cuisiner,copper|cuivre,copy|copie,cord|corde,cork|bouchon,cotton|coton,cough|toux/tousser,country|pays/campagne,cover|couvrir,cow|vache,crack|fissure/craquer,credit|crédit,crime|crime,cruel|cruel,crush|écraser,cry|pleurer/cri,cup|tasse,current|courant/actuel,curtain|rideau,curve|courbe,cushion|coussin,damage|dommage,danger|danger,dark|sombre,daughter|fille,day|jour,dead|mort,dear|cher,death|mort,debt|dette,decision|décision,deep|profond,degree|degré,delicate|délicat,dependent|dépendant,design|conception,desire|désir,destruction|destruction,detail|détail,development|développement,different|différent,digestion|digestion,direction|direction,dirty|sale,discovery|découverte,discussion|discussion,disease|maladie,disgust|dégoût,distance|distance,distribution|distribution,division|division,do|faire,dog|chien,door|porte,doubt|doute,down|en bas,drain|drain/vider,drawer|tiroir,dress|robe,drink|boire/boisson,driving|conduire,drop|goutte/tomber,dry|sec/sécher,dust|poussière,ear|oreille,early|tôt,earth|terre,east|est,edge|bord,education|éducation,effect|effet,egg|œuf,elastic|élastique,electric|électrique,end|fin,engine|moteur,enough|assez,equal|égal,error|erreur,even|même/pair,event|événement,ever|jamais/toujours,every|chaque,example|exemple,exchange|échange,existence|existence,expansion|expansion,experience|expérience,expert|expert,eye|œil,face|visage,fact|fait,fall|tomber/automne,false|faux,family|famille,far|loin,farm|ferme,fat|gras,father|père,fear|peur,feeling|sentiment,female|femelle/féminin,fertile|fertile,fiction|fiction,field|champ,finger|doigt,fire|feu,fish|poisson,fixed|fixe,flag|drapeau,flat|plat,floor|sol/plancher,flower|fleur,fold|plier,food|nourriture,foolish|stupide,foot|pied,force|force,fork|fourchette,form|forme,forward|en avant,free|libre/gratuit,frequent|fréquent,friend|ami,from|de,front|avant/devant,full|plein,future|futur,garden|jardin,general|général,get|obtenir,girl|fille,give|donner,glass|verre,go|aller,good|bon,government|gouvernement,grain|grain,grass|herbe,great|grand/formidable,green|vert,grip|poignée/saisir,group|groupe,growth|croissance,guide|guide,gun|fusil/arme,hair|cheveux,hammer|marteau,hand|main,hanging|suspendu,happy|heureux,harbour|port,hard|dur/difficile,harmony|harmonie,hate|haine/détester,have|avoir,head|tête,healthy|sain,heart|cœur,heat|chaleur,help|aide/aider,here|ici,high|haut,history|histoire,hole|trou,hollow|creux,hope|espoir,horn|corne/klaxon,horse|cheval,hospital|hôpital,hour|heure,house|maison,how|comment,idea|idée,ill|malade,important|important,impulse|impulsion,increase|augmenter,industry|industrie,ink|encre,insect|insecte,instrument|instrument,interest|intérêt,invention|invention,iron|fer/repasser,island|île,jelly|gelée,jewel|bijou,join|rejoindre,journey|voyage,judge|juge/juger,jump|sauter,keep|garder,kettle|bouilloire,key|clé,kind|gentil/sorte,knee|genou,knife|couteau,knowledge|connaissance,land|terre/atterrir,language|langue,last|dernier/durer,late|tard/en retard,laugh|rire,law|loi,lead|plomb/conduire,leaf|feuille,learning|apprentissage,leather|cuir,left|gauche,leg|jambe,let|laisser/permettre,letter|lettre,level|niveau,library|bibliothèque,lift|ascenseur/soulever,light|lumière/léger,like|aimer/comme,limit|limite,line|ligne,linen|lin,lip|lèvre,liquid|liquide,list|liste,little|petit/peu,living|vivant/vie,lock|serrure,long|long,look|regarder,loose|lâche,loss|perte,loud|fort/bruyant,love|amour/aimer,low|bas,machine|machine,make|faire/fabriquer,male|mâle/masculin,man|homme,manager|directeur,map|carte,mark|marque/noter,market|marché,married|marié,mass|masse,match|allumette/correspondre,material|matériau,may|peut-être/pouvoir,meal|repas,measure|mesure,meat|viande,medical|médical,meeting|réunion,memory|mémoire,metal|métal,middle|milieu/centre,military|militaire,milk|lait,mind|esprit,mine|mine/le mien,minute|minute,mist|brume,mixed|mélangé,money|argent,monkey|singe,month|mois,moon|lune,morning|matin,mother|mère,motion|mouvement,mountain|montagne,mouth|bouche,move|bouger,much|beaucoup,muscle|muscle,music|musique,nail|clou/ongle,name|nom,narrow|étroit,nation|nation,natural|naturel,near|près,necessary|nécessaire,neck|cou,need|besoin/avoir besoin,needle|aiguille,nerve|nerf,net|filet,new|nouveau,news|nouvelles,night|nuit,no|non,noise|bruit,normal|normal,north|nord,nose|nez,not|ne pas,note|note,now|maintenant,number|nombre/numéro,nut|noix/écrou,observation|observation,of|de,off|éteint/hors,offer|offre/offrir,office|bureau,oil|huile/pétrole,old|vieux,on|sur/allumé,only|seulement,open|ouvrir/ouvert,operation|opération,opinion|opinion,opposite|opposé,or|ou,orange|orange,order|ordre/commander,organization|organisation,ornament|ornement,other|autre,out|dehors,oven|four,over|au-dessus/fini,owner|propriétaire,page|page,pain|douleur,paint|peinture/peindre,paper|papier,parallel|parallèle,parcel|colis,part|partie,past|passé,paste|colle/pâte,payment|paiement,peace|paix,pen|stylo,pencil|crayon,person|personne,physical|physique,picture|image/tableau,pig|cochon,pin|épingle,pipe|tuyau,place|endroit/placer,plane|avion/plan,plant|plante,plate|assiette,play|jouer/pièce,please|s'il vous plaît,pleasure|plaisir,plough|charrue,pocket|poche,point|point,poison|poison,polish|cirer/polir,political|politique,poor|pauvre,porter|porteur,position|position,possible|possible,pot|pot,potato|pomme de terre,powder|poudre,power|pouvoir/énergie,present|présent/cadeau,price|prix,print|imprimer,prison|prison,private|privé,probable|probable,process|processus,produce|produire,profit|profit,property|propriété,prose|prose,protest|protestation,public|public,pull|tirer,punishment|punition,purpose|but/objectif,push|pousser,quality|qualité,question|question,rain|pluie,range|gamme/portée,rate|taux,ray|rayon,reaction|réaction,reading|lecture,reason|raison,record|enregistrement,regret|regret,relation|relation,religion|religion,representative|représentant,request|demande,respect|respect,rest|repos,reward|récompense,rhythm|rythme,rice|riz,river|rivière/fleuve,road|route,roll|rouler/rouleau,room|chambre/pièce,rub|frotter,rule|règle,run|courir,sad|triste,safe|sûr/coffre-fort,salt|sel,sand|sable,scale|échelle/balance,science|science,sea|mer,seat|siège,secret|secret,selection|sélection,self|soi-même,sense|sens,servant|domestique,sex|sexe,shade|ombre,shake|secouer,shame|honte,shock|choc,short|court,side|côté,sign|signe/panneau,silk|soie,silver|argent,simple|simple,sister|sœur,size|taille,skin|peau,sky|ciel,sleep|dormir,slip|glisser,slope|pente,slow|lent,small|petit,smell|sentir/odeur,smile|sourire,smoke|fumée/fumer,sneeze|éternuer,snow|neige,soap|savon,society|société,soft|doux,solid|solide,son|fils,song|chanson,sort|sorte/trier,sound|son/bruit,soup|soupe,south|sud,space|espace,stage|scène/étape,start|démarrer/début,statement|déclaration,steam|vapeur,steel|acier,step|étape/marcher,stitch|point de couture,stone|pierre,stop|arrêter,story|histoire/récit,stretch|étirer,structure|structure,substance|substance,sugar|sucre,suggestion|suggestion,summer|été,support|soutien,surprise|surprise,swim|nager,system|système,take|prendre,talk|parler,taste|goût/goûter,tax|taxe/impôt,teaching|enseignement,tendency|tendance,test|test/tester,theory|théorie,thin|mince,thing|chose,thought|pensée,thunder|tonnerre,time|temps/fois,tin|étain/boîte,tired|fatigué,top|sommet/haut,touch|toucher,town|ville,trade|commerce,transport|transport,trouble|problème,true|vrai,turn|tourner,twist|tordre,umbrella|parapluie,under|sous,unit|unité,up|en haut,use|utiliser/usage,value|valeur,verse|vers/strophe,very|très,vessel|vaisseau,view|vue,violent|violent,voice|voix,waiting|attente,walk|marcher/promenade,wall|mur,war|guerre,warm|chaud,wash|laver,waste|déchets/gaspiller,watch|montre/regarder,water|eau,wave|vague/faire signe,wax|cire,way|chemin/façon,weather|météo,week|semaine,weight|poids,well|bien/puits,west|ouest,wet|mouillé,wheel|roue,when|quand,where|où,while|pendant que,whip|fouet,whistle|sifflet/siffler,white|blanc,who|qui,why|pourquoi,wide|large,wind|vent,window|fenêtre,wine|vin,wing|aile,winter|hiver,wire|fil électrique,wise|sage,woman|femme,wood|bois,wool|laine,word|mot,work|travail/travailler,worm|ver,wound|blessure,writing|écriture,wrong|faux/tort,year|année,yellow|jaune,yes|oui,young|jeune,yesterday|hier,tomorrow|demain,together|ensemble,still|encore/toujours,quite|assez,often|souvent,already|déjà,once|une fois,both|les deux,each|chaque,many|beaucoup de,more|plus,less|moins,enough|assez,too|trop,same|même,whole|entier,half|moitié,several|plusieurs,main|principal,next|suivant/prochain,right|droit/correct,outside|dehors/extérieur,inside|dedans/intérieur,quick|rapide,ready|prêt,open|ouvert,closed|fermé,full|plein,empty|vide,clean|propre,hot|chaud,heavy|lourd,strong|fort,weak|faible,deep|profond,thick|épais,round|rond,straight|droit,sharp|aigu/tranchant,smooth|lisse,rough|rugueux,quiet|calme/silencieux,tall|grand/haut,coffee|café,tea|thé,chocolate|chocolat,beer|bière,fruit|fruit,vegetable|légume,soup|soupe,forest|forêt,valley|vallée,lake|lac,sky|ciel,flower|fleur,leaf|feuille,root|racine,seed|graine,wave|vague,thunder|tonnerre,lightning|éclair,school|école,hospital|hôpital,bank|banque,police|police,court|tribunal,sport|sport,culture|culture,technology|technologie,internet|internet,phone|téléphone,computer|ordinateur";
const DE_RAW="aber|mais,Abend|soir,alle|tous,allein|seul,als|quand/comme,also|donc,alt|vieux,an|à/sur,Anfang|début,Angst|peur/angoisse,Antwort|réponse,Arbeit|travail,Arzt|médecin,auch|aussi,auf|sur,Aufgabe|tâche/devoir,Auge|œil,aus|de/hors de,Auto|voiture,Bahnhof|gare,bald|bientôt,Bank|banque/banc,Baum|arbre,bedeuten|signifier,bei|chez/près de,Beispiel|exemple,bekommen|recevoir,besser|meilleur,Bett|lit,Bild|image,billig|bon marché,bis|jusqu'à,bitte|s'il vous plaît,bleiben|rester,Blatt|feuille,Blume|fleur,Blut|sang,Boden|sol/plancher,Brot|pain,Bruder|frère,Buch|livre,Büro|bureau,da|là/car,danke|merci,dann|ensuite,das|le/la/ça,dass|que,denken|penser,der|le/la,deutsch|allemand,die|les/la/le,Ding|chose,direkt|direct,doch|pourtant/si,Dorf|village,dort|là-bas,drei|trois,du|tu,durch|par/à travers,dürfen|avoir le droit de,einfach|simple/facile,ein|un/une,einige|quelques,Ende|fin,Erde|terre,Essen|repas/manger,etwas|quelque chose,fahren|conduire/aller,falsch|faux,Familie|famille,Farbe|couleur,fast|presque,Feuer|feu,finden|trouver,Fisch|poisson,fragen|demander,Frau|femme/madame,frei|libre,Freude|joie,Freund|ami,Freundschaft|amitié,früh|tôt,Frühling|printemps,Garten|jardin,Gefühl|sentiment,Geist|esprit,Geld|argent,gehen|aller/marcher,gelb|jaune,Gemüse|légumes,genug|assez,Geschichte|histoire,Gesetz|loi,Gesicht|visage,gestern|hier,gesund|sain,Gewicht|poids,Glas|verre,glauben|croire,gleich|égal/tout de suite,Glück|bonheur/chance,Gott|dieu,grau|gris,Grenze|frontière,groß|grand,grün|vert,Gruppe|groupe,gut|bon/bien,haben|avoir,Haar|cheveux,Hafen|port,halb|demi,Hälfte|moitié,Hand|main,Haus|maison,Haut|peau,helfen|aider,Herbst|automne,Herr|monsieur,Herz|cœur,heute|aujourd'hui,hier|ici,Hilfe|aide,Himmel|ciel/paradis,hoch|haut,Holz|bois,hören|écouter,Hotel|hôtel,Hund|chien,Hunger|faim,ich|je,Idee|idée,ihr|elle/leur/vous,immer|toujours,in|dans/en,Insel|île,ja|oui,Jacke|veste/manteau,Jahr|an/année,jetzt|maintenant,jung|jeune,Katze|chat,kaufen|acheter,kein|aucun/pas de,Kind|enfant,Kirche|église,Kleid|robe,klein|petit,kommen|venir,können|pouvoir,Kopf|tête,Körper|corps,kosten|coûter,krank|malade,Krieg|guerre,Küche|cuisine,Kunst|art,kurz|court,Land|pays/terre,lang|long,langsam|lent,Lärm|bruit,lassen|laisser,Leben|vie/vivre,legen|poser,leicht|léger/facile,Lehrer|professeur,lernen|apprendre,lesen|lire,Licht|lumière,Liebe|amour,Lied|chanson,lieben|aimer,links|gauche,Lösung|solution,Luft|air,machen|faire,Macht|pouvoir,Mädchen|fille,Mann|homme/mari,Markt|marché,Medizin|médecine,Meer|mer,mehr|plus,mein|mon/ma,meinen|penser/croire,Mensch|personne,Milch|lait,mit|avec,Mittag|midi,Monat|mois,Mond|lune,morgen|demain/matin,Morgen|matin,müde|fatigué,Mund|bouche,Musik|musique,müssen|devoir,Mutter|mère,nach|après/vers,Nacht|nuit,Name|nom,Nase|nez,neben|à côté de,nein|non,neu|nouveau,nicht|ne pas,nichts|rien,noch|encore,Norden|nord,nur|seulement,ob|si (conditionnel),Obst|fruits,oder|ou,oft|souvent,ohne|sans,Ohr|oreille,öffnen|ouvrir,ändern|changer,Ordnung|ordre,Osten|est,Papier|papier,Pferd|cheval,Platz|place/siège,Problem|problème,recht|droit/raison,reden|parler,rechts|droite,rot|rouge,Ruhe|calme/repos,Sache|chose/affaire,sagen|dire,schlafen|dormir,schlecht|mauvais,Schmerz|douleur,schnell|rapide,Schuhe|chaussures,Schule|école,schwarz|noir,Schwester|sœur,schwer|lourd/difficile,sehen|voir,sehr|très,sein|être/son,Seite|côté/page,sich|se/soi,sie|elle/ils,Sinn|sens,singen|chanter,sitzen|être assis,Sohn|fils,Sommer|été,Sonne|soleil,Spiegel|miroir,Spiel|jeu,Sprache|langue,sprechen|parler,Stadt|ville,stehen|se tenir debout,Stein|pierre,Stimme|voix,Straße|rue/route,Strom|courant/électricité,Stunde|heure,Süden|sud,suchen|chercher,Tag|jour,Tisch|table,Tochter|fille,Tor|porte/but,tragen|porter,Traum|rêve,treffen|rencontrer,Treppe|escalier,trinken|boire,tun|faire,über|au-dessus/sur,Uhr|montre/heure,um|autour/à (heure),und|et,unter|sous,Vater|père,viel|beaucoup,Vogel|oiseau,von|de/par,vor|devant/avant,Wand|mur,Wasser|eau,Weg|chemin/route,weil|parce que,weiß|blanc,Welt|monde,wenn|quand/si,wer|qui,werden|devenir/être,Wetter|météo,wie|comment/comme,wieder|encore,Wind|vent,Winter|hiver,wissen|savoir,wo|où,Woche|semaine,wohnen|habiter,Wort|mot,wollen|vouloir,Zeit|temps,zeigen|montrer,Zimmer|chambre,zu|à/trop,Zukunft|avenir,zurück|retour/en arrière,zusammen|ensemble,zwischen|entre,zwei|deux,Zug|train,Bauch|ventre,Berg|montagne,heiß|chaud,kalt|froid,schön|beau/joli,teuer|cher/coûteux,brauchen|avoir besoin de,erklären|expliquer,fühlen|sentir/ressentir,halten|tenir/arrêter,kennen|connaître,laufen|courir/marcher,nehmen|prendre,schreiben|écrire,stellen|placer/poser,verstehen|comprendre,warten|attendre,zählen|compter,Bein|jambe,Brief|lettre,Dach|toit,Fenster|fenêtre,Finger|doigt,Flugzeug|avion,Fluss|fleuve/rivière,Frage|question,Freiheit|liberté,Schiff|bateau/navire,Wald|forêt,Schnee|neige,Regen|pluie,Tier|animal,Eltern|parents,Oma|grand-mère,Opa|grand-père,Onkel|oncle,Tante|tante,Cousin|cousin,Nachbar|voisin,aufgeregt|excité,dankbar|reconnaissant,stolz|fier,eifersüchtig|jaloux,gelangweilt|ennuyé,besorgt|inquiet,zufrieden|satisfait,einsam|solitaire,Kultur|culture,Sport|sport,Frühstück|petit-déjeuner,Kaffee|café,Tee|thé,Schokolade|chocolat,Sofa|canapé,Schrank|armoire,Strand|plage,See|lac,Tal|vallée,Gewitter|orage,Blitz|éclair,Nebel|brouillard";
const ES_RAW="ser|être,estar|être (état),tener|avoir,hacer|faire,ir|aller,decir|dire,poder|pouvoir,querer|vouloir/aimer,saber|savoir,llegar|arriver,ver|voir,dar|donner,pasar|passer,deber|devoir,poner|mettre,parecer|sembler,quedar|rester,creer|croire,hablar|parler,llevar|porter,dejar|laisser,seguir|suivre,encontrar|trouver,llamar|appeler,venir|venir,pensar|penser,salir|sortir,volver|revenir,tomar|prendre/boire,conocer|connaître,vivir|vivre,sentir|sentir,mirar|regarder,empezar|commencer,esperar|attendre/espérer,buscar|chercher,trabajar|travailler,escribir|écrire,perder|perdre,entender|comprendre,pedir|demander,recibir|recevoir,cambiar|changer,ganar|gagner,morir|mourir,necesitar|avoir besoin de,leer|lire,recordar|se souvenir,usar|utiliser,escuchar|écouter,decidir|décider,terminar|terminer,correr|courir,dormir|dormir,comer|manger,beber|boire,abrir|ouvrir,cerrar|fermer,ayudar|aider,comprar|acheter,aprender|apprendre,nadar|nager,cocinar|cuisiner,reír|rire,llorar|pleurer,lavar|laver,limpiar|nettoyer,construir|construire,vender|vendre,enseñar|enseigner,jugar|jouer,pagar|payer,responder|répondre,crecer|grandir,amar|aimer,mostrar|montrer,crear|créer,mantener|maintenir,permitir|permettre,añadir|ajouter,cortar|couper,casa|maison,hombre|homme,mujer|femme,niño|enfant,agua|eau,tiempo|temps/météo,año|an/année,vida|vie,día|jour,cosa|chose,mano|main,vez|fois,mundo|monde,país|pays,parte|partie,lugar|endroit,ciudad|ville,persona|personne,trabajo|travail,momento|moment,nombre|nom,familia|famille,historia|histoire,noche|nuit,amor|amour,madre|mère,padre|père,hijo|fils,hija|fille,hermano|frère,hermana|sœur,amigo|ami,gobierno|gouvernement,libro|livre,ley|loi,sociedad|société,sistema|système,problema|problème,guerra|guerre,color|couleur,cuerpo|corps,cabeza|tête,ojo|œil,boca|bouche,pie|pied,corazón|cœur,sangre|sang,comida|nourriture,pan|pain,leche|lait,vino|vin,carne|viande,puerta|porte,ventana|fenêtre,mesa|table,silla|chaise,cama|lit,cocina|cuisine,calle|rue,camino|chemin,mar|mer,río|rivière,montaña|montagne,árbol|arbre,flor|fleur,sol|soleil,luna|lune,tierra|terre,cielo|ciel,aire|air,fuego|feu,nieve|neige,lluvia|pluie,viento|vent,animal|animal,perro|chien,gato|chat,pájaro|oiseau,pez|poisson,caballo|cheval,dinero|argent,precio|prix,tienda|boutique,mercado|marché,escuela|école,hospital|hôpital,iglesia|église,parque|parc,jardín|jardin,playa|plage,bosque|forêt,campo|champ,barco|bateau,avión|avion,tren|train,coche|voiture,puente|pont,nube|nuage,piedra|pierre,hierba|herbe,madera|bois,papel|papier,ropa|vêtements,zapatos|chaussures,música|musique,deporte|sport,regalo|cadeau,bueno|bon,malo|mauvais,grande|grand,pequeño|petit,nuevo|nouveau,viejo|vieux,alto|haut,bajo|bas,mucho|beaucoup,poco|peu,bien|bien,más|plus,menos|menos,muy|très,todo|tout,mismo|même,otro|autre,cada|chaque,solo|seul,también|aussi,donde|où,cuando|quand,como|comment/comme,porque|parce que,pero|mais,no|non,sí|oui,ahora|maintenant,hoy|aujourd'hui,mañana|demain,ayer|hier,aquí|ici,siempre|toujours,nunca|jamais,rojo|rouge,azul|bleu,verde|vert,negro|noir,blanco|blanc,amarillo|jaune,feliz|heureux,triste|triste,cansado|fatigué,enfermo|malade,libre|libre,rápido|rapide,lento|lent,joven|jeune,nariz|nez,pierna|jambe,brazo|bras,dedo|doigt,arroz|riz,queso|fromage,huevo|œuf,fruta|fruit,verdura|légume,sopa|soupe,café|café,azúcar|sucre,insecto|insecte,vaca|vache,desayuno|petit-déjeuner,abuelo|grand-père,abuela|grand-mère,tío|oncle,tía|tante,vecino|voisin,cultura|culture,empresa|entreprise,orgulloso|fier,celoso|jaloux,agradecido|reconnaissant,satisfecho|satisfait,preocupado|inquiet,emocionado|excité,aburrido|ennuyé,lago|lac,valle|vallée,tormenta|orage,relámpago|éclair,niebla|brouillard,tecnología|technologie,internet|internet,teléfono|téléphone,ordenador|ordinateur";
const IT_RAW="essere|être,avere|avoir,fare|faire,dire|dire,andare|aller,sapere|savoir,volere|vouloir,potere|pouvoir,venire|venir,stare|rester/être,dare|donner,vedere|voir,dovere|devoir,parlare|parler,mettere|mettre,sentire|sentir/écouter,trovare|trouver,lasciare|laisser,prendere|prendre,portare|porter,conoscere|connaître,credere|croire,chiedere|demander,mangiare|manger,bere|boire,dormire|dormir,lavorare|travailler,capire|comprendre,aprire|ouvrir,chiudere|fermer,leggere|lire,scrivere|écrire,vivere|vivre,aspettare|attendre,cercare|chercher,ricordare|se souvenir,tornare|retourner,cambiare|changer,pensare|penser,cominciare|commencer,finire|finir,guardare|regarder,aiutare|aider,amare|aimer,usare|utiliser,rispondere|répondre,giocare|jouer,correre|courir,comprare|acheter,imparare|apprendre,perdere|perdre,creare|créer,decidere|décider,cadere|tomber,crescere|grandir,nuotare|nager,cucinare|cuisiner,ridere|rire,piangere|pleurer,tagliare|couper,pulire|nettoyer,lavare|laver,costruire|construire,riempire|remplir,vendere|vendre,insegnare|enseigner,pagare|payer,toccare|toucher,raggiungere|atteindre,offrire|offrir,scegliere|choisir,casa|maison,uomo|homme,donna|femme,bambino|enfant,acqua|eau,tempo|temps/météo,anno|an/année,vita|vie,giorno|jour,cosa|chose,mano|main,volta|fois,mondo|monde,paese|pays/village,parte|partie,posto|endroit,città|ville,persona|personne,lavoro|travail,momento|moment,nome|nom,famiglia|famille,storia|histoire,notte|nuit,amore|amour,madre|mère,padre|père,figlio|fils,figlia|fille,fratello|frère,sorella|sœur,amico|ami,governo|gouvernement,libro|livre,legge|loi,società|société,sistema|système,problema|problème,guerra|guerre,colore|couleur,corpo|corps,testa|tête,occhio|œil,bocca|bouche,piede|pied,cuore|cœur,sangue|sang,cibo|nourriture,pane|pain,latte|lait,vino|vin,carne|viande,porta|porte,finestra|fenêtre,tavolo|table,sedia|chaise,letto|lit,cucina|cuisine,strada|rue/route,mare|mer,fiume|rivière,montagna|montagne,albero|arbre,fiore|fleur,sole|soleil,luna|lune,terra|terre,cielo|ciel,aria|air,fuoco|feu,neve|neige,pioggia|pluie,vento|vento,animale|animal,cane|chien,gatto|chat,uccello|oiseau,pesce|poisson,cavallo|cheval,denaro|argent,prezzo|prix,negozio|magasin,mercato|marché,scuola|école,ospedale|hôpital,chiesa|chiesa,parco|parc,giardino|jardin,spiaggia|plage,foresta|forêt,campo|champ,nave|bateau,aereo|avion,treno|train,macchina|voiture,ponte|pont,nuvola|nuage,pietra|pierre,erba|erbe,legno|bois,carta|papier,vestiti|vêtements,scarpe|chaussures,musica|musique,sport|sport,regalo|cadeau,buono|bon,cattivo|mauvais,grande|grand,piccolo|petit,nuovo|nouveau,vecchio|vieux,alto|haut,basso|bas,molto|beaucoup,poco|peu,bene|bien,più|plus,tutto|tout,stesso|même,altro|autre,ogni|chaque,solo|seul,anche|aussi,dove|où,quando|quand,come|comment/comme,perché|parce que,ma|mais,no|non,sì|oui,adesso|maintenant,oggi|aujourd'hui,domani|demain,ieri|hier,qui|ici,sempre|toujours,mai|jamais,rosso|rouge,blu|bleu,verde|vert,nero|noir,bianco|blanc,giallo|jaune,felice|heureux,triste|triste,stanco|fatigué,malato|malade,libero|libre,veloce|rapide,lento|lent,giovane|jeune,naso|nez,gamba|gambe,braccio|bras,dito|doigt,riso|riz,formaggio|fromage,uovo|œuf,frutta|fruit,verdura|légume,zuppa|soupe,caffè|café,zucchero|sucre,nonno|grand-père,nonna|grand-mère,zio|oncle,zia|tante,vicino|voisin,colazione|petit-déjeuner,cultura|culture,tecnologia|technologie,internet|internet,telefono|téléphone,lago|lac,valle|vallée,temporale|orage,fulmine|éclair,nebbia|brouillard,orgoglioso|fier,geloso|jaloux,grato|reconnaissant,soddisfatto|satisfait,preoccupato|inquiet,emozionato|excité,annoiato|ennuyé";

const dedup=a=>{const s=new Set();return a.filter(([k])=>s.has(k)?false:(s.add(k),true));};
const WORDS={en:dedup(pw(EN_RAW)),de:dedup(pw(DE_RAW)),es:dedup(pw(ES_RAW)),it:dedup(pw(IT_RAW))};
const LANG_INFO={en:{flag:"🇬🇧",label:"Anglais"},de:{flag:"🇩🇪",label:"Allemand"},es:{flag:"🇪🇸",label:"Espagnol"},it:{flag:"🇮🇹",label:"Italien"}};
function weightedPick(pool,rs,ex){const src=ex&&pool.length>1?pool.filter(([w])=>w!==ex):pool;const wts=src.map(([w])=>{const r=rs[w];return r==null?120:Math.max(4,104-r);});const tot=wts.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<src.length;i++){r-=wts[i];if(r<=0)return src[i];}return src[src.length-1];}
const SK="blang_v7";
const mkL=()=>({xp:0,coins:0,rawScores:{},equipped:{theme:"default",skin:"default"},inventory:[],quests:{date:"",progress:{},done:[]},weeklyQuests:{week:"",progress:{},done:[]}});
const DEF={uuid:null,pseudo:null,langs:{en:mkL(),de:mkL(),es:mkL(),it:mkL()},badges:[]};

// ── SVG COMPONENTS ────────────────────────────────────────────────────────
function CoinIcon({size=16}){return(<svg width={size} height={size} viewBox="0 0 32 32" style={{flexShrink:0,display:"inline-block",verticalAlign:"middle"}}>
  <defs><radialGradient id="ciRg" cx="35%" cy="28%"><stop offset="0%" stopColor="#fffde7"/><stop offset="38%" stopColor="#ffd700"/><stop offset="80%" stopColor="#e69000"/><stop offset="100%" stopColor="#b06000"/></radialGradient></defs>
  <circle cx="16" cy="16.5" r="14.5" fill="#6a3c00" opacity="0.35"/>
  <circle cx="16" cy="16" r="14" fill="url(#ciRg)" stroke="#b07000" strokeWidth="1"/>
  <circle cx="16" cy="16" r="11.8" fill="none" stroke="rgba(255,245,80,0.22)" strokeWidth="0.8"/>
  <polygon points="16,9 17.8,13.6 22.7,13.8 18.9,16.9 20.1,21.7 16,19 11.9,21.7 13.1,16.9 9.3,13.8 14.2,13.6" fill="rgba(110,55,0,0.58)" stroke="rgba(255,210,40,0.42)" strokeWidth="0.5"/>
  <ellipse cx="10.5" cy="9.5" rx="5" ry="2.8" fill="rgba(255,255,200,0.32)" transform="rotate(-35,10.5,9.5)"/>
</svg>);}

function RankBadge({rank,size=48,opacity=1}){
  const r=rank,s=size;
  const gid="rg"+r.id+s,fid="rf"+r.id+s;
  const gb=({wood:4,bronze:6,silver:7,gold:11,diamond:15,plat:17,solar:22}as Record<string,number>)[r.baseId]||4;
  const subXs=r.sub===1?[30]:r.sub===2?[23,37]:r.sub===3?[16,30,44]:[];
  const dots=subXs.map((x:number,i:number)=><circle key={i} cx={x} cy={62} r="3.2" fill={r.ss} stroke="rgba(0,0,0,0.5)" strokeWidth="0.8" opacity="0.9"/>);
  const G=`url(#${gid})`;
  let body:JSX.Element;
  if(r.baseId==="wood"){body=(<g>
    <path d="M30,5 L52,12 L56,36 L30,58 L4,36 L8,12 Z" fill={r.glow} filter={`url(#${fid})`} opacity="0.5"/>
    <path d="M30,5 L52,12 L56,36 L30,58 L4,36 L8,12 Z" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <path d="M30,9 L49,15 L52,35 L30,54 L8,35 L11,15 Z" fill="none" stroke={r.ss} strokeWidth="0.7" opacity="0.35"/>
    <line x1="19" y1="22" x2="41" y2="22" stroke={r.ss} strokeWidth="0.7" opacity="0.3"/>
    <line x1="17" y1="29" x2="43" y2="29" stroke={r.ss} strokeWidth="0.7" opacity="0.3"/>
    <line x1="19" y1="36" x2="41" y2="36" stroke={r.ss} strokeWidth="0.7" opacity="0.3"/>
    <path d="M17,10 Q30,7 43,10 L45,16 Q30,13 15,16 Z" fill="rgba(255,255,255,0.15)"/>
  </g>);}
  else if(r.baseId==="bronze"){body=(<g>
    <circle cx="30" cy="30" r="24" fill={r.glow} filter={`url(#${fid})`} opacity="0.65"/>
    <circle cx="30" cy="30" r="25" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    {Array.from({length:12}).map((_,i)=>{const a=i*30*Math.PI/180;return(<line key={i} x1={30+21*Math.cos(a)} y1={30+21*Math.sin(a)} x2={30+25.5*Math.cos(a)} y2={30+25.5*Math.sin(a)} stroke={r.ss} strokeWidth="1" opacity="0.55"/>);})}
    <circle cx="30" cy="30" r="18" fill={r.si} stroke={r.ss} strokeWidth="0.9" opacity="0.75"/>
    <circle cx="30" cy="30" r="12" fill="none" stroke={r.ss} strokeWidth="1.2" opacity="0.45"/>
    <circle cx="30" cy="30" r="5.5" fill={r.sf} opacity="0.7"/>
    <circle cx="30" cy="30" r="2.5" fill="rgba(255,255,255,0.45)"/>
    <path d="M16,14 Q30,10 44,14" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </g>);}
  else if(r.baseId==="silver"){body=(<g>
    <polygon points="30,3 52,15 52,45 30,57 8,45 8,15" fill={r.glow} filter={`url(#${fid})`} opacity="0.45"/>
    <polygon points="30,3 52,15 52,45 30,57 8,45 8,15" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <polygon points="30,9 47,18.5 47,41.5 30,51 13,41.5 13,18.5" fill="none" stroke={r.ss} strokeWidth="0.8" opacity="0.38"/>
    <line x1="30" y1="3" x2="30" y2="57" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7"/>
    <line x1="8" y1="15" x2="52" y2="45" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
    <line x1="52" y1="15" x2="8" y2="45" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7"/>
    <path d="M13,16 Q30,10 47,16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </g>);}
  else if(r.baseId==="gold"){body=(<g>
    <path d="M6,46 L6,30 L14,36 L22,18 L30,10 L38,18 L46,36 L54,30 L54,46 Z" fill={r.glow} filter={`url(#${fid})`} opacity="0.75"/>
    <path d="M6,46 L6,30 L14,36 L22,18 L30,10 L38,18 L46,36 L54,30 L54,46 Z" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <rect x="6" y="40" width="48" height="6" rx="1" fill={r.si} stroke={r.sf} strokeWidth="0.8" opacity="0.8"/>
    <circle cx="30" cy="9.5" r="3.5" fill="#88EEFF" stroke={r.ss} strokeWidth="0.8" opacity="0.9"/>
    <circle cx="21.5" cy="17.5" r="2.5" fill="#FF88AA" stroke={r.ss} strokeWidth="0.7" opacity="0.85"/>
    <circle cx="38.5" cy="17.5" r="2.5" fill="#AAFFBB" stroke={r.ss} strokeWidth="0.7" opacity="0.85"/>
    <rect x="10" y="41.5" width="40" height="3" rx="0.5" fill="rgba(255,255,255,0.12)"/>
    <path d="M8,31 Q16,26 24,21" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </g>);}
  else if(r.baseId==="diamond"){body=(<g>
    <polygon points="30,2 54,27 30,58 6,27" fill={r.glow} filter={`url(#${fid})`} opacity="0.7"/>
    <polygon points="30,2 54,27 30,58 6,27" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <line x1="30" y1="2" x2="30" y2="58" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
    <line x1="6" y1="27" x2="54" y2="27" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
    <line x1="30" y1="2" x2="6" y2="27" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7"/>
    <line x1="30" y1="2" x2="54" y2="27" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7"/>
    <line x1="6" y1="27" x2="30" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>
    <line x1="54" y1="27" x2="30" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>
    <polygon points="30,2 40,14 30,18 20,14" fill="rgba(255,255,255,0.28)"/>
    <polygon points="30,2 54,27 44,22" fill="rgba(255,255,255,0.1)"/>
    <polygon points="30,2 6,27 16,22" fill="rgba(255,255,255,0.14)"/>
  </g>);}
  else if(r.baseId==="plat"){body=(<g>
    <polygon points="30,4 34,19 48,11 40,25 55,29 40,33 48,47 34,39 30,54 26,39 12,47 20,33 5,29 20,25 12,11 26,19" fill={r.glow} filter={`url(#${fid})`} opacity="0.7"/>
    <polygon points="30,4 34,19 48,11 40,25 55,29 40,33 48,47 34,39 30,54 26,39 12,47 20,33 5,29 20,25 12,11 26,19" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <polygon points="30,15 34,25 44,29 34,33 30,43 26,33 16,29 26,25" fill="none" stroke={r.ss} strokeWidth="0.9" opacity="0.5"/>
    <circle cx="30" cy="29" r="5" fill={r.ss} opacity="0.55"/>
    <circle cx="30" cy="29" r="2.5" fill="rgba(255,255,255,0.55)"/>
    <path d="M13,12 Q21,7 30,5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </g>);}
  else{body=(<g>
    <circle cx="30" cy="26" r="26" fill={r.glow} filter={`url(#${fid})`} opacity="0.8"/>
    {Array.from({length:12}).map((_,i)=>{const a=(i*30-90)*Math.PI/180,isLong=i%2===0,r1=22,r2=isLong?33:27;return(<line key={i} x1={30+r1*Math.cos(a)} y1={26+r1*Math.sin(a)} x2={30+r2*Math.cos(a)} y2={26+r2*Math.sin(a)} stroke={r.ss} strokeWidth={isLong?2.5:1.8} strokeLinecap="round" opacity={isLong?0.95:0.75}/>);})}
    <circle cx="30" cy="26" r="21" fill={G} stroke={r.sf} strokeWidth="1.5"/>
    <circle cx="30" cy="26" r="15" fill="none" stroke={r.ss} strokeWidth="0.8" opacity="0.4"/>
    {Array.from({length:6}).map((_,i)=>{const a=(i*60-90)*Math.PI/180;return(<line key={i} x1="30" y1="26" x2={30+13*Math.cos(a)} y2={26+13*Math.sin(a)} stroke={r.ss} strokeWidth="0.7" opacity="0.25"/>);})}
    <circle cx="30" cy="26" r="7" fill={r.ss} opacity="0.45"/>
    <circle cx="30" cy="26" r="3" fill="rgba(255,255,255,0.7)"/>
    <path d="M17,12 Q30,7 43,12" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </g>);}
  return(<svg width={s} height={s*1.1} viewBox="0 0 60 66" style={{opacity,flexShrink:0,overflow:"visible"}}>
    <defs>
      <radialGradient id={gid} cx="35%" cy="30%"><stop offset="0%" stopColor={r.ss}/><stop offset="55%" stopColor={r.sf}/><stop offset="100%" stopColor={r.si}/></radialGradient>
      <filter id={fid} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation={gb}/></filter>
    </defs>
    {body}{dots}
  </svg>);
}

function ChestSVG({level,type,size=56}){const c={wood:{body:"#4a1e08",lid:"#7a3510",band:"#cd7f32",lock:"#e8a050"},gold:{body:"#6b4800",lid:"#aa7700",band:"#ffd700",lock:"#fff59d"},leg:{body:"#1a0030",lid:"#3d0070",band:"#9b00ff",lock:"#cc88ff"}}[level]||{body:"#333",lid:"#555",band:"#888",lock:"#aaa"};const tc=type==="theme"?"#4ecdc4":"#ff9966";return(<svg width={size} height={size} viewBox="0 0 60 60"><rect x="4" y="30" width="52" height="22" rx="4" fill={c.body} stroke={c.band} strokeWidth="1.5"/><path d="M4 20 Q4 12 30 12 Q56 12 56 20 L56 32 L4 32 Z" fill={c.lid} stroke={c.band} strokeWidth="1.5"/><rect x="4" y="30" width="52" height="4" fill={c.band} opacity=".65"/><rect x="25" y="12" width="3.5" height="40" fill={c.band} opacity=".2"/><rect x="31" y="12" width="3.5" height="40" fill={c.band} opacity=".2"/><rect x="22" y="33" width="16" height="10" rx="2" fill={c.band}/><circle cx="30" cy="37" r="3" fill={c.lock}/><ellipse cx="18" cy="18" rx="8" ry="3.5" fill="rgba(255,255,255,.18)"/><text x="30" y="27" textAnchor="middle" fontSize="9" fill={tc} fontWeight="900" fontFamily="Arial">{type==="theme"?"DA":"SK"}</text></svg>);}


function ThemeIcon({k,th,size=36}){
  const s=size,acc=th.acc;
  const shapes={
    default:()=>[<circle key="o" cx={s*.5} cy={s*.5} r={s*.3} fill="none" stroke={acc} strokeWidth=".8" opacity=".6"/>,...[0,60,120,180,240,300].map(a=>{const r=a*Math.PI/180;return<circle key={a} cx={s*.5+s*.28*Math.cos(r)} cy={s*.5+s*.28*Math.sin(r)} r=".9" fill={acc} opacity=".8"/>})],
    zen:()=>[<path key="w" d={`M${s*.08},${s*.65}C${s*.25},${s*.35} ${s*.45},${s*.55} ${s*.5},${s*.45}S${s*.75},${s*.3} ${s*.92},${s*.5}`} fill="none" stroke={acc} strokeWidth="1.3" strokeLinecap="round" opacity=".85"/>,<circle key="c" cx={s*.5} cy={s*.45} r="1.5" fill={acc} opacity=".9"/>],
    arctic:()=>[0,30,60].flatMap(a=>{const r=a*Math.PI/180,l=s*.38,cx=s*.5,cy=s*.5;return[<line key={"p"+a} x1={cx} y1={cy} x2={cx+l*Math.cos(r)} y2={cy+l*Math.sin(r)} stroke={acc} strokeWidth=".9" opacity=".8"/>,<line key={"n"+a} x1={cx} y1={cy} x2={cx-l*Math.cos(r)} y2={cy-l*Math.sin(r)} stroke={acc} strokeWidth=".9" opacity=".8"/>]}),
    sakura:()=>[...[0,72,144,216,288].map(a=>{const r=a*Math.PI/180,cx=s*.5+s*.22*Math.cos(r),cy=s*.5+s*.22*Math.sin(r);return<ellipse key={a} cx={cx} cy={cy} rx={s*.1} ry={s*.065} fill={acc} opacity=".75" transform={`rotate(${a},${cx},${cy})`}/>}),<circle key="c" cx={s*.5} cy={s*.5} r={s*.07} fill="#ffccdd"/>],
    desert:()=>[<path key="d" d={`M${s*.05},${s*.72}Q${s*.25},${s*.45}${s*.5},${s*.58}T${s*.95},${s*.48}`} fill="none" stroke={acc} strokeWidth="1.2" opacity=".75" strokeLinecap="round"/>,<circle key="s" cx={s*.72} cy={s*.28} r={s*.09} fill={acc} opacity=".55"/>],
    abyss:()=>[...[[s*.2,s*.38],[s*.5,s*.52],[s*.78,s*.32]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={s*.06+i*s*.01} fill="none" stroke={acc} strokeWidth=".8" opacity=".8"/>),<path key="w" d={`M${s*.08},${s*.72}Q${s*.38},${s*.58}${s*.62},${s*.68}T${s*.92},${s*.62}`} fill="none" stroke={acc} strokeWidth=".8" opacity=".45"/>],
    pixel:()=>{const c=[];for(let px=0;px<3;px++)for(let py=0;py<3;py++)if((px+py)%2===0)c.push(<rect key={px*3+py} x={s*.18+px*s*.22} y={s*.18+py*s*.22} width={s*.19} height={s*.19} fill={acc} opacity={.5+py*.15}/>);return c;},
    jungle:()=>[<path key="v" d={`M${s*.5},${s*.88}L${s*.5},${s*.28}M${s*.5},${s*.48}L${s*.24},${s*.33}M${s*.5},${s*.62}L${s*.76},${s*.47}`} stroke={acc} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".85"/>],
    volcano:()=>[<path key="m" d={`M${s*.08},${s*.85}L${s*.5},${s*.22}L${s*.92},${s*.85}Z`} fill="none" stroke={acc} strokeWidth="1.2" opacity=".7"/>,<path key="f" d={`M${s*.44},${s*.22}C${s*.4},${s*.1}${s*.56},${s*.08}${s*.5},${s*.18}`} stroke="#ff5500" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".9"/>],
    steam:()=>[<circle key="g" cx={s*.5} cy={s*.55} r={s*.24} fill="none" stroke={acc} strokeWidth="1.1" opacity=".7"/>,<rect key="r" x={s*.43} y={s*.48} width={s*.14} height={s*.14} fill={acc} opacity=".55"/>,<line key="h1" x1={s*.26} y1={s*.55} x2={s*.36} y2={s*.55} stroke={acc} strokeWidth="1.1" opacity=".7"/>,<line key="h2" x1={s*.64} y1={s*.55} x2={s*.74} y2={s*.55} stroke={acc} strokeWidth="1.1" opacity=".7"/>],
    cyber:()=>[<rect key="b" x={s*.12} y={s*.38} width={s*.76} height={s*.3} rx="2.5" fill="none" stroke={acc} strokeWidth=".9" opacity=".65"/>,<line key="l1" x1={s*.22} y1={s*.28} x2={s*.38} y2={s*.28} stroke={acc} strokeWidth=".9" opacity=".8"/>,<line key="l2" x1={s*.38} y1={s*.28} x2={s*.38} y2={s*.38} stroke={acc} strokeWidth=".9" opacity=".8"/>,<circle key="d" cx={s*.65} cy={s*.53} r={s*.06} fill={acc} opacity=".9"/>],
    scriptorium:()=>[<line key="l1" x1={s*.12} y1={s*.33} x2={s*.88} y2={s*.33} stroke={acc} strokeWidth=".8" opacity=".6"/>,<line key="l2" x1={s*.12} y1={s*.48} x2={s*.88} y2={s*.48} stroke={acc} strokeWidth=".8" opacity=".6"/>,<line key="l3" x1={s*.12} y1={s*.63} x2={s*.72} y2={s*.63} stroke={acc} strokeWidth=".8" opacity=".6"/>,<path key="q" d={`M${s*.12},${s*.24}C${s*.18},${s*.12}${s*.32},${s*.12}${s*.32},${s*.24}`} fill="none" stroke={acc} strokeWidth="1.2" opacity=".8"/>],
    cosmos:()=>[...[[s*.28,s*.32],[s*.52,s*.62],[s*.72,s*.38],[s*.18,s*.68],[s*.82,s*.58]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={i%2===0?"1.3":".8"} fill={acc} opacity={.6+i*.08}/>),<ellipse key="e" cx={s*.5} cy={s*.5} rx={s*.36} ry={s*.14} fill="none" stroke={acc} strokeWidth=".8" opacity=".4" transform={`rotate(-18,${s*.5},${s*.5})`}/>],
    spectre:()=>[<path key="g" d={`M${s*.33},${s*.82}L${s*.33},${s*.38}Q${s*.33},${s*.22}${s*.5},${s*.22}Q${s*.67},${s*.22}${s*.67},${s*.38}L${s*.67},${s*.82}L${s*.58},${s*.72}L${s*.5},${s*.82}L${s*.42},${s*.72}Z`} fill={acc} opacity=".45" stroke={acc} strokeWidth=".7"/>],
    royal:()=>[<path key="c" d={`M${s*.22},${s*.62}L${s*.22},${s*.44}L${s*.34},${s*.33}L${s*.5},${s*.41}L${s*.66},${s*.33}L${s*.78},${s*.44}L${s*.78},${s*.62}Z`} fill="none" stroke={acc} strokeWidth="1.3" opacity=".85"/>,<circle key="j" cx={s*.5} cy={s*.37} r={s*.055} fill={acc} opacity=".9"/>],
    bloodmoon:()=>[<circle key="m" cx={s*.5} cy={s*.48} r={s*.32} fill="none" stroke={acc} strokeWidth="1.3" opacity=".8"/>,<path key="b" d={`M${s*.5},${s*.16}A${s*.32},${s*.32} 0 0 1 ${s*.5},${s*.8}`} fill={acc} opacity=".25"/>],
    arcane:()=>[<polygon key="c" points={[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180,d=a%90===0?s*.36:s*.21;return`${s*.5+d*Math.cos(r)},${s*.5+d*Math.sin(r)}`;}).join(" ")} fill="none" stroke={acc} strokeWidth=".9" opacity=".75"/>],
    void_th:()=>[<circle key="o" cx={s*.5} cy={s*.5} r={s*.34} fill="none" stroke={acc} strokeWidth="1.5" opacity=".6"/>,<circle key="i" cx={s*.5} cy={s*.5} r={s*.14} fill={acc} opacity=".4"/>],
    prism:()=>[<polygon key="t" points={`${s*.5},${s*.13} ${s*.87},${s*.82} ${s*.13},${s*.82}`} fill="none" stroke={acc} strokeWidth=".9" opacity=".7"/>,<line key="r" x1={s*.5} y1={s*.82} x2={s*.5} y2={s*.13} stroke="rgba(255,80,80,.55)" strokeWidth=".6"/>,<line key="g2" x1={s*.5} y1={s*.82} x2={s*.87} y2={s*.82} stroke="rgba(80,255,80,.55)" strokeWidth=".6"/>,<line key="b2" x1={s*.13} y1={s*.82} x2={s*.5} y2={s*.82} stroke="rgba(80,80,255,.55)" strokeWidth=".6"/>],
    nexus:()=>[<text key="t" x={s*.5} y={s*.62} textAnchor="middle" fontSize={s*.36} fill={acc} fontWeight="900" opacity=".9">!</text>,<rect key="b" x={s*.08} y={s*.08} width={s*.84} height={s*.84} rx="3" fill="none" stroke={acc} strokeWidth=".9" opacity=".65" strokeDasharray="3,2"/>],
  };
  return(<svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{flexShrink:0,borderRadius:7,border:`2px solid ${acc}55`}}><rect width={s} height={s} rx="5" fill={th.bg}/><rect width={s} height={s} rx="5" fill={th.surf} opacity=".5"/>{(shapes[k]||shapes.default)()}</svg>);
}

function StreakBorderFlames({streak}){
  const flames=useMemo(()=>{
    if(streak<5)return[];
    const t=Math.min(1,streak/100);
    const n=Math.floor(6+t*22);
    return Array.from({length:n},(_,i)=>{
      const sd=((i*1664525)^(streak*31337))>>>0;
      const r1=(sd&0xfff)/0xfff,r2=((sd>>12)&0xfff)/0xfff,r3=((sd>>24)&0xff)/0xff;
      const side=streak>=50?(i%3===0?1:i%3===1?2:0):0;
      return{x:5+r1*90,h:Math.round(38+t*(45+r2*200)),w:Math.round(18+t*16),dur:0.45+r3*0.9,delay:r1*1.8,side,idx:i};
    });
  },[streak]);
  if(streak<5)return null;
  const t=Math.min(1,streak/100),si=Math.min(1,streak/500);
  const c1=streak<15?"#e67e22":streak<50?"#e74c3c":streak<200?"#c0392b":"#8e44ad";
  const c2=streak<15?"#f39c12":streak<50?"#e74c3c":streak<200?"#e74c3c":"#c0392b";
  const c3=streak<100?"#ffe100":"#ff4400";
  const vig=streak>=100?`radial-gradient(ellipse at center,transparent ${Math.round(88-si*45)}%,rgba(${streak>=500?"120,0,60":"180,0,0"},${(si*.65).toFixed(2)}) 100%)`:null;
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:10,overflow:"hidden"}}>
      {vig&&<div style={{position:"absolute",inset:0,background:vig,zIndex:2}}/>}
      {flames.map((f)=>{
        const base={position:"absolute" as const,width:f.w,height:f.h,zIndex:1,animation:`flameRise ${f.dur}s ${f.delay}s ease-in-out infinite alternate`};
        const pos=f.side===0?{bottom:0,left:`${f.x}%`}:f.side===1?{left:0,bottom:`${f.x}%`,transform:`rotate(90deg) translateY(-${f.w}px)`,transformOrigin:"bottom left"}:{right:0,bottom:`${f.x}%`,transform:`rotate(-90deg) translateY(${f.w}px)`,transformOrigin:"bottom right"};
        return(
          <div key={f.idx} style={{...base,...pos}}>
            <svg width="100%" height="100%" viewBox="0 0 20 60" preserveAspectRatio="none">
              <path d={`M10,1C${8+f.idx%3},${12+f.idx%6}${4+f.idx%4},${24+f.idx%8}5,38C5,50,8,56,10,58C12,56,15,50,15,38C${16+f.idx%4},${24+f.idx%8}${12+f.idx%3},${12+f.idx%6}10,1Z`} fill={c1} opacity={0.55+si*0.35}/>
              <path d="M10,20C9,30,7,42,8,50C9,55,10,57,10,58C10,57,11,55,12,50C13,42,11,30,10,20Z" fill={c2} opacity={0.75+si*0.2}/>
              <path d="M10,40C9.5,48,10,55,10,58C10,55,10.5,48,10,40Z" fill={c3} opacity={0.88+si*0.1}/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

function Flame({streak}){if(!streak)return <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{fontSize:22,opacity:.2}}>🔥</span><span style={{color:"#333",fontSize:13,fontWeight:700}}>0</span></div>;const t=Math.min(1,streak/100),sz=22+t*28,ns=14+t*14;const cols=streak<5?["#f39c12","#e67e22"]:streak<15?["#e74c3c","#f39c12"]:streak<40?["#c0392b","#e74c3c","#f39c12","#ffe100"]:["#8e44ad","#c0392b","#e74c3c","#f39c12","#fff"];return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1,gap:1}}><span style={{fontSize:sz,lineHeight:1,filter:`drop-shadow(0 0 ${4+t*12}px ${cols[0]})`,transition:"all .3s",animation:streak>=5?"flamePulse .7s ease infinite alternate":"none"}}>🔥</span><span style={{fontSize:ns,fontWeight:900,background:`linear-gradient(180deg,${cols.join(",")})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:`drop-shadow(0 0 ${2+t*6}px ${cols[0]})`,transition:"all .3s",letterSpacing:-1}}>{streak}</span></div>);}
function ScoreBadge({raw,size=42,perfect=false}){const sc=getScore(raw),c=noteCol(sc);return(<div style={{width:size,height:size,borderRadius:"50%",border:`2.5px solid ${c}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,background:perfect?`radial-gradient(circle,${c}22,transparent)`:`${c}11`,boxShadow:perfect?`0 0 20px ${c},0 0 40px ${c}55`:`0 0 8px ${c}44`,transition:"all .4s"}}><span style={{color:c,fontSize:size*.26,fontWeight:800,lineHeight:1}}>{sc!==null?sc.toFixed(1):"–"}</span><span style={{color:c,fontSize:size*.18,lineHeight:1,opacity:.7}}>/10</span></div>);}
function ProgressHeader({ls,T}){const{rank,xIn,xNeed,isMax,pct,nextRank}=getRankInfo(ls.xp||0);const segs=20,filled=Math.round(pct/100*segs);return(<div style={{padding:"7px 12px",background:"rgba(0,0,0,0.35)",borderBottom:`1px solid ${T.brd}`,flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:10}}><RankBadge rank={rank} size={44}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{color:rank.col,fontSize:13,fontWeight:900,textShadow:`0 0 10px ${rank.col}88`}}>{rank.l}</span><span style={{color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:700}}>{isMax?"MAX ∞":`${xIn} / ${xNeed} XP`}</span></div><div style={{display:"flex",gap:2,padding:"2px",background:"rgba(0,0,0,0.3)",borderRadius:6}}>{Array.from({length:segs}).map((_,i)=>(<div key={i} style={{flex:1,height:10,borderRadius:2,background:i<filled?rank.col:"rgba(255,255,255,0.05)",boxShadow:i<filled?`0 0 4px ${rank.glow}`:"none",transition:"background .4s"}}/>))}</div></div>{nextRank&&<RankBadge rank={nextRank} size={24} opacity={.35}/>}<div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}><CoinIcon size={14}/><span style={{color:"#ffd700",fontSize:11,fontWeight:700}}>{ls.coins||0}</span></div></div></div>);}
function Particles(){const cvs=useRef(null);useEffect(()=>{const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");const pts=Array.from({length:28},()=>({x:Math.random()*600,y:Math.random()*800,r:.8+Math.random()*1.8,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,col:Math.random()<.5?`rgba(${180+~~(Math.random()*75)},0,60,`:`rgba(100,0,${160+~~(Math.random()*95)},`,a:.3+Math.random()*.5}));let af;const draw=()=>{c.width=c.offsetWidth||300;c.height=c.offsetHeight||600;ctx.clearRect(0,0,c.width,c.height);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>c.width)p.vx*=-1;if(p.y<0||p.y>c.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.col+p.a+")";ctx.fill();});af=requestAnimationFrame(draw);};draw();return()=>cancelAnimationFrame(af);},[]);return <canvas ref={cvs} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;}

// ── ROULETTE LOOT ─────────────────────────────────────────────────────────
function RouletteOpening({box,wonItem,onClose,alreadyOwned=false}){
  const [phase,setPhase]=useState("spin"); // spin | bounce | reveal
  const [spinPos,setSpinPos]=useState(0);
  const [finalIdx,setFinalIdx]=useState(0);
  const tickRef=useRef(null);
  const ITEM_W=88, VISIBLE=5, CENTER=Math.floor(VISIBLE/2);

  // Build extended reel: repeat pool several times + land on won item
  const reel=useMemo(()=>{
    const base=[...box.pool,...box.pool,...box.pool,...box.pool];
    // ensure wonItem is at a specific index near end
    const landIdx=base.length+1;
    const extended=[...base,wonItem,...box.pool];
    return extended;
  },[box]);

  const landIndex=useMemo(()=>{
    // find last occurrence of wonItem id
    for(let i=reel.length-1;i>=0;i--){if(reel[i].id===wonItem.id)return i;}
    return reel.length-1;
  },[reel,wonItem]);

  useEffect(()=>{
    SFX.loot();
    let speed=18, pos=0, ticks=0;
    const totalTicks=60+Math.floor(Math.random()*20);
    const targetPos=landIndex*ITEM_W;
    const interval=setInterval(()=>{
      ticks++;
      const progress=ticks/totalTicks;
      // ease out
      const easedSpeed=speed*Math.pow(1-progress,2.2);
      pos+=Math.max(1,easedSpeed);
      if(ticks%Math.max(1,Math.floor(easedSpeed/3))===0)SFX.rTick(progress);
      setSpinPos(pos);
      if(ticks>=totalTicks){
        clearInterval(interval);
        setSpinPos(targetPos);
        setPhase("bounce");
        const rarSfx:{[k:string]:()=>void}={commun:SFX.lootC,rare:SFX.lootR,super_rare:SFX.lootSR,epique:SFX.lootE,legendaire:SFX.lootL,secret:SFX.lootS};
        setTimeout(()=>{(rarSfx[wonItem.rar]||SFX.lootC)();setPhase("reveal");},350);
      }
    },30);
    tickRef.current=interval;
    return()=>clearInterval(interval);
  },[]);

  const rar=RARITY[wonItem.rar]||RARITY.commun;
  const isSecret=wonItem.secret&&phase!=="reveal";
  const displayName=wonItem.secret?(phase==="reveal"?wonItem.name:"???"):wonItem.name;
  const displayRar=wonItem.secret?(phase==="reveal"?rar:RARITY.secret):rar;

  return(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.97)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:250,flexDirection:"column",gap:14,padding:24}}>
      <div style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:2}}>{box.label}</div>
      {/* Roulette track */}
      <div style={{position:"relative",width:ITEM_W*VISIBLE,height:96,overflow:"hidden",borderRadius:12,border:`2px solid ${box.col}`,background:"rgba(0,0,0,0.5)"}}>
        {/* Center highlight */}
        <div style={{position:"absolute",left:ITEM_W*CENTER,top:0,width:ITEM_W,height:"100%",background:`${box.col}22`,border:`2px solid ${box.col}`,zIndex:2,pointerEvents:"none",borderRadius:4}}/>
        {/* Left/right fades */}
        <div style={{position:"absolute",left:0,top:0,width:60,height:"100%",background:"linear-gradient(90deg,rgba(0,0,0,0.8),transparent)",zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:0,top:0,width:60,height:"100%",background:"linear-gradient(-90deg,rgba(0,0,0,0.8),transparent)",zIndex:3,pointerEvents:"none"}}/>
        {/* Scrolling items */}
        <div style={{display:"flex",alignItems:"center",height:"100%",transform:`translateX(${-(spinPos%(reel.length*ITEM_W))+ITEM_W*CENTER}px)`,transition:phase==="bounce"?"transform 0.25s cubic-bezier(.4,2,.6,1)":"none",willChange:"transform"}}>
          {[...reel,...reel].map((item,i)=>{
            const r2=RARITY[item.rar]||RARITY.commun;
            return(
              <div key={i} style={{width:ITEM_W,flexShrink:0,height:84,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                {item.secret?
                  <div style={{width:44,height:44,borderRadius:8,background:"#0a0a0a",border:`1.5px solid ${r2.col}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22,color:r2.col,fontWeight:900}}>?</span></div>
                  :box.type==="skin"?(()=>{const sk=SKINS[item.id.replace("skin_","")]||SKINS.default;const Ovl=sk.ovl?SK_OVLS[sk.ovl]:null;return(<div style={{width:44,height:44,borderRadius:8,background:`linear-gradient(135deg,${sk.bg1},${sk.bg2})`,border:`1.5px solid ${r2.col}`,overflow:"hidden",position:"relative",flexShrink:0}}>{Ovl&&<Ovl/>}</div>);})()
                  :(()=>{const thk=item.id.replace("theme_","");const th=THEMES[thk]||THEMES.default;return<ThemeIcon k={thk} th={th} size={44}/>;})()
                }
                <span style={{fontSize:9,color:r2.col,fontWeight:700,textAlign:"center",maxWidth:82,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.secret?"???":item.name}</span>
                <span style={{fontSize:8,color:"rgba(255,255,255,.45)",fontWeight:600}}>{item.secret?"?%":Math.round(item.p*100)+"%"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {phase==="reveal"&&(
        <div style={{textAlign:"center",animation:"popIn .5s ease"}}>
          <div style={{fontSize:11,color:displayRar.col,marginBottom:5,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>{displayRar.l}</div>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:3,textShadow:`0 0 20px ${displayRar.col}`}}>{displayName}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:14}}>
            <span style={{fontSize:11,color:displayRar.col,fontWeight:700,background:`${displayRar.col}18`,border:`1px solid ${displayRar.col}44`,borderRadius:6,padding:"2px 8px"}}>Probabilité {Math.round(wonItem.p*100)}%</span>
            <span style={{fontSize:11,fontWeight:700,color:alreadyOwned?"#f39c12":"#27ae60",background:alreadyOwned?"rgba(243,156,18,.12)":"rgba(39,174,96,.12)",border:`1px solid ${alreadyOwned?"rgba(243,156,18,.35)":"rgba(39,174,96,.35)"}`,borderRadius:6,padding:"2px 8px"}}>{alreadyOwned?"Déjà possédé":"Nouveau ! 🎉"}</span>
          </div>
          <button onClick={onClose} style={{background:`linear-gradient(135deg,${box.col},${box.col}88)`,color:"#fff",border:"none",borderRadius:12,padding:"11px 26px",cursor:"pointer",fontWeight:700,fontSize:14}}>Super !</button>
        </div>
      )}
      {phase!=="reveal"&&<div style={{color:"rgba(255,255,255,.4)",fontSize:12}}>Bonne chance...</div>}
    </div>
  );
}

// ── SKIN CARD RENDERER ────────────────────────────────────────────────────
function SkinCard({skinKey,children,style={}}){
  const sk=SKINS[skinKey]||SKINS.default;
  const Ovl=sk.ovl?SK_OVLS[sk.ovl]:null;
  return(
    <div style={{position:"relative",borderRadius:18,overflow:"hidden",border:`1.5px solid ${sk.brd}`,background:`linear-gradient(135deg,${sk.bg1},${sk.bg2})`,...style}}>
      {Ovl&&<Ovl/>}
      <div style={{position:"relative",zIndex:1,color:sk.tc}}>{children}</div>
    </div>
  );
}

// ── MILESTONES ────────────────────────────────────────────────────────────
const MILESTONES=[10,30,50,100,200,300,400,500,1000];
const M_MSG={10:"En feu !",30:"Inarrêtable !",50:"Série folle !",100:"100 streak !",200:"Machine !",300:"Expert !",400:"Légendaire !",500:"Titan !",1000:"MYTHIQUE !"};
function MilestonePopup({count,onClose}){useEffect(()=>{SFX.milestone();const t=setTimeout(onClose,2500);return()=>clearTimeout(t);},[]);const t=Math.min(1,count/1000);const col=t<.15?"#f39c12":t<.5?"#e74c3c":"#8e44ad";return(<div style={{position:"absolute",top:"42%",left:"50%",transform:"translate(-50%,-50%)",zIndex:150,pointerEvents:"none",animation:"milAnim 2.5s ease forwards"}}><div style={{background:"linear-gradient(135deg,#0d0d1a,#1a0a2e)",border:`2px solid ${col}`,borderRadius:20,padding:"14px 26px",textAlign:"center",boxShadow:`0 0 40px ${col}88`}}><div style={{fontSize:28}}>🔥</div><div style={{fontSize:17,fontWeight:900,color:col}}>{M_MSG[count]||count+"!"}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:11}}>Streak {count}</div></div></div>);}
function PlatinumPopup({lang,onContinue,onMenu}){useEffect(()=>SFX.platinum(),[]);return(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}><div style={{background:"linear-gradient(135deg,#0d0d1a,#1a0a2e)",border:"2px solid #a855f7",borderRadius:26,padding:"30px 22px",textAlign:"center",maxWidth:280,width:"100%",boxShadow:"0 0 60px #a855f799"}}><div style={{fontSize:60,filter:"drop-shadow(0 0 18px #a855f7)"}}>🏆</div><div style={{fontSize:20,fontWeight:900,color:"#a855f7",marginBottom:4}}>TROPHÉE PLATINE</div><div style={{color:"#e0d7ff",fontSize:14,marginBottom:4}}>{LANG_INFO[lang]?.label} 100% !</div><div style={{color:"rgba(255,255,255,.35)",fontSize:12,marginBottom:18}}>Tous les mots à 10/10.</div><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={onContinue} style={{background:"linear-gradient(135deg,#a855f7,#7c3aed)",color:"#fff",border:"none",borderRadius:12,padding:"10px 18px",cursor:"pointer",fontWeight:700,fontSize:13}}>Continuer</button><button onClick={onMenu} style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,.6)",border:"none",borderRadius:12,padding:"10px 18px",cursor:"pointer",fontSize:13}}>Menu</button></div></div></div>);}
function RankUpPopup({rank,onClose}){useEffect(()=>{SFX.rankup();const t=setTimeout(onClose,2800);return()=>clearTimeout(t);},[]);return(<div style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",zIndex:160,pointerEvents:"none",animation:"milAnim 2.8s ease forwards"}}><div style={{background:"linear-gradient(135deg,#0d0d1a,#1a0a2e)",border:`2px solid ${rank.col}`,borderRadius:20,padding:"16px 28px",textAlign:"center",boxShadow:`0 0 40px ${rank.col}88`}}><RankBadge rank={rank} size={60}/><div style={{color:rank.col,fontWeight:900,fontSize:17,marginTop:6}}>Rang {rank.l} !</div></div></div>);}
function FocusEntryPopup({onStart,onClose,rs,words}){const [thresh,setThresh]=useState(3);const elig=words.filter(([w])=>{const r=rs[w];return r!==undefined&&r!==null&&r<thresh*10;});return(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}><div style={{background:"linear-gradient(135deg,#0a0010,#1a0020)",border:"2px solid #9b59b6",borderRadius:22,padding:"24px 20px",maxWidth:290,width:"100%",textAlign:"center",boxShadow:"0 0 40px #9b59b655"}}><div style={{fontSize:36,marginBottom:6}}>🎯</div><div style={{color:"#9b59b6",fontWeight:900,fontSize:18,marginBottom:6}}>Mode Focus</div><div style={{color:"rgba(255,255,255,.55)",fontSize:12,marginBottom:16,lineHeight:1.5}}>Mots en dessous du seuil uniquement.</div><div style={{marginBottom:16}}><div style={{color:"rgba(255,255,255,.8)",fontSize:12,marginBottom:8}}>Seuil : <span style={{color:"#9b59b6",fontWeight:800,fontSize:17}}>{thresh}.0</span>/10</div><input type="range" min={1} max={9} step={1} value={thresh} onChange={e=>setThresh(+e.target.value)} style={{width:"100%",accentColor:"#9b59b6",cursor:"pointer"}}/><div style={{marginTop:10,padding:"6px 12px",borderRadius:8,background:"rgba(155,89,182,0.1)",border:"1px solid rgba(155,89,182,0.25)"}}><span style={{color:"#9b59b6",fontWeight:700}}>{elig.length}</span><span style={{color:"rgba(255,255,255,.4)",fontSize:11}}> mot{elig.length!==1?"s":""} à travailler</span></div></div><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={onClose} style={{background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.5)",border:"1px solid rgba(255,255,255,.1)",borderRadius:11,padding:"9px 16px",cursor:"pointer",fontSize:12}}>← Retour</button>{elig.length>0&&<button onClick={()=>onStart(thresh)} style={{background:"linear-gradient(135deg,#9b59b6,#6c3483)",color:"#fff",border:"none",borderRadius:11,padding:"9px 16px",cursor:"pointer",fontWeight:700,fontSize:12}}>Commencer 🎯</button>}</div></div></div>);}
function FocusCompletePopup({thresh,onOk}){return(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}><div style={{background:"linear-gradient(135deg,#0a0010,#1a0020)",border:"2px solid #27ae60",borderRadius:22,padding:"28px 20px",maxWidth:270,width:"100%",textAlign:"center",boxShadow:"0 0 40px #27ae6055"}}><div style={{fontSize:44,marginBottom:8}}>✨</div><div style={{color:"#27ae60",fontWeight:900,fontSize:17,marginBottom:8}}>Objectif atteint !</div><div style={{color:"rgba(255,255,255,.6)",fontSize:13,lineHeight:1.6,marginBottom:20}}>Il n'y a plus de mot en dessous de <span style={{color:"#27ae60",fontWeight:700}}>{thresh}.0/10</span> !</div><button onClick={onOk} style={{background:"linear-gradient(135deg,#27ae60,#1e8449)",color:"#fff",border:"none",borderRadius:11,padding:"11px 28px",cursor:"pointer",fontWeight:700,fontSize:13}}>OK ✓</button></div></div>);}

// ── LESSONS ───────────────────────────────────────────────────────────────
function LessonsTab({words,rs,langKey,T,levelIdx=0}){
  const [openCat,setOpenCat]=useState(null);const catFn=CAT_FNS[langKey];
  const mastered=words.filter(([w])=>(rs[w]??-1)>=70).length;
  const groups=useMemo(()=>{const g={};words.forEach(([w,fr])=>{const ci=catFn(w);if(!g[ci])g[ci]=[];g[ci].push([w,fr]);});Object.values(g).forEach(arr=>arr.sort((a,b)=>{const ra=rs[a[0]],rb=rs[b[0]];const ha=ra!=null,hb=rb!=null;if(!ha&&!hb)return 0;if(!ha)return 1;if(!hb)return -1;return ra-rb;}));return g;},[words,rs]);
  const catOrder=Object.keys(groups).map(Number).sort((a,b)=>{const ga=groups[a],gb=groups[b];const sa=ga.filter(([w])=>rs[w]!=null);const sb=gb.filter(([w])=>rs[w]!=null);const aa=sa.length?sa.reduce((s,[w])=>s+rs[w],0)/sa.length:-1;const ab=sb.length?sb.reduce((s,[w])=>s+rs[w],0)/sb.length:-1;return aa-ab;});
  return(<div style={{display:"flex",flexDirection:"column",overflow:"hidden",flex:1}}>
    <div style={{padding:"9px 14px 6px",flexShrink:0,borderBottom:`1px solid ${T.brd}`,background:"rgba(0,0,0,0.2)"}}>
      <span style={{color:T.txt,fontWeight:900,fontSize:18}}>{mastered}</span><span style={{color:T.sub,fontSize:13}}> / {words.length} mots maîtrisés</span>
      <div style={{marginTop:5,background:"rgba(255,255,255,0.06)",borderRadius:5,height:5}}><div style={{width:`${Math.round(mastered/words.length*100)}%`,background:`linear-gradient(90deg,${T.acc},#44af69)`,borderRadius:5,height:5,transition:"width .5s"}}/></div>
    </div>
    <div style={{overflowY:"auto",flex:1,padding:"8px 10px"}}>
      {catOrder.map(ci=>{
        const w2=groups[ci];if(!w2)return null;
        const reqLvl=CAT_UNLOCK[ci]??0;const isLocked=levelIdx<reqLvl;
        const scored=w2.filter(([w])=>rs[w]!=null);
        const avgRaw=scored.length?scored.reduce((s,[w])=>s+rs[w],0)/scored.length:null;
        const avgSc=avgRaw!=null?Math.round(avgRaw/10*10)/10:null;
        const done=w2.filter(([w])=>(rs[w]??-1)>=70).length;
        const isOpen=openCat===ci&&!isLocked;const c=isLocked?"rgba(255,255,255,.15)":noteCol(avgSc);
        const unlockLv=RANK_LEVELS[reqLvl];
        return(<div key={ci} style={{marginBottom:6}}>
          <button onClick={()=>{if(!isLocked){SFX.nav();setOpenCat(isOpen?null:ci);}}} style={{width:"100%",background:isLocked?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",border:`1px solid ${isLocked?"rgba(255,255,255,.05)":T.brd}`,borderRadius:12,padding:"10px 12px",cursor:isLocked?"default":"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left",opacity:isLocked?.45:1}}>
            <span style={{fontSize:20,flexShrink:0,lineHeight:1}}>{isLocked?"🔒":CAT_ICONS[ci]||"🌀"}</span>
            <div style={{flex:1}}><div style={{color:T.txt,fontSize:13,fontWeight:700}}>{CAT_NAMES[ci]||"Divers"}</div><div style={{color:T.sub,fontSize:11}}>{isLocked?`Débloqué au rang ${unlockLv?.l||"?"}`:`${done}/${w2.length} maîtrisés`}</div></div>
            {!isLocked&&<div style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${c}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,background:`${c}11`}}><span style={{color:c,fontSize:9,fontWeight:800,lineHeight:1}}>{avgSc!==null?avgSc.toFixed(1):"–"}</span><span style={{color:c,fontSize:7,lineHeight:1,opacity:.7}}>/10</span></div>}
            {!isLocked&&<span style={{color:T.sub,fontSize:12}}>{isOpen?"▲":"▼"}</span>}
          </button>
          {isOpen&&<div style={{marginTop:3}}>{w2.map(([w,fr])=>{const raw=rs[w],sc=getScore(raw),c2=noteCol(sc),ip=raw===100;return(<div key={w} style={{background:ip?"rgba(39,174,96,0.07)":"rgba(255,255,255,0.025)",borderRadius:9,padding:"8px 10px",marginBottom:4,display:"flex",alignItems:"center",gap:8,border:`1px solid ${ip?"rgba(39,174,96,0.2)":T.brd}`}}><div style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${c2}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,background:`${c2}11`}}><span style={{color:c2,fontSize:8,fontWeight:800,lineHeight:1}}>{sc!==null?sc.toFixed(1):"–"}</span><span style={{color:c2,fontSize:7,lineHeight:1,opacity:.7}}>/10</span></div><span style={{color:T.txt,fontWeight:700,fontSize:13,flexShrink:0}}>{w.charAt(0).toUpperCase()+w.slice(1)}</span><span style={{color:"rgba(255,255,255,.18)",fontSize:12,flexShrink:0}}>🔄</span><span style={{color:T.sub,fontSize:12,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fr}</span>{ip&&<span style={{flexShrink:0,fontSize:11}}>⭐</span>}</div>);})}</div>}
        </div>);
      })}
    </div>
  </div>);}

// ── QUIZ ──────────────────────────────────────────────────────────────────
function QuizTab({words,rs,langKey,T,skinKey,onScore,onMenu,onQP,isActive=true,curXp=0}){
  const [fm,setFm]=useState(false);const [ft,setFt]=useState(null);const [showFE,setShowFE]=useState(false);const [fDone,setFDone]=useState(false);
  const [streak,setStreak]=useState(0);const [sessionCards,setSessionCards]=useState(0);const [curWord,setCurWord]=useState(null);const [rev,setRev]=useState(false);
  const [flipped,setFlipped]=useState(false);const [locked,setLocked]=useState(false);
  const [showPerfect,setShowPerfect]=useState(false);const [showPlat,setShowPlat]=useState(false);
  const [milestone,setMilestone]=useState(null);const [rankUp,setRankUp]=useState(null);
  const [xpAnim,setXpAnim]=useState(null);const [coinAnim,setCoinAnim]=useState(null);
  const touchX=useRef(null);const latRs=useRef(rs);useEffect(()=>{latRs.current=rs;},[rs]);
  const prevActive=useRef(isActive);
  const latXp=useRef(curXp);useEffect(()=>{latXp.current=curXp;},[curXp]);
  useEffect(()=>{if(!isActive&&prevActive.current){setStreak(0);setSessionCards(0);}prevActive.current=isActive;},[isActive]);

  const getPool=useCallback((cRs,cFm,cFt)=>{if(!cFm||cFt===null)return words;return words.filter(([w])=>{const r=cRs[w];return r!==undefined&&r!==null&&r<cFt*10;});},[words]);
  function pick(ex,cRs=latRs.current,cFm=fm,cFt=ft){const pool=getPool(cRs,cFm,cFt);if(!pool.length){if(cFm)setFDone(true);return;}setCurWord(weightedPick(pool,cRs,ex));setRev(Math.random()<.5);setFlipped(false);setLocked(false);}
  useEffect(()=>{pick(null);},[]);
  function startFocus(thresh){setFt(thresh);setFm(true);setShowFE(false);SFX.focus();const pool=getPool(latRs.current,true,thresh);if(!pool.length){setFDone(true);return;}setCurWord(weightedPick(pool,latRs.current,null));setRev(Math.random()<.5);setFlipped(false);setLocked(false);}
  function exitFocus(){setFm(false);setFt(null);setFDone(false);SFX.nav();pick(null,latRs.current,false,null);}
  if(!curWord)return null;
  const question=rev?curWord[1]:curWord[0];const answer=rev?curWord[0]:curWord[1];
  const qFlag=rev?"🇫🇷":(langKey==="en"?"🇬🇧":langKey==="de"?"🇩🇪":langKey==="es"?"🇪🇸":"🇮🇹");
  const aFlag=rev?(langKey==="en"?"🇬🇧":langKey==="de"?"🇩🇪":langKey==="es"?"🇪🇸":"🇮🇹"):"🇫🇷";
  const curRaw=rs[curWord[0]];
  function handleFlip(){if(locked)return;SFX.flip();setFlipped(f=>!f);}
  function handleAnswer(correct){
    if(locked)return;setLocked(true);SFX[correct?"ok":"wrong"]();
    const ns=correct?streak+1:0;setStreak(ns);const nc=sessionCards+1;setSessionCards(nc);
    const base=10,bonus=correct?Math.floor(Math.min(ns,1000)/2):0,earned=correct?base+bonus:0;
    if(correct&&MILESTONES.includes(ns))setMilestone(ns);
    const oldRaw=latRs.current[curWord[0]]??0;const newRaw=updateRaw(oldRaw,correct);const jp=newRaw===100&&oldRaw!==100;const jm=newRaw>=70&&oldRaw<70;
    if(jp){SFX.perfect();setShowPerfect(true);setTimeout(()=>setShowPerfect(false),1300);}
    if(correct){setXpAnim({base,bonus});setTimeout(()=>setXpAnim(null),900);}
    setCoinAnim("+"+nc);setTimeout(()=>setCoinAnim(null),700);
    // Rank-up detection: compare levelIdx BEFORE and AFTER score update
    const newXp=latXp.current+earned;
    const oldLi=getRankInfo(latXp.current).levelIdx;
    latXp.current=newXp;
    const newRankInfo=getRankInfo(newXp);
    if(newRankInfo.levelIdx>oldLi)setRankUp(newRankInfo.rank);
    // Badges: streak
    onScore(curWord[0],correct,earned,nc,ns,jp);
    onQP({cardFlipped:1,streak:ns,xpEarned:earned,mastered:jm?1:0});
    setTimeout(()=>{
      const upRs={...latRs.current,[curWord[0]]:newRaw};
      if(words.every(([w])=>(upRs[w]??-1)>=100)){setShowPlat(true);return;}
      const pool=getPool(upRs,fm,ft);if(fm&&!pool.length){setFDone(true);return;}
      pick(curWord[0],upRs,fm,ft);
    },jp?1200:460);
  }
  const sk=SKINS[skinKey]||SKINS.default;const Ovl=sk.ovl?SK_OVLS[sk.ovl]:null;
  const focusBg=fm?"radial-gradient(ellipse at center,#0a0010,#000)":"transparent";
  return(<div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",background:focusBg,transition:"background .5s"}}>
    <StreakBorderFlames streak={streak}/>
    {fm&&<Particles/>}
    {showFE&&<FocusEntryPopup onStart={startFocus} onClose={()=>setShowFE(false)} rs={rs} words={words}/>}
    {fDone&&<FocusCompletePopup thresh={ft} onOk={exitFocus}/>}
    {milestone&&<MilestonePopup count={milestone} onClose={()=>setMilestone(null)}/>}
    {showPerfect&&<div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",zIndex:120,pointerEvents:"none",animation:"milAnim 1.3s ease forwards"}}><div style={{background:"linear-gradient(135deg,#0d2818,#071510)",border:"2px solid #27ae60",borderRadius:16,padding:"10px 20px",textAlign:"center",boxShadow:"0 0 28px #27ae6088"}}><div style={{fontSize:24}}>⭐</div><div style={{color:"#27ae60",fontWeight:800,fontSize:13}}>Mot maîtrisé !</div></div></div>}
    {showPlat&&<PlatinumPopup lang={langKey} onContinue={()=>{setShowPlat(false);pick(curWord[0]);}} onMenu={onMenu}/>}
    {rankUp&&<RankUpPopup rank={rankUp} onClose={()=>setRankUp(null)}/>}
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"8px 12px",gap:8,position:"relative",zIndex:1}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {fm?<button onClick={exitFocus} style={{background:"rgba(155,89,182,.2)",color:"#9b59b6",border:"1px solid #9b59b6",borderRadius:16,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>✕ Focus</button>:(()=>{const disc=words.filter(([w])=>rs[w]!=null).length;const canFocus=disc>=50;return(<button onClick={()=>{if(canFocus)setShowFE(true);}} title={canFocus?"":"Découvre 50 mots pour débloquer le mode Focus"} style={{background:canFocus?"linear-gradient(135deg,rgba(155,89,182,.2),rgba(100,0,80,.2))":"rgba(255,255,255,.04)",color:canFocus?"#9b59b6":"rgba(255,255,255,.2)",border:`1px solid ${canFocus?"rgba(155,89,182,.4)":"rgba(255,255,255,.1)"}`,borderRadius:16,padding:"4px 10px",fontSize:11,cursor:canFocus?"pointer":"default",fontWeight:700}}>{canFocus?"🎯 Focus":`🔒 Focus (${disc}/50)`}</button>);})()}
        {fm&&ft&&<span style={{background:"rgba(155,89,182,.12)",border:"1px solid rgba(155,89,182,.25)",borderRadius:8,padding:"2px 7px",color:"#9b59b6",fontSize:10,fontWeight:600}}>{"<"}{ft}.0</span>}
        <div style={{marginLeft:"auto",position:"relative",display:"flex",alignItems:"center"}}>
          {xpAnim&&<div style={{position:"absolute",right:"100%",top:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1,pointerEvents:"none",marginRight:6}}><span style={{color:"#4ecdc4",fontSize:11,fontWeight:800,animation:"floatUp .8s ease forwards"}}>+{xpAnim.base} XP</span>{xpAnim.bonus>0&&<span style={{color:"#ff9800",fontSize:11,fontWeight:800,animation:"floatUp .8s ease .1s forwards"}}>+{xpAnim.bonus} XP 🔥</span>}</div>}
          <Flame streak={streak}/>
        </div>
      </div>
      {/* Score */}
      <div style={{display:"flex",justifyContent:"center",flexShrink:0}}><ScoreBadge raw={curRaw} size={50} perfect={curRaw===100}/></div>
      {/* Card */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:360,height:196,perspective:1200,cursor:"pointer",userSelect:"none"}}
          onMouseDown={e=>{touchX.current=e.clientX;}}
          onMouseUp={e=>{if(!locked&&touchX.current!==null&&Math.abs(e.clientX-touchX.current)<12)handleFlip();touchX.current=null;}}
          onTouchStart={e=>{touchX.current=e.touches[0].clientX;}}
          onTouchEnd={e=>{if(!locked&&touchX.current!==null&&Math.abs(e.changedTouches[0].clientX-touchX.current)<20)handleFlip();touchX.current=null;}}
        >
          <div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform .42s cubic-bezier(.4,1.8,.6,1)",transform:flipped?"rotateY(180deg)":"rotateY(0deg)"}}>
            {/* Front */}
            <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",borderRadius:18,border:`1.5px solid ${sk.brd}`,background:`linear-gradient(135deg,${sk.bg1},${sk.bg2})`,boxShadow:"0 8px 28px rgba(0,0,0,.6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:20,isolation:"isolate"}}>
              {Ovl&&<div style={{position:"absolute",inset:0,borderRadius:18,overflow:"hidden",pointerEvents:"none"}}><Ovl/></div>}
              <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:28}}>{qFlag}</span><span style={{color:sk.tc,fontSize:26,fontWeight:800,textAlign:"center",lineHeight:1.2,textShadow:sk.tc==="#3d2b0e"||sk.tc==="#3a2a1a"?"none":"0 1px 4px rgba(0,0,0,0.5)"}}>{question}</span><span style={{color:sk.tc,fontSize:10,opacity:.35}}>↻ Retourner</span></div>
            </div>
            {/* Back — same skin as front */}
            <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",borderRadius:18,background:`linear-gradient(135deg,${sk.bg1},${sk.bg2})`,boxShadow:"0 8px 28px rgba(0,0,0,.6)",border:`1.5px solid ${sk.brd}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:20,isolation:"isolate"}}>
              <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:28}}>{aFlag}</span><span style={{color:sk.tc,fontSize:22,fontWeight:700,textAlign:"center",lineHeight:1.2,textShadow:sk.tc==="#3d2b0e"||sk.tc==="#3a2a1a"?"none":"0 1px 4px rgba(0,0,0,0.5)"}}>{answer}</span></div>
            </div>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div style={{flexShrink:0,minHeight:52,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {!locked?(flipped?<div style={{display:"flex",gap:12}}><button onClick={()=>handleAnswer(false)} style={{background:"rgba(231,76,60,.12)",color:"#e74c3c",border:"2px solid rgba(231,76,60,.55)",borderRadius:14,padding:"11px 24px",fontSize:15,cursor:"pointer",fontWeight:700}}>❌ Raté</button><button onClick={()=>handleAnswer(true)} style={{background:"rgba(39,174,96,.12)",color:"#27ae60",border:"2px solid rgba(39,174,96,.55)",borderRadius:14,padding:"11px 24px",fontSize:15,cursor:"pointer",fontWeight:700}}>✅ Correct</button></div>:<p style={{color:"#333",fontSize:11,textAlign:"center",margin:0}}>Tapez la carte pour la retourner</p>):<div style={{fontSize:32,animation:"pop .3s ease"}}>{streak>0?"✅":"❌"}</div>}
      </div>
      {/* Session counter */}
      <div style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:10,paddingBottom:2,position:"relative"}}>
        <span style={{color:T.acc,fontSize:22,fontWeight:900,letterSpacing:-1}}>{sessionCards}</span><span style={{color:T.sub,fontSize:13}}> carte{sessionCards>1?"s":""}</span>
        {coinAnim&&<div style={{display:"flex",alignItems:"center",gap:3,animation:"floatUp .7s ease forwards",position:"absolute",right:"calc(50% - 66px)"}}><CoinIcon size={14}/><span style={{color:"#ffd700",fontSize:13,fontWeight:800}}>{coinAnim}</span></div>}
      </div>
    </div>
  </div>);}

// ── QUESTS ────────────────────────────────────────────────────────────────
function QuestCard({q,prog,done,T,accentColor="#27ae60"}){const p=prog[q.id]||0,isDone=done.includes(q.id),pct=Math.min(100,Math.round(p/q.n*100));return(<div style={{background:isDone?"rgba(39,174,96,0.07)":"rgba(255,255,255,0.04)",border:`1px solid ${isDone?"rgba(39,174,96,0.25)":T.brd}`,borderRadius:14,padding:"13px",marginBottom:9,opacity:isDone?.75:1}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><div style={{flex:1}}><div style={{color:T.txt,fontWeight:700,fontSize:13}}>{q.label}</div><div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><span style={{color:T.acc,fontSize:11}}>+{q.xp} XP</span><span style={{color:T.sub,fontSize:10}}>·</span><CoinIcon size={10}/><span style={{color:"#ffd700",fontSize:11}}>+{q.coins}</span></div></div>{isDone?<span style={{fontSize:18}}>✅</span>:<span style={{color:T.acc,fontWeight:800,fontSize:12}}>{p}/{q.n}</span>}</div><div style={{background:"rgba(255,255,255,0.07)",borderRadius:5,height:5}}><div style={{width:`${pct}%`,background:isDone?accentColor:`linear-gradient(90deg,${T.acc},${T.acc}88)`,borderRadius:5,height:5,transition:"width .4s"}}/></div></div>);}
function QuestsTab({quests,questDef,weeklyQuests,weeklyQuestDef,T}){
  const today=todayStr();const isToday=quests.date===today;
  const prog=isToday?quests.progress||{}:{};const done=isToday?quests.done||[]:[];
  const ws=weekStr();const isThisWeek=weeklyQuests?.week===ws;
  const wprog=isThisWeek?weeklyQuests.progress||{}:{};const wdone=isThisWeek?weeklyQuests.done||[]:[];
  return(<div style={{flex:1,overflowY:"auto",padding:"12px"}}>
    <div style={{marginBottom:12}}><div style={{color:T.txt,fontWeight:800,fontSize:16,marginBottom:2}}>🎯 Quêtes du jour</div><div style={{color:T.sub,fontSize:11}}>Se renouvellent à minuit</div></div>
    {questDef.map(q=><QuestCard key={q.id} q={q} prog={prog} done={done} T={T}/>)}
    <div style={{height:1,background:T.brd,margin:"16px 0 12px"}}/>
    <div style={{marginBottom:12}}><div style={{color:T.txt,fontWeight:800,fontSize:16,marginBottom:2}}>📅 Quêtes de la semaine</div><div style={{color:T.sub,fontSize:11}}>Se renouvellent chaque lundi · Plus difficiles, plus récompensantes</div></div>
    {(weeklyQuestDef||[]).map(q=><QuestCard key={q.id} q={q} prog={wprog} done={wdone} T={T} accentColor="#f39c12"/>)}
  </div>);}

// ── SHOP ──────────────────────────────────────────────────────────────────
function ShopTab({langState,T,onEquip,onOpenBox}){
  const {coins,inventory,equipped}=langState;
  const [lootState,setLootState]=useState(null);
  const rord=["commun","rare","super_rare","epique","legendaire","secret"];
  function handleBox(box){if(coins<box.cost)return;const item=rollLoot(box);const alreadyOwned=inventory.includes(item.id);onOpenBox(box.cost,item.id);setLootState({box,item,alreadyOwned});}
  const skBoxes=LOOT_BOXES.filter(b=>b.type==="skin");const thBoxes=LOOT_BOXES.filter(b=>b.type==="theme");
  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
    {lootState&&<RouletteOpening box={lootState.box} wonItem={lootState.item} alreadyOwned={lootState.alreadyOwned} onClose={()=>setLootState(null)}/>}
    <div style={{padding:"7px 10px",display:"flex",alignItems:"center",gap:4,flexShrink:0,borderBottom:`1px solid ${T.brd}`}}><CoinIcon size={16}/><span style={{color:"#ffd700",fontSize:13,fontWeight:700,marginLeft:2}}>{coins}</span><span style={{color:T.sub,fontSize:11}}> pièces</span></div>
    <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
      {/* COFFRES SKINS */}
      <div style={{marginBottom:6}}><div style={{color:T.sub,fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🃏 Coffres Skins</div>
        {skBoxes.map(box=>{const canBuy=coins>=box.cost;return(<div key={box.id} style={{background:`${box.col}0d`,border:`1px solid ${box.col}44`,borderRadius:14,padding:"12px",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><ChestSVG level={box.level} type="skin" size={52}/><div style={{flex:1}}><div style={{color:T.txt,fontWeight:800,fontSize:14}}>{box.label}</div><div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}><CoinIcon size={12}/><span style={{color:"#ffd700",fontSize:12,fontWeight:700}}>{box.cost}</span></div></div><button onClick={()=>handleBox(box)} disabled={!canBuy} style={{background:canBuy?`linear-gradient(135deg,${box.col},${box.col}aa)`:"rgba(255,255,255,0.05)",color:canBuy?"#fff":T.sub,border:"none",borderRadius:10,padding:"10px 14px",cursor:canBuy?"pointer":"default",fontWeight:700,fontSize:13,flexShrink:0}}>{canBuy?"Ouvrir":"🔒"}</button></div><div style={{borderTop:`1px solid rgba(255,255,255,.06)`,paddingTop:7}}>{box.pool.map(it=>{const rar=RARITY[it.rar]||RARITY.commun;return(<div key={it.id} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{it.secret?"???":it.name}</span><div style={{display:"flex",gap:5}}><span style={{fontSize:10,color:rar.col,fontWeight:600}}>{rar.l}</span><span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{Math.round(it.p*100)}%</span></div></div>);})}</div></div>);})}
      </div>
      <div style={{height:1,background:`${T.brd}`,margin:"4px 0 12px"}}/>
      {/* COFFRES THEMES */}
      <div style={{marginBottom:6}}><div style={{color:T.sub,fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🎨 Coffres Thèmes</div>
        {thBoxes.map(box=>{const canBuy=coins>=box.cost;return(<div key={box.id} style={{background:`${box.col}0d`,border:`1px solid ${box.col}44`,borderRadius:14,padding:"12px",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><ChestSVG level={box.level} type="theme" size={52}/><div style={{flex:1}}><div style={{color:T.txt,fontWeight:800,fontSize:14}}>{box.label}</div><div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}><CoinIcon size={12}/><span style={{color:"#ffd700",fontSize:12,fontWeight:700}}>{box.cost}</span></div></div><button onClick={()=>handleBox(box)} disabled={!canBuy} style={{background:canBuy?`linear-gradient(135deg,${box.col},${box.col}aa)`:"rgba(255,255,255,0.05)",color:canBuy?"#fff":T.sub,border:"none",borderRadius:10,padding:"10px 14px",cursor:canBuy?"pointer":"default",fontWeight:700,fontSize:13,flexShrink:0}}>{canBuy?"Ouvrir":"🔒"}</button></div><div style={{borderTop:`1px solid rgba(255,255,255,.06)`,paddingTop:7}}>{box.pool.map(it=>{const rar=RARITY[it.rar]||RARITY.commun;return(<div key={it.id} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{it.secret?"???":it.name}</span><div style={{display:"flex",gap:5}}><span style={{fontSize:10,color:rar.col,fontWeight:600}}>{rar.l}</span><span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{Math.round(it.p*100)}%</span></div></div>);})}</div></div>);})}
      </div>
      <div style={{height:1,background:T.brd,margin:"4px 0 12px"}}/>
      {/* EQUIPER THEMES */}
      <div style={{color:T.sub,fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🎨 Thèmes</div>
      {Object.entries(THEMES).sort((a,b)=>rord.indexOf(a[1].rarity)-rord.indexOf(b[1].rarity)).map(([k,th])=>{const id="theme_"+k,owned=th.free||inventory.includes(id),isEq=equipped.theme===k;const rar=RARITY[th.rarity]||RARITY.commun;return(<div key={k} style={{background:`${th.acc}0a`,border:`1px solid ${isEq?th.acc:T.brd}`,borderRadius:11,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}><ThemeIcon k={k} th={th} size={36}/><div style={{flex:1,minWidth:0}}><div style={{color:T.txt,fontWeight:700,fontSize:12}}>{th.label}</div><div style={{color:rar.col,fontSize:10,fontWeight:600}}>{th.free?"Gratuit":rar.l}</div></div>{isEq?<span style={{color:T.acc,fontSize:11,fontWeight:700,flexShrink:0}}>✓</span>:owned?<button onClick={()=>{SFX.nav();onEquip("theme",k);}} style={{background:T.acc,color:"#000",border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0}}>Équiper</button>:<span style={{color:T.sub,fontSize:10,flexShrink:0}}>🔒</span>}</div>);})}
      <div style={{height:1,background:T.brd,margin:"8px 0 12px"}}/>
      {/* EQUIPER SKINS */}
      <div style={{color:T.sub,fontSize:11,fontWeight:700,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>🃏 Skins de carte</div>
      {Object.entries(SKINS).sort((a,b)=>rord.indexOf(a[1].rarity)-rord.indexOf(b[1].rarity)).map(([k,sk])=>{const id="skin_"+k,owned=sk.free||inventory.includes(id),isEq=equipped.skin===k;const rar=RARITY[sk.rarity]||RARITY.commun;return(<div key={k} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${isEq?T.acc:T.brd}`,borderRadius:11,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:7,background:`linear-gradient(135deg,${sk.bg1},${sk.bg2})`,border:`1.5px solid ${sk.brd}`,flexShrink:0,overflow:"hidden",position:"relative"}}>{(()=>{const O=sk.ovl?SK_OVLS[sk.ovl]:null;return O?<O/>:null;})()}</div><div style={{flex:1,minWidth:0}}><div style={{color:sk.tc&&sk.tc!=="undefined"?T.txt:T.txt,fontWeight:700,fontSize:12}}>{sk.label}</div><div style={{color:rar.col,fontSize:10,fontWeight:600}}>{sk.free?"Gratuit":rar.l}</div></div>{isEq?<span style={{color:T.acc,fontSize:11,fontWeight:700,flexShrink:0}}>✓</span>:owned?<button onClick={()=>{SFX.nav();onEquip("skin",k);}} style={{background:T.acc,color:"#000",border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0}}>Équiper</button>:<span style={{color:T.sub,fontSize:10,flexShrink:0}}>🔒</span>}</div>);})}
    </div>
  </div>);}

// ── PROFILE ───────────────────────────────────────────────────────────────
function ProfileScreen({state,T,onBack,onChangePseudo,debugCoins,onUnlockAll,onResetLang,onMasterAll,currentLang}){
  const [editing,setEditing]=useState(false);const [np,setNp]=useState(state.pseudo||"");const [dbTap,setDbTap]=useState(0);const [showRanks,setShowRanks]=useState(false);
  return(<div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,overflowY:"auto"}}>
    <div style={{padding:"10px 12px",background:"rgba(0,0,0,0.4)",borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}><button onClick={onBack} style={{background:"rgba(255,255,255,.07)",border:"none",color:T.txt,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontSize:12}}>← Retour</button><span style={{color:T.txt,fontWeight:800,fontSize:15,flex:1}}>👤 Profil</span></div>
    <div style={{padding:"12px"}}>
      <div style={{background:"rgba(255,255,255,.04)",border:`1px solid ${T.brd}`,borderRadius:14,padding:"12px",marginBottom:12}}>
        {editing?<div style={{display:"flex",gap:8}}><input value={np} onChange={e=>setNp(e.target.value)} maxLength={20} style={{flex:1,background:"rgba(255,255,255,.08)",border:`1px solid ${T.acc}`,borderRadius:8,padding:"7px 10px",color:T.txt,fontSize:14,outline:"none"}}/><button onClick={()=>{if(np.trim()){onChangePseudo(np.trim());setEditing(false);}}} style={{background:T.acc,color:"#000",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>OK</button><button onClick={()=>setEditing(false)} style={{background:"rgba(255,255,255,.08)",color:T.sub,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:13}}>✕</button></div>
        :<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:30,color:T.acc}}>👤</div><div style={{flex:1}}><div style={{color:T.txt,fontWeight:800,fontSize:17}}>{state.pseudo}</div><div style={{color:T.sub,fontSize:11}}>Joueur</div></div><button onClick={()=>{setNp(state.pseudo||"");setEditing(true);}} style={{background:"rgba(255,255,255,.07)",color:T.sub,border:`1px solid ${T.brd}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11}}>✏️</button></div>}
      </div>
      <div style={{color:T.txt,fontWeight:800,fontSize:14,marginBottom:8}}>📊 Progression</div>
      {Object.entries(LANG_INFO).map(([lk,li])=>{const ls=state.langs[lk];const ws=WORDS[lk],tot=ws.length;const m=ws.filter(([w])=>(ls.rawScores[w]??-1)>=70).length;const{rank}=getRankInfo(ls.xp||0);return(<div key={lk} style={{background:"rgba(255,255,255,.04)",border:`1px solid ${T.brd}`,borderRadius:12,padding:"9px 12px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>{li.flag}</span><div style={{flex:1}}><div style={{color:T.txt,fontWeight:700,fontSize:13}}>{li.label}</div><div style={{color:T.sub,fontSize:11}}>{m}/{tot} · <CoinIcon size={10}/> {ls.coins}</div></div><RankBadge rank={rank} size={32}/></div>);})}
      <div style={{color:T.txt,fontWeight:800,fontSize:14,margin:"12px 0 8px"}}>🏅 Badges</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{BADGES.map(b=>{const has=state.badges.includes(b.id);return(<div key={b.id} title={b.l} style={{background:has?"rgba(255,255,255,.08)":"rgba(255,255,255,.03)",border:`1px solid ${has?T.acc:T.brd}`,borderRadius:9,padding:"4px 7px",display:"flex",alignItems:"center",gap:4,opacity:has?1:.3}}><span style={{fontSize:14}}>{b.ic}</span><span style={{color:has?T.txt:T.sub,fontSize:10,fontWeight:has?700:400,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.l}</span></div>);})}</div>
      <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{color:T.sub,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>🛠 Debug temporaire</div>
        <button onClick={debugCoins} style={{width:"100%",background:"linear-gradient(135deg,#f39c12,#e67e22)",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:800,fontSize:13,color:"#fff"}}>🪙 +1 000 000 pièces</button>
        <button onClick={()=>setShowRanks(true)} style={{width:"100%",background:"linear-gradient(135deg,#2980b9,#1a5276)",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:800,fontSize:13,color:"#fff"}}>🏅 Voir tous les rangs</button>
        <button onClick={onUnlockAll} style={{width:"100%",background:"linear-gradient(135deg,#8e44ad,#6c3483)",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:800,fontSize:13,color:"#fff"}}>🔓 Unlock ALL (skins &amp; thèmes)</button>
        <button onClick={onMasterAll} style={{width:"100%",background:"linear-gradient(135deg,#27ae60,#1e8449)",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:800,fontSize:13,color:"#fff"}}>⭐ Maîtriser tous les mots (debug)</button>
        {currentLang&&<button onClick={()=>onResetLang(currentLang)} style={{width:"100%",background:"linear-gradient(135deg,#c0392b,#96281b)",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontWeight:800,fontSize:13,color:"#fff"}}>🗑 Reset progression ({currentLang.toUpperCase()})</button>}
      </div>
      {showRanks&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"linear-gradient(135deg,#0d0d1a,#1a0a2e)",border:`1px solid ${T.brd}`,borderRadius:22,padding:"20px 16px",maxWidth:320,width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <span style={{color:T.txt,fontWeight:900,fontSize:16}}>🏅 Tous les rangs</span>
              <button onClick={()=>setShowRanks(false)} style={{background:"rgba(255,255,255,.08)",border:"none",color:T.sub,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            {RANK_LEVELS.map((r)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 12px",background:"rgba(255,255,255,.04)",border:`1px solid ${r.col}33`,borderRadius:12,marginBottom:8}}>
                <RankBadge rank={r} size={52}/>
                <div><div style={{color:r.col,fontWeight:900,fontSize:15,textShadow:`0 0 8px ${r.col}88`}}>{r.l}</div><div style={{color:T.sub,fontSize:11,marginTop:2}}>{r.cumXP===0?"Départ":r.cumXP.toLocaleString()+" XP cumulés"}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>);}

// ── LEADERBOARD ───────────────────────────────────────────────────────────
function LeaderboardScreen({T,onBack,myUUID}){
  const [entries,setEntries]=useState([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("total");
  useEffect(()=>{(async()=>{try{const keys=await window.storage.list("lb:",true);const items=await Promise.all((keys.keys||[]).map(async k=>{try{const r=await window.storage.get(k,true);return r?JSON.parse(r.value):null;}catch{return null;}}));setEntries(items.filter(Boolean));}catch{}setLoading(false);})();},[]);
  const sorted=[...entries].sort((a,b)=>{const va=filter==="total"?(a.xp_en||0)+(a.xp_de||0)+(a.xp_es||0)+(a.xp_it||0):(a["xp_"+filter]||0);const vb=filter==="total"?(b.xp_en||0)+(b.xp_de||0)+(b.xp_es||0)+(b.xp_it||0):(b["xp_"+filter]||0);return vb-va;}).slice(0,10);
  const medals=["🥇","🥈","🥉"];
  return(<div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"10px 12px",background:"rgba(0,0,0,0.4)",borderBottom:`1px solid ${T.brd}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}><button onClick={onBack} style={{background:"rgba(255,255,255,.07)",border:"none",color:T.txt,borderRadius:8,padding:"4px 9px",cursor:"pointer",fontSize:12}}>← Retour</button><span style={{color:T.txt,fontWeight:800,fontSize:15,flex:1}}>🏆 Classement</span></div>
    <div style={{display:"flex",borderBottom:`1px solid ${T.brd}`,flexShrink:0}}>{[{k:"total",l:"Total"},{k:"en",l:"🇬🇧"},{k:"de",l:"🇩🇪"},{k:"es",l:"🇪🇸"},{k:"it",l:"🇮🇹"}].map(({k,l})=>(<button key={k} onClick={()=>setFilter(k)} style={{flex:1,background:"none",border:"none",cursor:"pointer",color:filter===k?T.acc:T.sub,fontWeight:filter===k?700:400,fontSize:12,padding:"9px 0",borderBottom:`2px solid ${filter===k?T.acc:"transparent"}`}}>{l}</button>))}</div>
    <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
      {loading?<div style={{color:T.sub,textAlign:"center",marginTop:40,fontSize:13}}>Chargement...</div>:sorted.length===0?<div style={{color:T.sub,textAlign:"center",marginTop:40,fontSize:13}}>Aucun joueur. Soyez le premier !</div>:sorted.map((e,i)=>{const xp=filter==="total"?(e.xp_en||0)+(e.xp_de||0)+(e.xp_es||0)+(e.xp_it||0):(e["xp_"+filter]||0);const isMe=e.uuid===myUUID;return(<div key={e.uuid||i} style={{background:isMe?"rgba(78,205,196,0.09)":"rgba(255,255,255,.04)",border:`1px solid ${isMe?T.acc:T.brd}`,borderRadius:12,padding:"10px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:i<3?20:13,minWidth:28,flexShrink:0,color:i<3?"inherit":"#aaa"}}>{medals[i]||("#"+(i+1))}</span><div style={{flex:1}}><span style={{color:isMe?T.acc:T.txt,fontWeight:isMe?800:700,fontSize:14}}>{e.pseudo||"?"}</span>{isMe&&<span style={{color:T.sub,fontSize:11}}> (moi)</span>}</div><span style={{color:T.acc,fontSize:12,fontWeight:700}}>{xp} XP</span></div>);})}
    </div>
  </div>);}

// ── HOME ──────────────────────────────────────────────────────────────────
function HomeScreen({state,T,onSelect,onProfile,onLeaderboard}){
  return(<div style={{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${T.bg},${T.surf})`,padding:20,fontFamily:"'Segoe UI',sans-serif",position:"relative"}}>
    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:8}}><button onClick={()=>{SFX.nav();onLeaderboard();}} style={{background:"rgba(255,255,255,.07)",border:`1px solid ${T.brd}`,color:T.sub,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12}}>🏆</button><button onClick={()=>{SFX.nav();onProfile();}} style={{background:"rgba(255,255,255,.07)",border:`1px solid ${T.brd}`,color:T.sub,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12}}>👤 {state.pseudo}</button></div>
    <h1 style={{color:T.txt,fontSize:24,margin:"0 0 4px",fontWeight:900,textAlign:"center"}}>🌍 Basic Languages</h1>
    <p style={{color:T.sub,marginBottom:4,textAlign:"center",fontSize:13}}>Maîtrisez les fondamentaux</p>
    <span style={{color:"rgba(255,255,255,.25)",fontSize:9,fontWeight:700,letterSpacing:1,marginBottom:24}}>v2.1</span>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",width:"100%",maxWidth:420}}>
      {Object.entries(LANG_INFO).map(([lk,li])=>{const ls=state.langs[lk];const ws=WORDS[lk],tot=ws.length;const m=ws.filter(([w])=>(ls.rawScores[w]??-1)>=70).length;const{rank,xIn,xNeed,isMax,pct:rPct}=getRankInfo(ls.xp||0);
      return(<button key={lk} onClick={()=>{SFX.nav();onSelect(lk);}} style={{background:"rgba(255,255,255,.05)",border:`1px solid ${T.brd}`,borderRadius:20,padding:"16px 0",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,flex:"1 1 140px",maxWidth:195,transition:"all .2s",position:"relative"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)";e.currentTarget.style.transform="translateY(-4px)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.transform="";}}>
        <span style={{fontSize:52,lineHeight:1}}>{li.flag}</span>
        <span style={{color:T.txt,fontSize:16,fontWeight:900,letterSpacing:-.3}}>{li.label}</span>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:.8}}>
          <RankBadge rank={rank} size={22}/>
          <span style={{color:rank.col,fontSize:9,fontWeight:700,letterSpacing:.5}}>{rank.l}</span>
        </div>
        <div style={{width:"78%"}}><div style={{display:"flex",gap:1.5,marginBottom:3}}>{Array.from({length:12}).map((_,i)=>{const f=i<Math.round(rPct/100*12);return(<div key={i} style={{flex:1,height:5,borderRadius:1,background:f?rank.col:"rgba(255,255,255,.07)",boxShadow:f?`0 0 3px ${rank.glow}`:"none"}}/>);})}</div><div style={{color:T.sub,fontSize:9,textAlign:"center"}}>{m}/{tot} · {Math.round(m/tot*100)}%</div></div>
        <div style={{position:"absolute",top:7,right:9,display:"flex",alignItems:"center",gap:2}}><CoinIcon size={11}/><span style={{color:"#ffd700",fontSize:9,fontWeight:700}}>{ls.coins||0}</span></div>
      </button>);})}
    </div>
  </div>);}

function PseudoSetup({T,onDone}){const [val,setVal]=useState("");return(<div style={{height:"100vh",width:"100vw",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${T.bg},${T.surf})`,fontFamily:"'Segoe UI',sans-serif",padding:24}}><div style={{background:"rgba(255,255,255,.05)",border:`1px solid ${T.brd}`,borderRadius:22,padding:"30px 20px",maxWidth:290,width:"100%",textAlign:"center"}}><div style={{fontSize:48,marginBottom:10}}>🌍</div><div style={{color:T.txt,fontWeight:900,fontSize:19,marginBottom:4}}>Bienvenue !</div><div style={{color:T.sub,fontSize:13,marginBottom:20}}>Choisissez un pseudo pour le classement</div><input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&val.trim()&&onDone(val.trim())} maxLength={20} placeholder="Votre pseudo..." style={{width:"100%",background:"rgba(255,255,255,.08)",border:`1px solid ${T.acc}`,borderRadius:10,padding:"10px 12px",color:T.txt,fontSize:15,outline:"none",marginBottom:12,boxSizing:"border-box"}}/><button onClick={()=>{if(val.trim())onDone(val.trim());}} disabled={!val.trim()} style={{width:"100%",background:val.trim()?`linear-gradient(135deg,${T.acc},${T.acc}99)`:"rgba(255,255,255,.05)",color:val.trim()?"#000":T.sub,border:"none",borderRadius:10,padding:"12px",cursor:val.trim()?"pointer":"default",fontWeight:800,fontSize:15}}>Commencer 🚀</button></div></div>);}

// ── QUEST TOAST ───────────────────────────────────────────────────────────
function QuestToast({toast,T}:{toast:{label:string,xp:number,coins:number},T:typeof THEMES.default}){
  return(<div style={{position:"fixed",top:16,right:16,zIndex:400,animation:"slideInRight .4s cubic-bezier(.2,1.3,.4,1)",pointerEvents:"none",maxWidth:240}}><div style={{background:"linear-gradient(135deg,rgba(39,174,96,0.95),rgba(26,110,61,0.95))",border:"1.5px solid rgba(39,174,96,0.7)",borderRadius:16,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,.6)",backdropFilter:"blur(8px)"}}><div style={{color:"#fff",fontWeight:800,fontSize:13,marginBottom:4}}>✅ Quête accomplie !</div><div style={{color:"rgba(255,255,255,.85)",fontSize:11,marginBottom:6,lineHeight:1.3}}>{toast.label}</div><div style={{display:"flex",gap:10}}><span style={{color:"#4ecdc4",fontSize:11,fontWeight:700}}>+{toast.xp} XP</span><span style={{display:"flex",alignItems:"center",gap:3,color:"#ffd700",fontSize:11,fontWeight:700}}><CoinIcon size={10}/>+{toast.coins}</span></div></div></div>);}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App(){
  const [appState,setAppState]=useState(null);const [screen,setScreen]=useState("loading");const [lang,setLang]=useState(null);const [tab,setTab]=useState("lessons");
  const [questToast,setQuestToast]=useState<{label:string,xp:number,coins:number}|null>(null);
  const questToastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(SK);if(r?.value){const s=JSON.parse(r.value);if(!s.uuid)s.uuid=genUUID();["en","de","es","it"].forEach(lk=>{if(!s.langs[lk])s.langs[lk]=mkL();const l=s.langs[lk];if(l.coins==null)l.coins=0;if(!l.rawScores)l.rawScores={};if(!l.equipped)l.equipped={theme:"default",skin:"default"};if(!l.inventory)l.inventory=[];if(!l.quests)l.quests={date:"",progress:{},done:[]};if(!l.quests.done)l.quests.done=[];if(!l.weeklyQuests)l.weeklyQuests={week:"",progress:{},done:[]};});if(!s.badges)s.badges=[];setAppState(s);setScreen(s.pseudo?"home":"setup");}else{const s={...DEF,uuid:genUUID()};setAppState(s);setScreen("setup");}}catch{const s={...DEF,uuid:genUUID()};setAppState(s);setScreen("setup");}})();},[]);
  const save=useCallback(async s=>{try{await window.storage.set(SK,JSON.stringify(s));}catch{}},[]);
  async function updateLB(uuid,pseudo,langs){try{await window.storage.set("lb:"+uuid,JSON.stringify({uuid,pseudo,xp_en:langs.en.xp,xp_de:langs.de.xp,xp_es:langs.es.xp,xp_it:langs.it.xp}),true);}catch{}}
  function setState(fn){setAppState(prev=>{const next=fn(prev);save(next);if(next.pseudo&&next.uuid)updateLB(next.uuid,next.pseudo,next.langs);return next;});}
  const questDef=useMemo(()=>lang?getDailyQuests(todayStr()+lang):[],[lang]);
  const weeklyQuestDef=useMemo(()=>lang?getWeeklyQuests(weekStr(),lang):[],[lang]);
  function ensureQFresh(s,lk){const l={...s.langs[lk]};const today=todayStr();if(l.quests.date!==today)l.quests={date:today,progress:{},done:[]};if(!l.weeklyQuests||l.weeklyQuests.week!==weekStr())l.weeklyQuests={week:weekStr(),progress:{},done:[]};return{...s,langs:{...s.langs,[lk]:l}};}

  function handleScore(word,correct,xpEarned,coinsEarned,streak,jp){
    if(!lang)return;
    setState(prev=>{
      let s=ensureQFresh({...prev},lang);
      const l=s.langs[lang];
      const newRaw=updateRaw(l.rawScores[word],correct);
      const oldLi=getRankInfo(l.xp||0).levelIdx;
      const newXp=(l.xp||0)+xpEarned;
      const newLi=getRankInfo(newXp).levelIdx;
      let rankCoins=0;for(let li=oldLi+1;li<=newLi;li++){const rr=RANK_REWARDS[li as keyof typeof RANK_REWARDS];if(rr)rankCoins+=rr.coins;}
      const newLang={...l,rawScores:{...l.rawScores,[word]:newRaw},xp:newXp,coins:(l.coins||0)+coinsEarned+rankCoins};
      const badges=new Set(s.badges);
      const nm=Object.values(newLang.rawScores).filter(r=>r>=70).length;
      // Streak badges — fix: check all thresholds
      if(streak>=10)badges.add("b_s10");
      if(streak>=50)badges.add("b_s50");
      if(streak>=100)badges.add("b_s100");
      if(nm>=1)badges.add("b_fw");if(nm>=10)badges.add("b_m10");if(nm>=50)badges.add("b_m50");if(nm>=100)badges.add("b_m100");
      const ri=getRankInfo(newXp).rankIdx;
      if(ri>=1)badges.add("b_rbr");if(ri>=3)badges.add("b_rgo");if(ri>=5)badges.add("b_rpl");if(ri>=6)badges.add("b_rso");
      if(WORDS[lang].every(([w])=>(newLang.rawScores[w]??-1)>=100))badges.add("b_p"+lang);
      return{...s,langs:{...s.langs,[lang]:newLang},badges:[...badges]};
    });
  }

  function showQuestToast(q:{label:string,xp:number,coins:number}){if(questToastTimer.current)clearTimeout(questToastTimer.current);setQuestToast(q);questToastTimer.current=setTimeout(()=>setQuestToast(null),3200);}

  function handleQP({cardFlipped,streak,xpEarned,mastered}){
    if(!lang)return;
    // Detect completions outside setState for toast (using snapshot)
    if(appState){
      const l=appState.langs[lang];const today=todayStr();
      const prevProg=l.quests?.date===today?l.quests.progress||{}:{};
      const prevDone=l.quests?.date===today?l.quests.done||[]:[];
      questDef.forEach(q=>{if(prevDone.includes(q.id))return;const pv=prevProg[q.id]||0;let v=pv;if(q.t==="cards")v=pv+cardFlipped;if(q.t==="streak")v=Math.max(pv,streak);if(q.t==="xp")v=pv+xpEarned;if(q.t==="master")v=pv+mastered;if(v>=q.n)showQuestToast(q);});
      const ws=weekStr();const wq=l.weeklyQuests||{week:"",progress:{},done:[]};
      const wpProg=wq.week===ws?wq.progress||{}:{};const wpDone=wq.week===ws?wq.done||[]:[];
      weeklyQuestDef.forEach(q=>{if(wpDone.includes(q.id))return;const pv=wpProg[q.id]||0;let v=pv;if(q.t==="cards")v=pv+cardFlipped;if(q.t==="streak")v=Math.max(pv,streak);if(q.t==="xp")v=pv+xpEarned;if(q.t==="master")v=pv+mastered;if(v>=q.n)showQuestToast(q);});
    }
    setState(prev=>{
      let s=ensureQFresh({...prev},lang);
      const l=s.langs[lang];const prog={...l.quests.progress},done=[...(l.quests.done||[])];
      let bXP=0,bCoins=0;
      questDef.forEach(q=>{if(done.includes(q.id))return;const pv=prog[q.id]||0;let v=pv;if(q.t==="cards")v=pv+cardFlipped;if(q.t==="streak")v=Math.max(pv,streak);if(q.t==="xp")v=pv+xpEarned;if(q.t==="master")v=pv+mastered;prog[q.id]=v;if(v>=q.n){done.push(q.id);bXP+=q.xp;bCoins+=q.coins;SFX.quest();}});
      // Weekly quests
      const wq={...l.weeklyQuests};const wprog={...wq.progress},wdone=[...(wq.done||[])];
      weeklyQuestDef.forEach(q=>{if(wdone.includes(q.id))return;const pv=wprog[q.id]||0;let v=pv;if(q.t==="cards")v=pv+cardFlipped;if(q.t==="streak")v=Math.max(pv,streak);if(q.t==="xp")v=pv+xpEarned;if(q.t==="master")v=pv+mastered;wprog[q.id]=v;if(v>=q.n){wdone.push(q.id);bXP+=q.xp;bCoins+=q.coins;SFX.quest();}});
      const newLang={...l,quests:{...l.quests,progress:prog,done},weeklyQuests:{...wq,progress:wprog,done:wdone},xp:(l.xp||0)+bXP,coins:(l.coins||0)+bCoins};
      return{...s,langs:{...s.langs,[lang]:newLang}};
    });
  }

  function handleEquip(type,key){if(!lang)return;setState(prev=>{const l={...prev.langs[lang],equipped:{...prev.langs[lang].equipped,[type]:key}};return{...prev,langs:{...prev.langs,[lang]:l}};});}
  function handleOpenBox(cost,itemId){if(!lang)return;setState(prev=>{const l=prev.langs[lang];const newL={...l,coins:Math.max(0,(l.coins||0)-cost),inventory:l.inventory.includes(itemId)?l.inventory:[...l.inventory,itemId]};return{...prev,langs:{...prev.langs,[lang]:newL}};});}
  function handleChangePseudo(p){setState(s=>({...s,pseudo:p}));}
  // DEBUG: add 100k coins to all langs (hidden, triggered by tapping version 5×)
  function debugCoins(){setState(prev=>{const langs={};Object.keys(prev.langs).forEach(lk=>{langs[lk]={...prev.langs[lk],coins:(prev.langs[lk].coins||0)+1000000};});return{...prev,langs};});}
  function handleUnlockAll(){
    const allSkinIds=Object.keys(SKINS).filter(k=>k!=="default").map(k=>"skin_"+k);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allThemeIds=Object.keys(THEMES).filter(k=>!(THEMES as any)[k].free).map(k=>"theme_"+k);
    const allItems=[...allSkinIds,...allThemeIds];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setState((prev:any)=>{const langs:any={};Object.keys(prev.langs).forEach((lk:string)=>{const existing=prev.langs[lk].inventory||[];const merged=[...new Set([...existing,...allItems])];langs[lk]={...prev.langs[lk],inventory:merged};});return{...prev,langs};});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleResetLang(lk:string){setState((prev:any)=>{const fresh=mkL();const kept={equipped:prev.langs[lk].equipped,inventory:prev.langs[lk].inventory};return{...prev,langs:{...prev.langs,[lk]:{...fresh,...kept}}};});}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMasterAll(){setState((prev:any)=>{const langs:any={};Object.keys(prev.langs).forEach((lk:string)=>{const rs:any={};WORDS[lk].forEach(([w]:[string,string])=>{rs[w]=100;});langs[lk]={...prev.langs[lk],rawScores:rs};});return{...prev,langs};});}

  if(screen==="loading"||!appState)return <div style={{height:"100vh",width:"100vw",display:"flex",alignItems:"center",justifyContent:"center",background:"#050510",color:"#fff",fontFamily:"sans-serif"}}>Chargement…</div>;
  
  const langState=lang?appState.langs[lang]:null;
  const T=lang?(THEMES[langState.equipped?.theme||"default"]||THEMES.default):THEMES.default;
  const skinKey=lang?(langState.equipped?.skin||"default"):"default";

  if(screen==="setup")return <PseudoSetup T={T} onDone={p=>{setState(s=>({...s,pseudo:p}));setScreen("home");}}/>;
  if(screen==="profile")return <div style={{height:"100vh",width:"100vw",overflow:"auto",background:T.bg}}><ProfileScreen state={appState} T={T} onBack={()=>{SFX.nav();setScreen(lang?"lang":"home");}} onChangePseudo={handleChangePseudo} debugCoins={debugCoins} onUnlockAll={handleUnlockAll} onResetLang={handleResetLang} onMasterAll={handleMasterAll} currentLang={lang}/></div>;
  if(screen==="leaderboard")return <div style={{height:"100vh",width:"100vw",overflow:"hidden",background:T.bg}}><LeaderboardScreen T={T} onBack={()=>{SFX.nav();setScreen("home");}} myUUID={appState.uuid}/></div>;
  if(!lang||screen==="home")return <div style={{height:"100vh",width:"100vw",overflow:"auto",background:T.bg}}><HomeScreen state={appState} T={T} onSelect={lk=>{SFX.nav();setLang(lk);setTab("lessons");setScreen("lang");}} onProfile={()=>{SFX.nav();setScreen("profile");}} onLeaderboard={()=>{SFX.nav();setScreen("leaderboard");}}/></div>;

  const words=WORDS[lang];const today=todayStr();
  const questsData=langState.quests.date===today?langState.quests:{date:today,progress:{},done:[]};
  const ws=weekStr();const weeklyQuestsData=langState.weeklyQuests?.week===ws?langState.weeklyQuests:{week:ws,progress:{},done:[]};
  const {levelIdx:curLevelIdx}=getRankInfo(langState.xp||0);
  const TABS=[{k:"lessons",l:"📚",n:"Leçons"},{k:"quiz",l:"🧠",n:"Quiz"},{k:"quests",l:"🎯",n:"Quêtes"},{k:"shop",l:"🛍",n:"Shop"}];

  return(<div style={{height:"100vh",width:"100vw",maxWidth:"100vw",display:"flex",flexDirection:"column",overflow:"hidden",background:T.bg,fontFamily:"'Segoe UI',sans-serif"}}>
    <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}body,html{margin:0;padding:0;overflow:hidden;height:100%;}@keyframes pop{0%{transform:scale(.4)}65%{transform:scale(1.25)}100%{transform:scale(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-26px)}}@keyframes milAnim{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.9)}}@keyframes popIn{0%{opacity:0;transform:scale(.5)}70%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}@keyframes flamePulse{from{transform:scale(1)}to{transform:scale(1.1)}}@keyframes flameRise{0%{transform:scaleX(0.82) scaleY(0.86) translateY(3px);opacity:0.6}100%{transform:scaleX(1.14) scaleY(1.1) translateY(-4px);opacity:1}}@keyframes holoShift{from{opacity:0.6}to{opacity:1}}@keyframes cursedFlicker{0%,100%{opacity:1}50%{opacity:.7}}@keyframes slideInRight{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:translateX(0)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}`}</style>
    {questToast&&<QuestToast toast={questToast} T={T}/>}
    <div style={{padding:"7px 12px",background:"rgba(0,0,0,0.45)",borderBottom:`1px solid ${T.brd}`,flexShrink:0,backdropFilter:"blur(8px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
        <button onClick={()=>{SFX.nav();setScreen("home");setLang(null);}} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.brd}`,color:"rgba(255,255,255,.5)",borderRadius:7,padding:"3px 8px",cursor:"pointer",fontSize:11,flexShrink:0}}>← Menu</button>
        <span style={{fontSize:16,flexShrink:0}}>{LANG_INFO[lang].flag}</span>
        <span style={{color:T.txt,fontWeight:800,fontSize:13,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{LANG_INFO[lang].label}</span>
        <button onClick={()=>{SFX.nav();setScreen("profile");}} style={{background:"rgba(255,255,255,.06)",border:`1px solid ${T.brd}`,color:T.sub,borderRadius:7,padding:"3px 7px",cursor:"pointer",fontSize:11,flexShrink:0}}>👤</button>
      </div>
      <ProgressHeader ls={langState} T={T}/>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <div style={{display:tab==="lessons"?"flex":"none",flex:1,flexDirection:"column",overflow:"hidden"}}><LessonsTab words={words} rs={langState.rawScores} langKey={lang} T={T} levelIdx={curLevelIdx}/></div>
      <div style={{display:tab==="quiz"?"flex":"none",flex:1,flexDirection:"column",overflow:"hidden"}}><QuizTab words={words} rs={langState.rawScores} langKey={lang} T={T} skinKey={skinKey} onScore={handleScore} onMenu={()=>{SFX.nav();setScreen("home");setLang(null);}} onQP={handleQP} isActive={tab==="quiz"} curXp={langState.xp||0}/></div>
      <div style={{display:tab==="quests"?"flex":"none",flex:1,flexDirection:"column",overflow:"hidden"}}><QuestsTab quests={questsData} questDef={questDef} weeklyQuests={weeklyQuestsData} weeklyQuestDef={weeklyQuestDef} T={T}/></div>
      <div style={{display:tab==="shop"?"flex":"none",flex:1,flexDirection:"column",overflow:"hidden"}}><ShopTab langState={langState} T={T} onEquip={handleEquip} onOpenBox={handleOpenBox}/></div>
    </div>
    <div style={{display:"flex",borderTop:`1px solid ${T.brd}`,background:"rgba(0,0,0,0.45)",flexShrink:0,backdropFilter:"blur(8px)"}}>{TABS.map(({k,l,n})=>(<button key={k} onClick={()=>{SFX.nav();setTab(k);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",color:tab===k?T.acc:T.sub,padding:"8px 0 6px",borderTop:`2px solid ${tab===k?T.acc:"transparent"}`,transition:"all .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:18,textShadow:tab===k?`0 0 10px ${T.acc}`:"none"}}>{l}</span><span style={{fontSize:9,fontWeight:tab===k?700:400,letterSpacing:.3}}>{n}</span></button>))}</div>
  </div>);}
