// ============================================================
//  platformer.js — Side-scrolling adventure using existing city engine
//  Creates a new scene with a long narrow map, side-view camera
// ============================================================
var _pfActive=false;
var _pfSavedCity=-1;

function _pfStart(){
    _pfSavedCity=currentCityStyle;
    // Clean up current city completely
    if(typeof cleanupCity==='function')cleanupCity();
    // Reset arrays
    cityNPCs.length=0;
    cityColliders.length=0;
    cityCoins.length=0;
    // Remove old cityGroup children
    while(cityGroup.children.length>0)cityGroup.remove(cityGroup.children[0]);
    // Set special city style
    currentCityStyle=99;
    gameState='city';
    // Build the platformer level
    _pfBuildLevel();
    // Create player egg at start position
    var ch=CHARACTERS[selectedChar];
    playerEgg=createEgg(4,0,ch.color,ch.accent,true,scene,ch.type);
    playerEgg.mesh.position.set(4,1,0);
    playerEgg.isPlayer=true;
    allEggs.push(playerEgg);
    // Spawn NPC companions — each is a different character
    var npcChars=[];
    for(var ci=0;ci<CHARACTERS.length;ci++){if(ci!==selectedChar)npcChars.push(ci);}
    // Shuffle and pick 4
    for(var si=npcChars.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var tmp=npcChars[si];npcChars[si]=npcChars[sj];npcChars[sj]=tmp;}
    var npcCount=Math.min(4,npcChars.length);
    for(var ni=0;ni<npcCount;ni++){
        var nch=CHARACTERS[npcChars[ni]];
        var npc=createEgg(2+ni*2,0,nch.color,nch.accent,false,scene,nch.type);
        npc.mesh.position.set(2+ni*2,1,ni*2-3);
        npc.cityNPC=true;
        cityNPCs.push(npc);
        allEggs.push(npc);
    }
    scene.add(cityGroup);
    _pfActive=true;
    // Show UI
    var hud=document.getElementById('city-hud');if(hud)hud.style.display='';
    var tc=document.getElementById('touch-controls');if(tc)tc.classList.remove('hidden');
    // Apply basic lighting for the scene
    scene.fog=null;
    if(R)R.setClearColor(0x87CEEB);
}

function _pfBuildLevel(){
    var T=4; // tile size
    var L=120; // level length in tiles
    var W=T*L;
    var D=T*3; // depth (Z width)
    // ---- Ground ----
    var ground=new THREE.Mesh(new THREE.BoxGeometry(W,1,D),toon(0x44AA44));
    ground.position.set(W/2,-0.5,0);ground.receiveShadow=true;
    cityGroup.add(ground);
    var dirt=new THREE.Mesh(new THREE.BoxGeometry(W,3,D),toon(0x8B5E3C));
    dirt.position.set(W/2,-2.5,0);
    cityGroup.add(dirt);
    cityColliders.push({x:W/2,z:0,hw:W/2,hd:D/2,h:1,y:0});
    // ---- Gaps ----
    var gaps=[[20,23],[45,48],[75,78],[100,103]];
    for(var gi=0;gi<gaps.length;gi++){
        var gx1=gaps[gi][0]*T,gx2=gaps[gi][1]*T,gw=gx2-gx1;
        // Visual pit
        var pit=new THREE.Mesh(new THREE.BoxGeometry(gw,4,D),toon(0x222222));
        pit.position.set(gx1+gw/2,-2,0);cityGroup.add(pit);
        // Remove ground collider for gap — add colliders on each side
        // (The main ground collider covers everything; we need to block the gap)
        // Actually easier: add invisible walls at gap edges that push player up
        // For now gaps are visual only — player falls through because ground collider is one big piece
        // Fix: use segmented ground colliders instead
    }
    // Rebuild ground as segments with gaps
    cityColliders.length=0;
    var gapSet=new Set();
    for(var ggi=0;ggi<gaps.length;ggi++)for(var gx=gaps[ggi][0];gx<gaps[ggi][1];gx++)gapSet.add(gx);
    var segStart=0,inSeg=false;
    for(var tx=0;tx<=L;tx++){
        var solid=!gapSet.has(tx)&&tx<L;
        if(solid&&!inSeg){segStart=tx;inSeg=true;}
        if(!solid&&inSeg){
            var sx=segStart*T,sw=(tx-segStart)*T;
            cityColliders.push({x:sx+sw/2,z:0,hw:sw/2,hd:D/2,h:1,y:0});
            inSeg=false;
        }
    }
    // ---- Brick platforms ----
    var plats=[[8,14,4],[28,35,5],[50,56,3],[60,68,5],[82,88,4],[92,98,6],[108,115,4]];
    for(var pi=0;pi<plats.length;pi++){
        var px1=plats[pi][0]*T,px2=plats[pi][1]*T,ph=plats[pi][2];
        var pw=px2-px1;
        var plat=new THREE.Mesh(new THREE.BoxGeometry(pw,1,D),toon(0xC4713B));
        plat.position.set(px1+pw/2,ph,0);cityGroup.add(plat);
        cityColliders.push({x:px1+pw/2,z:0,hw:pw/2,hd:D/2,h:1,y:ph});
    }
    // ---- Question blocks ----
    var qbs=[[10,5],[30,6],[52,4],[63,6],[85,5],[95,7],[110,5]];
    for(var qi=0;qi<qbs.length;qi++){
        var qx=qbs[qi][0]*T,qh=qbs[qi][1];
        var qb=new THREE.Mesh(new THREE.BoxGeometry(T,T,T),toon(0xFFD700));
        qb.position.set(qx,qh+T/2,0);cityGroup.add(qb);
        cityColliders.push({x:qx,z:0,hw:T/2,hd:T/2,h:T,y:qh});
        // Coin on top
        var coin=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.08,12),toon(0xFFDD00,{emissive:0xFFAA00,emissiveIntensity:0.3}));
        coin.position.set(qx,qh+T+0.5,0);coin.rotation.x=Math.PI/2;
        cityGroup.add(coin);
        cityCoins.push({mesh:coin,collected:false});
    }
    // ---- Pipes ----
    var pipes=[[18,3],[40,4],[70,3],[90,5]];
    for(var ppi=0;ppi<pipes.length;ppi++){
        var ppx=pipes[ppi][0]*T,pph=pipes[ppi][1]*T;
        var pipe=new THREE.Mesh(new THREE.CylinderGeometry(T*0.7,T*0.7,pph,12),toon(0x33AA33));
        pipe.position.set(ppx,pph/2,0);cityGroup.add(pipe);
        var rim=new THREE.Mesh(new THREE.CylinderGeometry(T*0.9,T*0.9,T*0.4,12),toon(0x44CC44));
        rim.position.set(ppx,pph+T*0.2,0);cityGroup.add(rim);
        cityColliders.push({x:ppx,z:0,hw:T*0.7,hd:T*0.7,h:pph+T*0.4,y:0});
    }
    // ---- Staircase ----
    for(var si=0;si<8;si++){
        var sh=(si+1)*T;
        var step=new THREE.Mesh(new THREE.BoxGeometry(T,sh,D),toon(0x8B5E3C));
        step.position.set((L-15+si)*T,sh/2,0);cityGroup.add(step);
        cityColliders.push({x:(L-15+si)*T,z:0,hw:T/2,hd:D/2,h:sh,y:0});
    }
    // ---- Flag pole ----
    var poleH=T*10;
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,poleH,6),toon(0x888888));
    pole.position.set((L-8)*T,poleH/2,0);cityGroup.add(pole);
    var flag=new THREE.Mesh(new THREE.PlaneGeometry(T*2,T),new THREE.MeshBasicMaterial({color:0xFF4444,side:THREE.DoubleSide}));
    flag.position.set((L-8)*T+T,poleH-T,0);cityGroup.add(flag);
    // ---- Castle ----
    var cw=T*6,ch2=T*5;
    var castle=new THREE.Mesh(new THREE.BoxGeometry(cw,ch2,D*1.5),toon(0xAA8866));
    castle.position.set((L-3)*T,ch2/2,0);cityGroup.add(castle);
    var door=new THREE.Mesh(new THREE.BoxGeometry(T*1.5,T*2.5,1),toon(0x442200));
    door.position.set((L-3)*T,T*1.25,D*0.76);cityGroup.add(door);
    // Castle turrets
    for(var ti=-1;ti<=1;ti+=2){
        var turret=new THREE.Mesh(new THREE.CylinderGeometry(T*0.6,T*0.8,T*2,8),toon(0x998877));
        turret.position.set((L-3)*T+ti*cw*0.35,ch2+T,0);cityGroup.add(turret);
        var cone=new THREE.Mesh(new THREE.ConeGeometry(T*0.8,T*1.5,8),toon(0xCC4444));
        cone.position.set((L-3)*T+ti*cw*0.35,ch2+T*2.5,0);cityGroup.add(cone);
    }
    // ---- Sky background ----
    var skyGeo=new THREE.PlaneGeometry(W+200,200);
    var skyGrad=new THREE.MeshBasicMaterial({color:0x87CEEB,side:THREE.DoubleSide});
    var sky=new THREE.Mesh(skyGeo,skyGrad);
    sky.position.set(W/2,50,-D*3);cityGroup.add(sky);
    // ---- Decorative clouds ----
    for(var ci2=0;ci2<15;ci2++){
        var cloud=new THREE.Group();
        for(var cp=0;cp<3;cp++){
            var cb=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2,8,6),toon(0xFFFFFF));
            cb.position.set(cp*2.5-2.5,Math.random()*0.5,0);cloud.add(cb);
        }
        cloud.position.set(Math.random()*W,25+Math.random()*20,-D*2-Math.random()*10);
        cityGroup.add(cloud);
    }
    // ---- Scatter some coins along the path ----
    for(var cci=0;cci<40;cci++){
        var ccx=10+Math.random()*(W-40);
        var ccy=1.2+Math.random()*3;
        // Skip if in a gap
        var inGap=false;
        for(var gci=0;gci<gaps.length;gci++){if(ccx/T>=gaps[gci][0]&&ccx/T<gaps[gci][1])inGap=true;}
        if(inGap)continue;
        var cc=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.08,12),toon(0xFFDD00,{emissive:0xFFAA00,emissiveIntensity:0.3}));
        cc.position.set(ccx,ccy,0);cc.rotation.x=Math.PI/2;
        cityGroup.add(cc);
        cityCoins.push({mesh:cc,collected:false});
    }
}

// ---- Side-view camera override ----
function _pfUpdateCamera(){
    if(!_pfActive||!playerEgg)return;
    // Restrict Z movement for all eggs
    var allE=[playerEgg].concat(cityNPCs);
    for(var i=0;i<allE.length;i++){
        if(!allE[i]||!allE[i].mesh)continue;
        allE[i].mesh.position.z=Math.max(-5,Math.min(5,allE[i].mesh.position.z));
        allE[i].vz*=0.3;
    }
    // Side-view camera tracking player
    var px=playerEgg.mesh.position.x;
    var py=Math.max(playerEgg.mesh.position.y+8,10);
    camera.position.x+=(px-camera.position.x)*0.08;
    camera.position.y+=(py-camera.position.y)*0.08;
    camera.position.z=45;
    camera.lookAt(new THREE.Vector3(camera.position.x,camera.position.y-4,0));
}

// ---- End platformer, return to city ----
function _pfEndGame(){
    _pfActive=false;
    currentCityStyle=_pfSavedCity>=0?_pfSavedCity:0;
    if(typeof switchCity==='function')switchCity(currentCityStyle);
}
