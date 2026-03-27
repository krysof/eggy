// ============================================================
//  platformer.js — 2D Mario-style side-scrolling platformer
//  Multiple NPCs join the adventure!
// ============================================================
var _pfActive=false,_pfCanvas=null,_pfCtx=null;
var _pfT=32; // tile size
var _pfGrav=0.55,_pfJF=-10,_pfMaxSpd=4.5;
var _pfLevel=null,_pfCamX=0;
var _pfPlayer=null,_pfNPCs=[],_pfEnemies=[],_pfItems=[],_pfFireballs=[],_pfParticles=[];
var _pfFlag=null,_pfCastle=null;
var _pfWinTimer=0,_pfDeathTimer=0,_pfCoins=0,_pfTime=300;
var _pfTimeCounter=0;
var _pfKeys={left:false,right:false,jump:false,fire:false};
var _pfStarted=false;

// ---- Entity factory ----
function _pfMakeEnt(x,y,w,h,color,isPlayer){
    return {x:x,y:y,vx:0,vy:0,w:w,h:h,color:color,accent:color,big:false,star:false,starTimer:0,
        onGround:false,facing:1,dead:false,frame:0,isPlayer:!!isPlayer,
        jumpCD:0,aiTimer:0,aiJumpNext:false,won:false};
}

// ---- Level generation ----
function _pfGenLevel(){
    var W=210,H=15,T=[];
    for(var y=0;y<H;y++){T[y]=[];for(var x=0;x<W;x++)T[y][x]=0;}
    // Ground
    for(var x=0;x<W;x++){T[H-1][x]=1;T[H-2][x]=1;}
    // Gaps
    [[20,23],[48,51],[82,84],[125,128],[160,163]].forEach(function(g){for(var x=g[0];x<g[1];x++){T[H-1][x]=0;T[H-2][x]=0;}});
    // Brick platforms
    [[8,13,9],[27,33,10],[40,45,8],[58,64,9],[75,80,10],[95,102,8],[110,116,9],[135,142,10],[150,156,8],[170,176,9]].forEach(function(b){
        for(var x=b[0];x<b[1];x++)T[b[2]][x]=2;
    });
    // Question blocks
    [[10,9],[30,10],[42,8],[60,9],[77,7],[98,8],[113,9],[138,7],[153,8],[173,6]].forEach(function(q){T[q[1]][q[0]]=3;});
    // Pipes
    [[16,3],[38,4],[68,3],[90,5],[120,3],[145,4],[165,3]].forEach(function(p){
        var px=p[0],ph=p[1];
        for(var py=0;py<ph;py++){var ty=H-3-py;if(py===ph-1){T[ty][px]=4;T[ty][px+1]=5;}else{T[ty][px]=6;T[ty][px+1]=7;}}
    });
    // Staircase to flag
    for(var si=0;si<8;si++)for(var sy=0;sy<=si;sy++)T[H-3-sy][W-22+si]=1;
    // Flag
    _pfFlag={tx:W-14,ty:H-11,reached:false,flagY:0};
    // Castle blocks
    for(var cx=W-8;cx<W-2;cx++)for(var cy=H-7;cy<H-2;cy++)T[cy][cx]=9;
    _pfCastle={tx:W-5,ty:H-7};
    return {T:T,W:W,H:H};
}

// ---- Enemies ----
function _pfSpawnEnemies(){
    _pfEnemies=[];
    // Goombas and Koopas at various positions
    var spots=[12,25,35,50,60,72,88,100,112,128,138,148,158,168,178];
    for(var i=0;i<spots.length;i++){
        var isKoopa=(i%3===2);
        _pfEnemies.push({x:spots[i]*_pfT,y:0,vx:isKoopa?-1.5:-1,vy:0,w:_pfT*0.8,h:_pfT*(isKoopa?1.2:0.8),
            type:isKoopa?'koopa':'goomba',dead:false,shell:false,shellVx:0,frame:0});
    }
    // Place on ground
    for(var e=0;e<_pfEnemies.length;e++){
        _pfEnemies[e].y=(_pfLevel.H-3)*_pfT-_pfEnemies[e].h;
    }
}

// ---- Collision helpers ----
function _pfSolid(tx,ty){
    if(tx<0||ty<0||!_pfLevel||tx>=_pfLevel.W||ty>=_pfLevel.H)return false;
    var t=_pfLevel.T[ty][tx];
    return t>=1&&t<=9;
}
function _pfTileAt(px,py){return _pfSolid(Math.floor(px/_pfT),Math.floor(py/_pfT));}

// ---- Physics for an entity ----
function _pfMoveEnt(e){
    if(e.dead||e.won)return;
    e.vy+=_pfGrav;
    if(e.vy>12)e.vy=12;
    // Horizontal
    e.x+=e.vx;
    // Left/right collision
    if(e.vx>0){
        var rx=e.x+e.w,ty1=Math.floor(e.y/_pfT),ty2=Math.floor((e.y+e.h-1)/_pfT);
        var tx=Math.floor(rx/_pfT);
        for(var ty=ty1;ty<=ty2;ty++){if(_pfSolid(tx,ty)){e.x=tx*_pfT-e.w;e.vx=0;break;}}
    } else if(e.vx<0){
        var tx2=Math.floor(e.x/_pfT),ty1b=Math.floor(e.y/_pfT),ty2b=Math.floor((e.y+e.h-1)/_pfT);
        for(var ty=ty1b;ty<=ty2b;ty++){if(_pfSolid(tx2,ty)){e.x=(tx2+1)*_pfT;e.vx=0;break;}}
    }
    // Vertical
    e.y+=e.vy;
    e.onGround=false;
    if(e.vy>0){
        // Falling — check below
        var by=e.y+e.h,tx1=Math.floor(e.x/_pfT),tx2f=Math.floor((e.x+e.w-1)/_pfT);
        var bty=Math.floor(by/_pfT);
        for(var tx=tx1;tx<=tx2f;tx++){
            if(_pfSolid(tx,bty)){e.y=bty*_pfT-e.h;e.vy=0;e.onGround=true;break;}
        }
    } else if(e.vy<0){
        // Rising — check above (head bump)
        var tty=Math.floor(e.y/_pfT),tx1h=Math.floor(e.x/_pfT),tx2h=Math.floor((e.x+e.w-1)/_pfT);
        for(var tx=tx1h;tx<=tx2h;tx++){
            if(_pfSolid(tx,tty)){
                e.y=(tty+1)*_pfT;e.vy=0;
                // Hit block
                if(e.isPlayer||true)_pfHitBlock(tx,tty,e);
                break;
            }
        }
    }
    // Fall into pit
    if(e.y>_pfLevel.H*_pfT+100){
        e.dead=true;
        if(e.isPlayer){_pfDeathTimer=120;}
    }
    // Star timer
    if(e.starTimer>0){e.starTimer--;if(e.starTimer<=0)e.star=false;}
    e.frame++;
}

// ---- Hit block from below ----
function _pfHitBlock(tx,ty,ent){
    if(!_pfLevel)return;
    var t=_pfLevel.T[ty][tx];
    if(t===3){
        // Question block — spawn item
        _pfLevel.T[ty][tx]=8;
        var itemType=(Math.random()<0.3)?'star':'mushroom';
        _pfItems.push({x:tx*_pfT,y:ty*_pfT-_pfT,vx:2,vy:0,w:_pfT*0.8,h:_pfT*0.8,type:itemType,active:true});
        // Bounce particles
        for(var i=0;i<4;i++)_pfParticles.push({x:tx*_pfT+_pfT/2,y:ty*_pfT,vx:(Math.random()-0.5)*3,vy:-Math.random()*4,life:20,color:'#FFD700'});
    } else if(t===2&&ent.big){
        // Break brick when big
        _pfLevel.T[ty][tx]=0;
        for(var i=0;i<6;i++)_pfParticles.push({x:tx*_pfT+_pfT/2,y:ty*_pfT+_pfT/2,vx:(Math.random()-0.5)*5,vy:-Math.random()*6-2,life:30,color:'#C4713B'});
    }
}

// ---- Item physics ----
function _pfUpdateItems(){
    for(var i=_pfItems.length-1;i>=0;i--){
        var it=_pfItems[i];
        if(!it.active){_pfItems.splice(i,1);continue;}
        it.vy+=_pfGrav*0.5;
        it.x+=it.vx;it.y+=it.vy;
        // Ground collision
        var bty=Math.floor((it.y+it.h)/_pfT);
        var btx=Math.floor((it.x+it.w/2)/_pfT);
        if(_pfSolid(btx,bty)){it.y=bty*_pfT-it.h;it.vy=0;}
        // Wall bounce
        var wtx=Math.floor((it.vx>0?it.x+it.w:it.x)/_pfT);
        var wty=Math.floor((it.y+it.h/2)/_pfT);
        if(_pfSolid(wtx,wty))it.vx*=-1;
        // Collect by player or NPC
        var allEnts=[_pfPlayer].concat(_pfNPCs);
        for(var j=0;j<allEnts.length;j++){
            var e=allEnts[j];if(!e||e.dead)continue;
            if(it.x<e.x+e.w&&it.x+it.w>e.x&&it.y<e.y+e.h&&it.y+it.h>e.y){
                if(it.type==='mushroom'){e.big=true;e.h=_pfT*1.5;e.y-=_pfT*0.5;}
                else if(it.type==='star'){e.star=true;e.starTimer=600;}
                it.active=false;
                if(e.isPlayer){_pfCoins++;if(sfxEnabled)_pfPlayCoinSFX();}
                break;
            }
        }
        if(it.y>_pfLevel.H*_pfT+50)it.active=false;
    }
}

// ---- Enemy update ----
function _pfUpdateEnemies(){
    var allEnts=[_pfPlayer].concat(_pfNPCs);
    for(var i=_pfEnemies.length-1;i>=0;i--){
        var en=_pfEnemies[i];
        if(en.dead){_pfEnemies.splice(i,1);continue;}
        // Off screen far behind camera — skip
        if(en.x<_pfCamX-200){_pfEnemies.splice(i,1);continue;}
        en.vy+=_pfGrav;
        en.x+=en.shell?en.shellVx:en.vx;
        en.y+=en.vy;
        // Ground
        var bty=Math.floor((en.y+en.h)/_pfT),btx=Math.floor((en.x+en.w/2)/_pfT);
        if(_pfSolid(btx,bty)){en.y=bty*_pfT-en.h;en.vy=0;}
        // Wall bounce
        var wtx=Math.floor((en.vx>0?en.x+en.w:en.x)/_pfT);
        var wty=Math.floor((en.y+en.h/2)/_pfT);
        if(_pfSolid(wtx,wty)){en.vx*=-1;if(en.shell)en.shellVx*=-1;}
        // Edge detection — turn around at gaps
        if(!en.shell){
            var ahead=Math.floor((en.x+(en.vx>0?en.w+4:-4))/_pfT);
            var below=Math.floor((en.y+en.h+4)/_pfT);
            if(!_pfSolid(ahead,below))en.vx*=-1;
        }
        // Pit death
        if(en.y>_pfLevel.H*_pfT+50){en.dead=true;continue;}
        // Collision with players/NPCs
        for(var j=0;j<allEnts.length;j++){
            var e=allEnts[j];if(!e||e.dead)continue;
            if(en.x<e.x+e.w&&en.x+en.w>e.x&&en.y<e.y+e.h&&en.y+en.h>e.y){
                // Stomp from above
                if(e.vy>0&&e.y+e.h-en.y<en.h*0.5){
                    if(en.type==='koopa'&&!en.shell){en.shell=true;en.shellVx=0;en.h=_pfT*0.6;en.vx=0;}
                    else if(en.shell&&en.shellVx===0){en.shellVx=(e.x<en.x)?7:-7;}
                    else{en.dead=true;for(var p=0;p<4;p++)_pfParticles.push({x:en.x+en.w/2,y:en.y,vx:(Math.random()-0.5)*3,vy:-Math.random()*4,life:15,color:'#FF8844'});}
                    e.vy=_pfJF*0.6;
                    if(e.isPlayer){_pfCoins++;if(sfxEnabled)_pfPlayStompSFX();}
                } else if(e.star){
                    // Star power kills enemy
                    en.dead=true;
                    for(var p2=0;p2<4;p2++)_pfParticles.push({x:en.x+en.w/2,y:en.y,vx:(Math.random()-0.5)*4,vy:-Math.random()*5,life:20,color:'#FFFF00'});
                } else if(!en.shell||en.shellVx!==0){
                    // Hit player — shrink or die
                    if(e.big){e.big=false;e.h=_pfT;e.y+=_pfT*0.5;}
                    else{e.dead=true;if(e.isPlayer)_pfDeathTimer=120;}
                }
            }
        }
        en.frame++;
    }
}

// ---- Fireball update ----
function _pfUpdateFireballs(){
    for(var i=_pfFireballs.length-1;i>=0;i--){
        var fb=_pfFireballs[i];
        fb.x+=fb.vx;fb.vy+=_pfGrav*0.3;fb.y+=fb.vy;
        // Bounce on ground
        var bty=Math.floor((fb.y+fb.r)/_pfT),btx=Math.floor(fb.x/_pfT);
        if(_pfSolid(btx,bty)){fb.y=bty*_pfT-fb.r;fb.vy=-6;}
        // Wall — destroy
        var wtx=Math.floor((fb.vx>0?fb.x+fb.r:fb.x-fb.r)/_pfT);
        if(_pfSolid(wtx,Math.floor(fb.y/_pfT))){_pfFireballs.splice(i,1);continue;}
        // Hit enemy
        var hit=false;
        for(var j=0;j<_pfEnemies.length;j++){
            var en=_pfEnemies[j];if(en.dead)continue;
            if(fb.x>en.x&&fb.x<en.x+en.w&&fb.y>en.y&&fb.y<en.y+en.h){
                en.dead=true;hit=true;
                for(var p=0;p<4;p++)_pfParticles.push({x:en.x+en.w/2,y:en.y+en.h/2,vx:(Math.random()-0.5)*4,vy:-Math.random()*4,life:15,color:'#FF4400'});
                break;
            }
        }
        if(hit||fb.x<_pfCamX-100||fb.x>_pfCamX+_pfCanvas.width+100||fb.y>_pfLevel.H*_pfT+50){
            _pfFireballs.splice(i,1);continue;
        }
        fb.life--;if(fb.life<=0){_pfFireballs.splice(i,1);}
    }
}

// ---- NPC AI ----
function _pfUpdateNPCAI(npc){
    if(npc.dead||npc.won)return;
    npc.aiTimer++;
    // Follow player roughly — stay within 3-8 tiles
    var dx=_pfPlayer.x-npc.x;
    var dist=Math.abs(dx);
    // Move toward player
    if(dist>8*_pfT){npc.vx+=(dx>0?0.5:-0.5);}
    else if(dist>3*_pfT){npc.vx+=(dx>0?0.3:-0.3);}
    else{npc.vx*=0.9;} // slow down when close
    // Speed limit
    if(npc.vx>_pfMaxSpd*0.8)npc.vx=_pfMaxSpd*0.8;
    if(npc.vx<-_pfMaxSpd*0.8)npc.vx=-_pfMaxSpd*0.8;
    npc.facing=npc.vx>0?1:-1;
    // Jump: at gaps, walls, or randomly
    if(npc.onGround&&npc.jumpCD<=0){
        // Check for gap ahead
        var aheadX=npc.x+(npc.facing>0?npc.w+8:-8);
        var belowY=npc.y+npc.h+8;
        var gapAhead=!_pfSolid(Math.floor(aheadX/_pfT),Math.floor(belowY/_pfT));
        // Check for wall ahead
        var wallAhead=_pfSolid(Math.floor(aheadX/_pfT),Math.floor((npc.y+npc.h/2)/_pfT));
        // Check for enemy ahead
        var enemyNear=false;
        for(var ei=0;ei<_pfEnemies.length;ei++){
            var en=_pfEnemies[ei];if(en.dead)continue;
            if(Math.abs(en.x-npc.x)<_pfT*3&&Math.abs(en.y-npc.y)<_pfT*2){enemyNear=true;break;}
        }
        if(gapAhead||wallAhead||enemyNear||Math.random()<0.005){
            npc.vy=_pfJF*(0.8+Math.random()*0.3);
            npc.jumpCD=20;
        }
    }
    if(npc.jumpCD>0)npc.jumpCD--;
    // Fire fireballs if has star
    if(npc.star&&npc.aiTimer%40===0){
        _pfFireballs.push({x:npc.x+npc.w/2+npc.facing*10,y:npc.y+npc.h*0.3,vx:npc.facing*6,vy:-2,r:6,life:120,owner:npc});
    }
    // Flag reached
    if(!npc.won&&_pfFlag&&npc.x>=_pfFlag.tx*_pfT){npc.won=true;npc.vx=2;npc.vy=0;}
    if(npc.won){npc.vx=2;if(npc.x>_pfCastle.tx*_pfT){npc.vx=0;}}
}

// ---- Player input ----
function _pfHandleInput(){
    if(!_pfPlayer||_pfPlayer.dead||_pfPlayer.won)return;
    var p=_pfPlayer;
    // Movement
    if(_pfKeys.left){p.vx-=0.8;p.facing=-1;}
    else if(_pfKeys.right){p.vx+=0.8;p.facing=1;}
    else{p.vx*=0.85;}
    if(p.vx>_pfMaxSpd)p.vx=_pfMaxSpd;
    if(p.vx<-_pfMaxSpd)p.vx=-_pfMaxSpd;
    if(Math.abs(p.vx)<0.1)p.vx=0;
    // Jump
    if(_pfKeys.jump&&p.onGround){p.vy=_pfJF;if(sfxEnabled)_pfPlayJumpSFX();}
    // Fire
    if(_pfKeys.fire&&p.star&&p.frame%12===0){
        _pfFireballs.push({x:p.x+p.w/2+p.facing*10,y:p.y+p.h*0.3,vx:p.facing*7,vy:-2,r:6,life:120,owner:p});
        if(sfxEnabled)_pfPlayFireSFX();
    }
    // Flag
    if(!p.won&&_pfFlag&&p.x>=_pfFlag.tx*_pfT){
        p.won=true;_pfFlag.reached=true;_pfWinTimer=180;
        p.vx=2;p.vy=0;
    }
    if(p.won){p.vx=2;if(p.x>_pfCastle.tx*_pfT){p.vx=0;}}
}

// ---- Main update ----
function _pfUpdate(){
    if(!_pfActive||!_pfLevel)return;
    _pfHandleInput();
    _pfMoveEnt(_pfPlayer);
    for(var i=0;i<_pfNPCs.length;i++){_pfUpdateNPCAI(_pfNPCs[i]);_pfMoveEnt(_pfNPCs[i]);}
    _pfUpdateEnemies();
    _pfUpdateItems();
    _pfUpdateFireballs();
    // Particles
    for(var i=_pfParticles.length-1;i>=0;i--){
        var p=_pfParticles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life--;
        if(p.life<=0)_pfParticles.splice(i,1);
    }
    // Camera follows player
    var cw=_pfCanvas?_pfCanvas.width:800;
    _pfCamX=_pfPlayer.x-cw*0.35;
    if(_pfCamX<0)_pfCamX=0;
    if(_pfCamX>_pfLevel.W*_pfT-cw)_pfCamX=_pfLevel.W*_pfT-cw;
    // Timer
    _pfTimeCounter++;
    if(_pfTimeCounter%60===0&&_pfTime>0)_pfTime--;
    // Win
    if(_pfWinTimer>0){_pfWinTimer--;if(_pfWinTimer<=0)_pfEndGame(true);}
    // Death
    if(_pfDeathTimer>0){_pfDeathTimer--;if(_pfDeathTimer<=0)_pfEndGame(false);}
}

// ---- Drawing ----
function _pfDraw(){
    if(!_pfActive||!_pfCtx||!_pfLevel)return;
    var ctx=_pfCtx,W=_pfCanvas.width,H=_pfCanvas.height;
    var T=_pfT,L=_pfLevel;
    ctx.clearRect(0,0,W,H);
    // Sky gradient (sunset to match intro)
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#2a0540');sky.addColorStop(0.3,'#CC4444');sky.addColorStop(0.6,'#FF8844');sky.addColorStop(1,'#FFCC66');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Clouds
    ctx.fillStyle='rgba(255,255,255,0.3)';
    for(var ci=0;ci<8;ci++){
        var cx2=((ci*300+50)-_pfCamX*0.2)%W;
        ctx.beginPath();ctx.arc(cx2,40+ci*15,30+ci*5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(cx2+25,35+ci*15,20+ci*3,0,Math.PI*2);ctx.fill();
    }
    // Hills background
    ctx.fillStyle='rgba(100,60,30,0.3)';
    for(var hi=0;hi<5;hi++){
        var hx=((hi*400)-_pfCamX*0.3)%(W+400)-200;
        ctx.beginPath();ctx.arc(hx,H-20,120+hi*30,Math.PI,0);ctx.fill();
    }
    ctx.save();ctx.translate(-_pfCamX,0);
    // Tiles
    var startTX=Math.max(0,Math.floor(_pfCamX/T));
    var endTX=Math.min(L.W,Math.ceil((_pfCamX+W)/T)+1);
    for(var ty=0;ty<L.H;ty++){
        for(var tx=startTX;tx<endTX;tx++){
            var t=L.T[ty][tx];if(t===0)continue;
            var dx=tx*T,dy=ty*T;
            if(t===1){ctx.fillStyle='#8B5E3C';ctx.fillRect(dx,dy,T,T);ctx.fillStyle='#6B4E2C';ctx.fillRect(dx,dy,T,2);}
            else if(t===2){ctx.fillStyle='#C4713B';ctx.fillRect(dx,dy,T,T);ctx.strokeStyle='#A05020';ctx.lineWidth=1;ctx.strokeRect(dx+1,dy+1,T-2,T-2);ctx.beginPath();ctx.moveTo(dx+T/2,dy);ctx.lineTo(dx+T/2,dy+T);ctx.moveTo(dx,dy+T/2);ctx.lineTo(dx+T,dy+T/2);ctx.stroke();}
            else if(t===3){ctx.fillStyle='#FFD700';ctx.fillRect(dx,dy,T,T);ctx.fillStyle='#FFF';ctx.font='bold '+Math.floor(T*0.6)+'px sans-serif';ctx.textAlign='center';ctx.fillText('?',dx+T/2,dy+T*0.7);}
            else if(t===8){ctx.fillStyle='#887766';ctx.fillRect(dx,dy,T,T);}
            else if(t>=4&&t<=7){ctx.fillStyle=(t<=5)?'#33BB33':'#228822';ctx.fillRect(dx,dy,T,T);if(t<=5){ctx.fillStyle='#44DD44';ctx.fillRect(dx+4,dy+2,T-8,4);}}
            else if(t===9){ctx.fillStyle='#AA8866';ctx.fillRect(dx,dy,T,T);ctx.fillStyle='#887755';ctx.fillRect(dx+T*0.2,dy+T*0.2,T*0.6,T*0.6);}
        }
    }
    // Flag pole
    if(_pfFlag){
        var fx=_pfFlag.tx*T+T/2,fy=_pfFlag.ty*T;
        ctx.fillStyle='#888';ctx.fillRect(fx-2,fy,4,(L.H-2)*T-fy);
        // Flag
        var flagY=_pfFlag.reached?((L.H-3)*T):fy+10;
        ctx.fillStyle='#FF4444';ctx.beginPath();ctx.moveTo(fx,flagY);ctx.lineTo(fx+T,flagY+T/2);ctx.lineTo(fx,flagY+T);ctx.fill();
    }
    // Items
    for(var ii=0;ii<_pfItems.length;ii++){
        var it=_pfItems[ii];if(!it.active)continue;
        if(it.type==='mushroom'){ctx.fillStyle='#FF4444';ctx.beginPath();ctx.arc(it.x+it.w/2,it.y+it.h*0.3,it.w/2,Math.PI,0);ctx.fill();ctx.fillStyle='#FFE8CC';ctx.fillRect(it.x+it.w*0.2,it.y+it.h*0.3,it.w*0.6,it.h*0.5);ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(it.x+it.w*0.3,it.y+it.h*0.2,it.w*0.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(it.x+it.w*0.65,it.y+it.h*0.15,it.w*0.08,0,Math.PI*2);ctx.fill();}
        else{ctx.fillStyle='#FFDD00';var _stPts=5,_stR=it.w/2,_stIR=_stR*0.4;ctx.beginPath();for(var si=0;si<_stPts*2;si++){var sa=si*Math.PI/_stPts-Math.PI/2,sr=si%2===0?_stR:_stIR;ctx.lineTo(it.x+it.w/2+Math.cos(sa)*sr,it.y+it.h/2+Math.sin(sa)*sr);}ctx.closePath();ctx.fill();}
    }
    // Enemies
    for(var ei=0;ei<_pfEnemies.length;ei++){
        var en=_pfEnemies[ei];if(en.dead)continue;
        if(en.type==='goomba'){ctx.fillStyle='#884422';ctx.beginPath();ctx.arc(en.x+en.w/2,en.y+en.h*0.4,en.w/2,Math.PI,0);ctx.fill();ctx.fillStyle='#AA6633';ctx.fillRect(en.x+en.w*0.1,en.y+en.h*0.4,en.w*0.8,en.h*0.6);ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(en.x+en.w*0.3,en.y+en.h*0.3,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(en.x+en.w*0.7,en.y+en.h*0.3,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(en.x+en.w*0.3,en.y+en.h*0.3,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(en.x+en.w*0.7,en.y+en.h*0.3,1.5,0,Math.PI*2);ctx.fill();}
        else if(en.shell){ctx.fillStyle='#33AA33';ctx.beginPath();ctx.ellipse(en.x+en.w/2,en.y+en.h/2,en.w/2,en.h/2,0,0,Math.PI*2);ctx.fill();}
        else{ctx.fillStyle='#33AA33';ctx.fillRect(en.x,en.y,en.w,en.h);ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(en.x+en.w*0.3,en.y+en.h*0.2,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(en.x+en.w*0.7,en.y+en.h*0.2,3,0,Math.PI*2);ctx.fill();}
    }
    // Draw entities (player + NPCs)
    var allDraw=[_pfPlayer].concat(_pfNPCs);
    for(var di=0;di<allDraw.length;di++){
        var e=allDraw[di];if(!e||e.dead)continue;
        var ex=e.x,ey=e.y,ew=e.w,eh=e.h;
        // Body color (flash when star)
        var bc=e.color;
        if(e.star&&e.frame%4<2)bc='#FFFF00';
        // Egg body
        var _eg=ctx.createRadialGradient(ex+ew/2,ey+eh*0.4,eh*0.1,ex+ew/2,ey+eh*0.5,eh*0.5);
        _eg.addColorStop(0,'#FFFFFF');_eg.addColorStop(1,bc);
        ctx.fillStyle=_eg;
        ctx.beginPath();ctx.ellipse(ex+ew/2,ey+eh*0.5,ew/2,eh/2,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;ctx.stroke();
        // Eyes
        var eyeY2=ey+eh*0.35;
        ctx.fillStyle='#FFF';
        ctx.beginPath();ctx.ellipse(ex+ew*0.3,eyeY2,ew*0.12,eh*0.08,0,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(ex+ew*0.7,eyeY2,ew*0.12,eh*0.08,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#111';
        var pupilOff=e.facing*ew*0.03;
        ctx.beginPath();ctx.arc(ex+ew*0.3+pupilOff,eyeY2,ew*0.05,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(ex+ew*0.7+pupilOff,eyeY2,ew*0.05,0,Math.PI*2);ctx.fill();
        // Smile
        ctx.strokeStyle='#333';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ex+ew/2,ey+eh*0.5,ew*0.2,0.1*Math.PI,0.9*Math.PI);ctx.stroke();
        // Feet (walk animation)
        ctx.fillStyle=e.accent||'#FFCC00';
        var legOff=Math.sin(e.frame*0.3)*3;
        ctx.beginPath();ctx.ellipse(ex+ew*0.3,ey+eh-2+legOff,ew*0.15,4,0,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(ex+ew*0.7,ey+eh-2-legOff,ew*0.15,4,0,0,Math.PI*2);ctx.fill();
        // Player indicator
        if(e.isPlayer){ctx.fillStyle='#FFD700';var _iw=6;ctx.beginPath();ctx.moveTo(ex+ew/2,ey-12);ctx.lineTo(ex+ew/2-_iw,ey-4);ctx.lineTo(ex+ew/2+_iw,ey-4);ctx.fill();}
        // Big indicator
        if(e.big){ctx.strokeStyle='#FF4444';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ex+ew/2,ey-2,ew/2+4,0,Math.PI*2);ctx.stroke();}
    }
    // Fireballs
    ctx.fillStyle='#FF6600';
    for(var fi=0;fi<_pfFireballs.length;fi++){
        var fb=_pfFireballs[fi];
        ctx.beginPath();ctx.arc(fb.x,fb.y,fb.r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#FFCC00';ctx.beginPath();ctx.arc(fb.x,fb.y,fb.r*0.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#FF6600';
    }
    // Particles
    for(var pi=0;pi<_pfParticles.length;pi++){
        var pp=_pfParticles[pi];
        ctx.fillStyle=pp.color;ctx.globalAlpha=pp.life/30;
        ctx.fillRect(pp.x-3,pp.y-3,6,6);
    }
    ctx.globalAlpha=1;
    ctx.restore();
    // HUD
    ctx.fillStyle='#FFF';ctx.font='bold 18px sans-serif';ctx.textAlign='left';
    ctx.fillText('COINS: '+_pfCoins,10,25);
    ctx.fillText('TIME: '+_pfTime,W-120,25);
    // NPC count alive
    var npcAlive=0;for(var ni=0;ni<_pfNPCs.length;ni++)if(!_pfNPCs[ni].dead)npcAlive++;
    ctx.fillText('TEAM: '+(npcAlive+(_pfPlayer.dead?0:1)),W/2-40,25);
    // Win/death overlay
    if(_pfWinTimer>0){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#FFD700';ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText('CLEAR!',W/2,H/2);}
    if(_pfDeathTimer>0&&_pfDeathTimer<100){ctx.fillStyle='rgba(0,0,0,'+(1-_pfDeathTimer/100)+')';ctx.fillRect(0,0,W,H);}
}

// ---- Sound effects ----
function _pfPlayJumpSFX(){try{var c=ensureAudio();if(!c)return;var t=c.currentTime;var o=c.createOscillator();var g=c.createGain();o.type='sine';o.frequency.setValueAtTime(400,t);o.frequency.exponentialRampToValueAtTime(800,t+0.1);g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.15);}catch(e){}}
function _pfPlayCoinSFX(){try{var c=ensureAudio();if(!c)return;var t=c.currentTime;var o=c.createOscillator();var g=c.createGain();o.type='square';o.frequency.setValueAtTime(988,t);o.frequency.setValueAtTime(1319,t+0.05);g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.2);}catch(e){}}
function _pfPlayStompSFX(){try{var c=ensureAudio();if(!c)return;var t=c.currentTime;var o=c.createOscillator();var g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(80,t+0.1);g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.15);}catch(e){}}
function _pfPlayFireSFX(){try{var c=ensureAudio();if(!c)return;var t=c.currentTime;var o=c.createOscillator();var g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(200,t+0.1);g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.12);}catch(e){}}

// ---- Start / End ----
function _pfStart(){
    // Create canvas overlay
    if(!_pfCanvas){
        _pfCanvas=document.createElement('canvas');
        _pfCanvas.id='platformer-canvas';
        _pfCanvas.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;z-index:50;';
        document.body.appendChild(_pfCanvas);
    }
    _pfCanvas.width=window.innerWidth;_pfCanvas.height=window.innerHeight;
    _pfCtx=_pfCanvas.getContext('2d');
    _pfCanvas.style.display='block';
    // Generate level
    _pfLevel=_pfGenLevel();
    _pfSpawnEnemies();
    // Player
    var startY=(_pfLevel.H-3)*_pfT-_pfT;
    var ch=CHARACTERS[selectedChar];
    _pfPlayer=_pfMakeEnt(3*_pfT,startY,_pfT*0.8,_pfT,ch.portrait||'#F5F5F0',true);
    _pfPlayer.accent='#'+((ch.accent||0xFFCC00).toString(16)).padStart(6,'0');
    // NPCs — spawn 4 companions with random character colors
    _pfNPCs=[];
    var npcColors=['#FF8844','#44AAFF','#FFDD44','#FF44AA','#44FF88'];
    for(var i=0;i<4;i++){
        var npc=_pfMakeEnt((2+i*1.5)*_pfT,startY,_pfT*0.8,_pfT,npcColors[i],false);
        npc.accent=npcColors[(i+2)%npcColors.length];
        _pfNPCs.push(npc);
    }
    _pfItems=[];_pfFireballs=[];_pfParticles=[];
    _pfCoins=0;_pfTime=300;_pfTimeCounter=0;
    _pfWinTimer=0;_pfDeathTimer=0;
    _pfCamX=0;
    _pfActive=true;_pfStarted=true;
    // Input
    _pfCanvas.addEventListener('keydown',_pfKeyDown);
    _pfCanvas.addEventListener('keyup',_pfKeyUp);
    window.addEventListener('keydown',_pfKeyDown);
    window.addEventListener('keyup',_pfKeyUp);
    // Touch controls
    _pfCanvas.addEventListener('touchstart',_pfTouch,{passive:false});
    _pfCanvas.addEventListener('touchmove',_pfTouch,{passive:false});
    _pfCanvas.addEventListener('touchend',_pfTouchEnd,{passive:false});
    // Start loop
    _pfLoop();
}

function _pfEndGame(won){
    _pfActive=false;
    if(_pfCanvas)_pfCanvas.style.display='none';
    window.removeEventListener('keydown',_pfKeyDown);
    window.removeEventListener('keyup',_pfKeyUp);
    // Return to city
    if(typeof gameState!=='undefined')gameState='city';
    if(typeof _showCityUI==='function')_showCityUI();
    // Award coins
    if(won&&typeof coins!=='undefined'){coins+=_pfCoins*10;if(typeof _updateCoinDisplay==='function')_updateCoinDisplay();}
}

var _pfLoopId=null;
function _pfLoop(){
    if(!_pfActive){if(_pfLoopId)cancelAnimationFrame(_pfLoopId);return;}
    _pfUpdate();
    _pfDraw();
    _pfLoopId=requestAnimationFrame(_pfLoop);
}

// ---- Input handlers ----
function _pfKeyDown(e){
    if(!_pfActive)return;
    if(e.code==='KeyA'||e.code==='ArrowLeft'){_pfKeys.left=true;e.preventDefault();}
    if(e.code==='KeyD'||e.code==='ArrowRight'){_pfKeys.right=true;e.preventDefault();}
    if(e.code==='Space'||e.code==='KeyW'||e.code==='ArrowUp'){_pfKeys.jump=true;e.preventDefault();}
    if(e.code==='KeyR'||e.code==='KeyF'){_pfKeys.fire=true;e.preventDefault();}
    if(e.code==='Escape'){_pfEndGame(false);}
}
function _pfKeyUp(e){
    if(e.code==='KeyA'||e.code==='ArrowLeft')_pfKeys.left=false;
    if(e.code==='KeyD'||e.code==='ArrowRight')_pfKeys.right=false;
    if(e.code==='Space'||e.code==='KeyW'||e.code==='ArrowUp')_pfKeys.jump=false;
    if(e.code==='KeyR'||e.code==='KeyF')_pfKeys.fire=false;
}
// Touch: left half=left, right half=right, tap right=jump, double tap=fire
var _pfTouchX=0;
function _pfTouch(e){
    e.preventDefault();
    var t=e.touches[0];if(!t)return;
    _pfTouchX=t.clientX;
    var w=window.innerWidth;
    _pfKeys.left=t.clientX<w*0.3;
    _pfKeys.right=t.clientX>w*0.5&&t.clientX<w*0.8;
    _pfKeys.jump=t.clientY<window.innerHeight*0.5;
    _pfKeys.fire=t.clientX>w*0.8;
}
function _pfTouchEnd(e){e.preventDefault();_pfKeys.left=false;_pfKeys.right=false;_pfKeys.jump=false;_pfKeys.fire=false;}
