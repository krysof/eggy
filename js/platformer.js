// ============================================================
//  platformer.js — 2.5D Mario-style side-scrolling platformer
//  Uses existing 3D engine, camera from side, movement on X-Y plane
// ============================================================
var _pfActive=false;
var _pfScene=null,_pfGroup=null;
var _pfTileSize=PLATFORMER_CONFIG.tileSize;
var _pfLevel=null;
var _pfEnemies=[],_pfItems=[],_pfFireballs=[],_pfParticles=[];
var _pfFlag=null,_pfCastleX=0;
var _pfWinTimer=0,_pfDeathTimer=0,_pfCoins=0,_pfTime=PLATFORMER_CONFIG.timeLimit,_pfTimeCnt=0;
var _pfNPCList=[];
var _pfGrav=PLATFORMER_CONFIG.gravity,_pfJF=PLATFORMER_CONFIG.jumpForce,_pfMaxSpd=PLATFORMER_CONFIG.maxSpeed;
var _pfPlayerStartX=4,_pfPlayerStartY=5;
var _pfCamTarget={x:0,y:5};

// ---- Level generation (tiles in X-Y plane, Z=0) ----
function _pfGenLevel(){
    var W=PLATFORMER_CONFIG.levelWidth,H=PLATFORMER_CONFIG.levelHeight,T=_pfTileSize;
    var tiles=[];
    for(var y=0;y<H;y++){tiles[y]=[];for(var x=0;x<W;x++)tiles[y][x]=0;}
    for(var x=0;x<W;x++){tiles[0][x]=1;tiles[1][x]=1;}
    PLATFORMER_CONFIG.gaps.forEach(function(g){for(var x=g[0];x<g[1];x++){tiles[0][x]=0;tiles[1][x]=0;}});
    PLATFORMER_CONFIG.brickPlatforms.forEach(function(b){
        for(var x=b[0];x<b[1];x++)tiles[b[2]][x]=2;
    });
    // Question blocks
    PLATFORMER_CONFIG.questionBlocks.forEach(function(q){tiles[q[1]][q[0]]=3;});
    // Pipes
    PLATFORMER_CONFIG.pipes.forEach(function(p){
        var px=p[0],ph=p[1];
        for(var py=0;py<ph;py++){
            tiles[2+py][px]=4;tiles[2+py][px+1]=4;
        }
    });
    // Staircase to flag
    for(var si=0;si<8;si++)for(var sy=0;sy<=si;sy++)tiles[2+sy][W-22+si]=1;
    // Flag position
    _pfFlag={tx:W-14,ty:10};
    _pfCastleX=(W-6)*T;
    return {tiles:tiles,W:W,H:H};
}

// ---- Build 3D scene from tiles ----
function _pfBuildScene(){
    if(_pfGroup){scene.remove(_pfGroup);}
    _pfGroup=new THREE.Group();
    var T=_pfTileSize,L=_pfLevel;
    var tileMats={
        1:toon(0x8B5E3C),2:toon(0xC4713B),3:toon(0xFFD700),
        4:toon(0x33AA33),8:toon(0x888888),9:toon(0xAA8866)
    };
    var tileGeo=new THREE.BoxGeometry(T,T,T);
    for(var y=0;y<L.H;y++){
        for(var x=0;x<L.W;x++){
            var t=L.tiles[y][x];if(t===0)continue;
            var mat=tileMats[t]||tileMats[1];
            var m=new THREE.Mesh(tileGeo,mat);
            m.position.set(x*T+T/2,y*T+T/2,0);
            m.userData._tileX=x;m.userData._tileY=y;
            _pfGroup.add(m);
        }
    }
    // Flag pole
    if(_pfFlag){
        var fpGeo=new THREE.CylinderGeometry(0.1,0.1,10*T,6);
        var fp=new THREE.Mesh(fpGeo,toon(0x888888));
        fp.position.set(_pfFlag.tx*T+T/2,_pfFlag.ty*T/2+T,0);
        _pfGroup.add(fp);
        // Flag
        var flagGeo=new THREE.PlaneGeometry(T*1.5,T);
        var flagMat=new THREE.MeshBasicMaterial({color:0xFF4444,side:THREE.DoubleSide});
        var flag=new THREE.Mesh(flagGeo,flagMat);
        flag.position.set(_pfFlag.tx*T+T*1.2,(_pfFlag.ty+1)*T,0);
        _pfGroup.add(flag);
        window._pfFlagMesh=flag;
    }
    // Castle
    var castleGeo=new THREE.BoxGeometry(T*6,T*5,T*3);
    var castle=new THREE.Mesh(castleGeo,toon(0xAA8866));
    castle.position.set(_pfCastleX,T*4.5,0);
    _pfGroup.add(castle);
    // Castle door
    var doorGeo=new THREE.BoxGeometry(T*1.5,T*2,T*0.5);
    var door=new THREE.Mesh(doorGeo,toon(0x442200));
    door.position.set(_pfCastleX,T*3,T*1.6);
    _pfGroup.add(door);
    // Background — sky plane
    var bgGeo=new THREE.PlaneGeometry(L.W*T+100,L.H*T+50);
    var bgMat=new THREE.MeshBasicMaterial({color:0x87CEEB,side:THREE.DoubleSide});
    var bg=new THREE.Mesh(bgGeo,bgMat);
    bg.position.set(L.W*T/2,L.H*T/2,-T*3);
    _pfGroup.add(bg);
    // Ground decoration — grass on top of ground tiles
    for(var gx=0;gx<L.W;gx++){
        if(L.tiles[1][gx]===1&&(L.tiles[2]?L.tiles[2][gx]===0:true)){
            var grass=new THREE.Mesh(new THREE.BoxGeometry(T,T*0.2,T),toon(0x44AA44));
            grass.position.set(gx*T+T/2,2*T+T*0.1,0);
            _pfGroup.add(grass);
        }
    }
    scene.add(_pfGroup);
}

// ---- Tile collision ----
function _pfSolid(tx,ty){
    if(!_pfLevel||tx<0||ty<0||tx>=_pfLevel.W||ty>=_pfLevel.H)return false;
    var t=_pfLevel.tiles[ty][tx];
    return t>=1&&t<=9;
}

// ---- Entity physics (X=horizontal, Y=vertical, Z=0) ----
function _pfMoveEnt(egg){
    if(!egg||!egg.alive||egg._pfWon)return;
    var T=_pfTileSize;
    // Apply gravity
    egg.vy-=_pfGrav;
    // Horizontal movement
    egg.mesh.position.x+=egg.vx;
    // Left/right tile collision
    var ex=egg.mesh.position.x,ey=egg.mesh.position.y;
    var hw=0.5,hh=0.6; // half-width, half-height of egg
    if(egg.vx>0){
        var tx=Math.floor((ex+hw)/T),ty1=Math.floor((ey-hh)/T),ty2=Math.floor((ey+hh)/T);
        for(var ty=ty1;ty<=ty2;ty++){if(_pfSolid(tx,ty)){egg.mesh.position.x=tx*T-hw;egg.vx=0;break;}}
    } else if(egg.vx<0){
        var tx2=Math.floor((ex-hw)/T),ty1b=Math.floor((ey-hh)/T),ty2b=Math.floor((ey+hh)/T);
        for(var ty=ty1b;ty<=ty2b;ty++){if(_pfSolid(tx2,ty)){egg.mesh.position.x=(tx2+1)*T+hw;egg.vx=0;break;}}
    }
    // Vertical movement
    egg.mesh.position.y+=egg.vy;
    egg._pfOnGround=false;
    ex=egg.mesh.position.x;ey=egg.mesh.position.y;
    if(egg.vy<0){
        // Falling — check below
        var bty=Math.floor((ey-hh)/T),btx1=Math.floor((ex-hw*0.8)/T),btx2=Math.floor((ex+hw*0.8)/T);
        for(var tx=btx1;tx<=btx2;tx++){
            if(_pfSolid(tx,bty)){egg.mesh.position.y=(bty+1)*T+hh;egg.vy=0;egg._pfOnGround=true;break;}
        }
    } else if(egg.vy>0){
        // Rising — head bump
        var tty=Math.floor((ey+hh)/T),ttx1=Math.floor((ex-hw*0.8)/T),ttx2=Math.floor((ex+hw*0.8)/T);
        for(var tx=ttx1;tx<=ttx2;tx++){
            if(_pfSolid(tx,tty)){
                egg.mesh.position.y=tty*T-hh;egg.vy=0;
                _pfHitBlock(tx,tty,egg);
                break;
            }
        }
    }
    // Keep Z at 0
    egg.mesh.position.z=0;
    // Fall into pit
    if(egg.mesh.position.y<-5){
        egg.alive=false;
        if(egg.isPlayer)_pfDeathTimer=120;
    }
    // Star timer
    if(egg._pfStarTimer>0){egg._pfStarTimer--;if(egg._pfStarTimer<=0)egg._pfStar=false;}
}

// ---- Hit block from below ----
function _pfHitBlock(tx,ty,egg){
    if(!_pfLevel)return;
    var t=_pfLevel.tiles[ty][tx];
    var T=_pfTileSize;
    if(t===3){
        // Question block — spawn item
        _pfLevel.tiles[ty][tx]=8;
        // Update mesh color
        _pfGroup.children.forEach(function(c){if(c.userData._tileX===tx&&c.userData._tileY===ty)c.material=toon(0x888888);});
        // Spawn item
        var itemType=(Math.random()<PLATFORMER_CONFIG.mushroomChance)?'star':'mushroom';
        var itemColor=itemType==='star'?0xFFDD00:0xFF4444;
        var itemMesh=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6),toon(itemColor));
        itemMesh.position.set(tx*T+T/2,(ty+1)*T+T/2,0);
        _pfGroup.add(itemMesh);
        _pfItems.push({mesh:itemMesh,type:itemType,vx:0.05,vy:0,active:true});
        if(sfxEnabled)try{var c=ensureAudio();if(c){var t2=c.currentTime;var o=c.createOscillator();var g=c.createGain();o.type='square';o.frequency.setValueAtTime(988,t2);o.frequency.setValueAtTime(1319,t2+0.05);g.gain.setValueAtTime(0.06,t2);g.gain.exponentialRampToValueAtTime(0.001,t2+0.2);o.connect(g);g.connect(c.destination);o.start(t2);o.stop(t2+0.2);}}catch(e){}
    } else if(t===2&&egg._pfBig){
        // Break brick
        _pfLevel.tiles[ty][tx]=0;
        _pfGroup.children.forEach(function(c){if(c.userData._tileX===tx&&c.userData._tileY===ty){_pfGroup.remove(c);}});
    }
}

// ---- Item update ----
function _pfUpdateItems(){
    var T=_pfTileSize;
    for(var i=_pfItems.length-1;i>=0;i--){
        var it=_pfItems[i];if(!it.active){_pfGroup.remove(it.mesh);_pfItems.splice(i,1);continue;}
        it.vy-=_pfGrav*0.5;
        it.mesh.position.x+=it.vx;it.mesh.position.y+=it.vy;
        // Ground
        var bty=Math.floor((it.mesh.position.y-0.4)/T);
        if(_pfSolid(Math.floor(it.mesh.position.x/T),bty)){it.mesh.position.y=(bty+1)*T+0.4;it.vy=0;}
        // Wall bounce
        var wtx=Math.floor((it.mesh.position.x+(it.vx>0?0.4:-0.4))/T);
        if(_pfSolid(wtx,Math.floor(it.mesh.position.y/T)))it.vx*=-1;
        // Collect
        var allE=[playerEgg].concat(_pfNPCList);
        for(var j=0;j<allE.length;j++){
            var e=allE[j];if(!e||!e.alive)continue;
            var dx=e.mesh.position.x-it.mesh.position.x,dy=e.mesh.position.y-it.mesh.position.y;
            if(Math.sqrt(dx*dx+dy*dy)<1.5){
                if(it.type==='mushroom'){e._pfBig=true;e.mesh.scale.set(1.4,1.4,1.4);}
                else{e._pfStar=true;e._pfStarTimer=PLATFORMER_CONFIG.starDuration;}
                it.active=false;
                if(e.isPlayer){_pfCoins++;playGrabSound();}
                break;
            }
        }
        if(it.mesh.position.y<-5)it.active=false;
    }
}

// ---- Enemies ----
function _pfSpawnEnemies(){
    _pfEnemies=[];
    var T=_pfTileSize;
    var spots=PLATFORMER_CONFIG.enemySpots;
    for(var i=0;i<spots.length;i++){
        var isKoopa=(i%3===2);
        var color=isKoopa?0x33AA33:0x884422;
        var eMesh=new THREE.Mesh(new THREE.SphereGeometry(isKoopa?0.5:0.4,8,6),toon(color));
        // Eyes
        var eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.1,4,4),toon(0xFFFFFF));
        eyeL.position.set(-0.15,0.15,0.35);eMesh.add(eyeL);
        var eyeR=eyeL.clone();eyeR.position.set(0.15,0.15,0.35);eMesh.add(eyeR);
        var pupL=new THREE.Mesh(new THREE.SphereGeometry(0.05,3,3),toon(0x000000));
        pupL.position.set(-0.15,0.15,0.42);eMesh.add(pupL);
        var pupR=pupL.clone();pupR.position.set(0.15,0.15,0.42);eMesh.add(pupR);
        eMesh.position.set(spots[i]*T+T/2,3*T,0);
        _pfGroup.add(eMesh);
        _pfEnemies.push({mesh:eMesh,vx:isKoopa?-0.06:-0.04,vy:0,type:isKoopa?'koopa':'goomba',dead:false,shell:false,shellVx:0});
    }
}

function _pfUpdateEnemies(){
    var T=_pfTileSize;
    var allE=[playerEgg].concat(_pfNPCList);
    for(var i=_pfEnemies.length-1;i>=0;i--){
        var en=_pfEnemies[i];if(en.dead){_pfGroup.remove(en.mesh);_pfEnemies.splice(i,1);continue;}
        // Off screen far behind
        if(en.mesh.position.x<_pfCamTarget.x-60){_pfGroup.remove(en.mesh);_pfEnemies.splice(i,1);continue;}
        en.vy-=_pfGrav;
        var spd=en.shell?en.shellVx:en.vx;
        en.mesh.position.x+=spd;en.mesh.position.y+=en.vy;
        // Ground
        var bty=Math.floor((en.mesh.position.y-0.4)/T);
        var btx=Math.floor(en.mesh.position.x/T);
        if(_pfSolid(btx,bty)){en.mesh.position.y=(bty+1)*T+0.4;en.vy=0;}
        // Wall
        var wtx=Math.floor((en.mesh.position.x+(spd>0?0.5:-0.5))/T);
        if(_pfSolid(wtx,Math.floor(en.mesh.position.y/T))){en.vx*=-1;if(en.shell)en.shellVx*=-1;}
        // Edge — turn at gaps
        if(!en.shell){
            var ahead=Math.floor((en.mesh.position.x+(en.vx>0?1:-1))/T);
            var below=Math.floor((en.mesh.position.y-1)/T);
            if(!_pfSolid(ahead,below))en.vx*=-1;
        }
        // Pit
        if(en.mesh.position.y<-5){en.dead=true;continue;}
        // Collision with eggs
        for(var j=0;j<allE.length;j++){
            var e=allE[j];if(!e||!e.alive)continue;
            var dx=e.mesh.position.x-en.mesh.position.x,dy=e.mesh.position.y-en.mesh.position.y;
            var d=Math.sqrt(dx*dx+dy*dy);
            if(d<1.2){
                // Stomp from above
                if(e.vy<-0.05&&dy>0.3){
                    if(en.type==='koopa'&&!en.shell){en.shell=true;en.shellVx=0;en.mesh.scale.y=0.5;}
                    else if(en.shell&&en.shellVx===0){en.shellVx=(dx>0)?0.3:-0.3;}
                    else{en.dead=true;}
                    e.vy=_pfJF*0.6;
                    if(e.isPlayer){_pfCoins++;playHitSound();}
                } else if(e._pfStar){
                    en.dead=true;
                } else if(!en.shell||en.shellVx!==0){
                    if(e._pfBig){e._pfBig=false;e.mesh.scale.set(1,1,1);}
                    else{e.alive=false;if(e.isPlayer)_pfDeathTimer=120;}
                }
            }
        }
    }
}

// ---- Fireball ----
function _pfShootFireball(egg){
    var T=_pfTileSize;
    var fb=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),new THREE.MeshBasicMaterial({color:0xFF6600}));
    fb.position.set(egg.mesh.position.x+egg.facing*0.8,egg.mesh.position.y+0.3,0);
    _pfGroup.add(fb);
    _pfFireballs.push({mesh:fb,vx:egg.facing*0.3,vy:0,life:180});
}

function _pfUpdateFireballs(){
    var T=_pfTileSize;
    for(var i=_pfFireballs.length-1;i>=0;i--){
        var fb=_pfFireballs[i];
        fb.vy-=_pfGrav*0.3;fb.mesh.position.x+=fb.vx;fb.mesh.position.y+=fb.vy;
        // Bounce
        var bty=Math.floor((fb.mesh.position.y-0.2)/T);
        if(_pfSolid(Math.floor(fb.mesh.position.x/T),bty)){fb.mesh.position.y=(bty+1)*T+0.2;fb.vy=0.2;}
        // Wall
        var wtx=Math.floor((fb.mesh.position.x+(fb.vx>0?0.3:-0.3))/T);
        if(_pfSolid(wtx,Math.floor(fb.mesh.position.y/T))){_pfGroup.remove(fb.mesh);_pfFireballs.splice(i,1);continue;}
        // Hit enemy
        var hit=false;
        for(var j=0;j<_pfEnemies.length;j++){
            var en=_pfEnemies[j];if(en.dead)continue;
            if(Math.abs(fb.mesh.position.x-en.mesh.position.x)<1&&Math.abs(fb.mesh.position.y-en.mesh.position.y)<1){
                en.dead=true;hit=true;break;
            }
        }
        fb.life--;
        if(hit||fb.life<=0||fb.mesh.position.y<-5){_pfGroup.remove(fb.mesh);_pfFireballs.splice(i,1);}
    }
}

// ---- NPC AI for platformer ----
function _pfNPCAI(npc){
    if(!npc||!npc.alive||npc._pfWon)return;
    var T=_pfTileSize;
    // Follow player
    var dx=playerEgg.mesh.position.x-npc.mesh.position.x;
    var dist=Math.abs(dx);
    if(dist>6){npc.vx+=(dx>0?0.015:-0.015);}
    else if(dist>2){npc.vx+=(dx>0?0.008:-0.008);}
    else{npc.vx*=0.9;}
    if(npc.vx>_pfMaxSpd*0.8)npc.vx=_pfMaxSpd*0.8;
    if(npc.vx<-_pfMaxSpd*0.8)npc.vx=-_pfMaxSpd*0.8;
    npc.facing=npc.vx>0?1:-1;
    // Jump
    if(npc._pfOnGround){
        var ahead=Math.floor((npc.mesh.position.x+(npc.facing>0?1.5:-1.5))/T);
        var below=Math.floor((npc.mesh.position.y-1.5)/T);
        var wall=_pfSolid(ahead,Math.floor(npc.mesh.position.y/T));
        var gap=!_pfSolid(ahead,below);
        var enemyNear=false;
        for(var ei=0;ei<_pfEnemies.length;ei++){
            var en=_pfEnemies[ei];if(en.dead)continue;
            if(Math.abs(en.mesh.position.x-npc.mesh.position.x)<T*3)enemyNear=true;
        }
        if(gap||wall||enemyNear||Math.random()<0.003){
            npc.vy=_pfJF*(0.8+Math.random()*0.3);
        }
    }
    // Fire if star
    if(npc._pfStar&&Math.random()<0.02){_pfShootFireball(npc);}
    // Flag
    if(!npc._pfWon&&_pfFlag&&npc.mesh.position.x>=_pfFlag.tx*T){
        npc._pfWon=true;npc.vx=0.1;
    }
    if(npc._pfWon&&npc.mesh.position.x>_pfCastleX){npc.vx=0;}
}

// ---- Player input override for platformer ----
function _pfHandleInput(){
    if(!playerEgg||!playerEgg.alive||playerEgg._pfWon)return;
    var p=playerEgg;
    // Only allow left/right movement (no Z movement)
    var moveX=0;
    if(keys['KeyA']||keys['ArrowLeft'])moveX-=1;
    if(keys['KeyD']||keys['ArrowRight'])moveX+=1;
    if(joyActive)moveX+=joyVec.x;
    p.vx+=moveX*0.04;
    if(p.vx>_pfMaxSpd)p.vx=_pfMaxSpd;
    if(p.vx<-_pfMaxSpd)p.vx=-_pfMaxSpd;
    if(Math.abs(moveX)<0.1)p.vx*=0.85;
    p.facing=p.vx>0.01?1:(p.vx<-0.01?-1:p.facing);
    // Jump
    if((keys['Space']||keys['KeyW']||keys['ArrowUp'])&&p._pfOnGround){
        p.vy=_pfJF;playJumpSound();
    }
    // Fire
    if((keys['KeyR']||keys['KeyF'])&&p._pfStar&&(!p._pfFireCD||p._pfFireCD<=0)){
        _pfShootFireball(p);p._pfFireCD=15;
    }
    if(p._pfFireCD>0)p._pfFireCD--;
    // Flag
    if(!p._pfWon&&_pfFlag&&p.mesh.position.x>=_pfFlag.tx*_pfTileSize){
        p._pfWon=true;_pfWinTimer=180;p.vx=0.1;
    }
    if(p._pfWon&&p.mesh.position.x>_pfCastleX){p.vx=0;}
}

// ---- Camera ----
function _pfUpdateCamera(){
    if(!playerEgg)return;
    _pfCamTarget.x=playerEgg.mesh.position.x;
    _pfCamTarget.y=Math.max(playerEgg.mesh.position.y,5);
    // Side view camera — look from Z axis
    camera.position.x+=((_pfCamTarget.x)-camera.position.x)*0.1;
    camera.position.y+=((_pfCamTarget.y+3)-camera.position.y)*0.1;
    camera.position.z=25; // side view distance
    camera.lookAt(new THREE.Vector3(_pfCamTarget.x,_pfCamTarget.y,0));
}

// ---- Main update (called from gameloop when gameState==='platformer') ----
function _pfGameUpdate(){
    if(!_pfActive)return;
    _pfHandleInput();
    _pfMoveEnt(playerEgg);
    for(var i=0;i<_pfNPCList.length;i++){_pfNPCAI(_pfNPCList[i]);_pfMoveEnt(_pfNPCList[i]);}
    _pfUpdateEnemies();
    _pfUpdateItems();
    _pfUpdateFireballs();
    _pfUpdateCamera();
    // Timer
    _pfTimeCnt++;if(_pfTimeCnt%60===0&&_pfTime>0)_pfTime--;
    // Win
    if(_pfWinTimer>0){_pfWinTimer--;if(_pfWinTimer<=0)_pfEndGame(true);}
    if(_pfDeathTimer>0){_pfDeathTimer--;if(_pfDeathTimer<=0)_pfEndGame(false);}
    // Star visual — flash body color
    var allE=[playerEgg].concat(_pfNPCList);
    for(var j=0;j<allE.length;j++){
        var e=allE[j];if(!e||!e.alive)continue;
        if(e._pfStar){
            var b=e.mesh.userData.body;
            if(b&&e._pfStarTimer%4<2){b.material.emissive=new THREE.Color(0xFFFF00);b.material.emissiveIntensity=0.5;}
            else if(b){b.material.emissiveIntensity=0;}
        }
    }
}

// ---- Start platformer ----
function _pfStart(){
    _pfLevel=_pfGenLevel();
    _pfItems=[];_pfFireballs=[];_pfCoins=0;_pfTime=300;_pfTimeCnt=0;
    _pfWinTimer=0;_pfDeathTimer=0;
    var T=_pfTileSize;
    // Remove ALL existing objects from scene except camera/lights
    var toRemove=[];
    scene.children.forEach(function(c){if(c.type!=='AmbientLight'&&c.type!=='DirectionalLight'&&c.type!=='HemisphereLight'&&c!==camera)toRemove.push(c);});
    toRemove.forEach(function(c){scene.remove(c);});
    // Build platformer scene
    _pfBuildScene();
    _pfSpawnEnemies();
    // Place player at start
    var ch=CHARACTERS[selectedChar];
    var pColor=ch.color||0xF5F5F0;
    var pAccent=ch.accent||0xFFCC00;
    var pType=ch.type||'egg';
    playerEgg.mesh=createEggMesh(pColor,pAccent,pType);
    playerEgg.mesh.position.set(_pfPlayerStartX*T,2*T+1,0);
    playerEgg.vx=0;playerEgg.vy=0;playerEgg.vz=0;
    playerEgg._pfOnGround=false;playerEgg._pfBig=false;playerEgg._pfStar=false;playerEgg._pfStarTimer=0;playerEgg._pfWon=false;playerEgg._pfFireCD=0;
    playerEgg.alive=true;playerEgg.facing=1;
    scene.add(playerEgg.mesh);
    // Spawn NPC companions
    _pfNPCList=[];
    var npcColors=PLATFORMER_CONFIG.npcColors;
    var npcAccents=PLATFORMER_CONFIG.npcAccents;
    for(var i=0;i<PLATFORMER_CONFIG.npcCount;i++){
        var nMesh=createEggMesh(npcColors[i],npcAccents[i],'egg');
        nMesh.position.set((2+i*1.5)*T,4*T,0);
        scene.add(nMesh);
        var npc={mesh:nMesh,vx:0,vy:0,vz:0,alive:true,isPlayer:false,facing:1,
            _pfOnGround:false,_pfBig:false,_pfStar:false,_pfStarTimer:0,_pfWon:false,
            onGround:false,squash:1,throwTimer:0,_stunTimer:0,heldBy:null,holding:null};
        _pfNPCList.push(npc);
    }
    _pfActive=true;
    gameState='platformer';
    // Hide city UI
    var hud=document.getElementById('city-hud');if(hud)hud.style.display='none';
    document.getElementById('portal-prompt').style.display='none';
    var tc=document.getElementById('touch-controls');if(tc)tc.classList.remove('hidden');
}

// ---- End platformer ----
function _pfEndGame(won){
    _pfActive=false;
    // Remove platformer scene
    if(_pfGroup){scene.remove(_pfGroup);_pfGroup=null;}
    // Remove NPC meshes
    for(var i=0;i<_pfNPCList.length;i++){if(_pfNPCList[i].mesh)scene.remove(_pfNPCList[i].mesh);}
    _pfNPCList=[];
    // Remove enemies/items/fireballs
    _pfEnemies=[];_pfItems=[];_pfFireballs=[];
    // Award coins
    if(won){coins+=_pfCoins*10;if(typeof _updateCoinDisplay==='function')_updateCoinDisplay();}
    // Return to city
    gameState='city';
    if(typeof switchCity==='function')switchCity(currentCityStyle);
}
